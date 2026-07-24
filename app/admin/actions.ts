"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addBerita,
  deleteBerita,
  addGaleri,
  deleteGaleri,
  updatePotensi,
  saveUmkm,
  deleteUmkm,
  saveLembaga,
  deleteLembaga,
  updateProfilVisiMisi,
  saveAgenda,
  deleteAgenda,
  addBukuTamu,
  deleteBukuTamu,
  addPermohonanSurat,
  updateStatusSurat,
  deletePermohonanSurat,
  addPengaduan,
  updateStatusPengaduan,
  deletePengaduan,
  updateApbdesRingkasan,
  saveApbdesBidang,
  deleteApbdesBidang,
  saveProdukHukum,
  deleteProdukHukum,
  savePpid,
  deletePpid,
  saveBansos,
  deleteBansos,
} from "@/lib/db";
import {
  Umkm,
  Berita,
  GaleriItem,
  Lembaga,
  Agenda,
  PermohonanSurat,
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  PpidItem,
  BansosItem,
} from "@/lib/data";
import {
  checkAuth,
  loginWithSupabase,
  logoutWithSupabase,
  checkRateLimit,
  resetRateLimit,
} from "@/lib/auth";
import { uploadSingleFile, uploadMultipleFiles } from "@/lib/upload";
import { headers } from "next/headers";

// Auth Actions
export async function loginAction(formData: FormData) {
  const email = ((formData.get("email") as string) || (formData.get("username") as string) || "").trim();
  const password = (formData.get("password") as string) || "";

  const headerList = await headers();
  const clientIp = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "global_ip";
  const rateLimitKey = `${clientIp}_${email || 'user'}`;

  const rateCheck = checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${Math.ceil(
        (rateCheck.remainingSeconds || 900) / 60
      )} menit.`,
    };
  }

  const { data, error } = await loginWithSupabase(email, password);

  if (error || !data.user) {
    return { success: false, error: error?.message || "Email atau password salah!" };
  }

  resetRateLimit(rateLimitKey);
  return { success: true };
}

export async function logoutAction() {
  await logoutWithSupabase();
  redirect("/admin/login");
}

export async function checkAuthAction(): Promise<boolean> {
  return checkAuth();
}

// Berita Actions
export async function addBeritaAction(tag: string, title: string, desc: string, images?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const newBerita: Omit<Berita, "date"> & { date?: string } = {
    tag,
    cls: tag.toLowerCase() === "pengumuman" ? "pengumuman" : tag.toLowerCase() === "pembangunan" ? "pembangunan" : "",
    title,
    desc,
    images,
  };

  const saved = await addBerita(newBerita);
  
  revalidatePath("/");
  revalidatePath("/berita");
  return { success: true, item: saved };
}

export async function deleteBeritaAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteBerita(id);

  revalidatePath("/");
  revalidatePath("/berita");
  return { success: true };
}

// Galeri Actions
export async function addGaleriAction(label: string, cat: string, grad: string, image?: string, desc?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const newItem: GaleriItem = {
    label,
    cat,
    grad,
    image,
    desc,
  };

  await addGaleri(newItem);

  revalidatePath("/");
  revalidatePath("/galeri");
  return { success: true };
}

export async function deleteGaleriAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteGaleri(id);

  revalidatePath("/");
  revalidatePath("/galeri");
  return { success: true };
}

// Potensi Actions
export async function updatePotensiAction(num: string, title: string, desc: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updatePotensi(num, title, desc);

  revalidatePath("/");
  revalidatePath("/potensi");
  return { success: true };
}

// UMKM Actions
export async function saveUmkmAction(itemData: Omit<Umkm, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveUmkm(itemData);

  revalidatePath("/");
  revalidatePath("/umkm");
  if (itemData.id) {
    revalidatePath(`/umkm/${itemData.id}`);
  }
  return { success: true, item: saved };
}

export async function deleteUmkmAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteUmkm(id);

  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath(`/umkm/${id}`);
  return { success: true };
}

export async function uploadImageAction(formData: FormData) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  try {
    const url = await uploadSingleFile(file);
    return { success: true, url };
  } catch (err: any) {
    console.error("Failed to upload image:", err);
    return { success: false, error: err.message || "Gagal mengunggah foto." };
  }
}

export async function uploadMultipleImagesAction(formData: FormData) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const files = formData.getAll("files") as File[];
  try {
    const urls = await uploadMultipleFiles(files);
    return { success: true, urls };
  } catch (err: any) {
    console.error("Failed to upload images:", err);
    return { success: false, error: err.message || "Gagal mengunggah satu atau beberapa gambar." };
  }
}

// PROFIL & LEMBAGA ACTIONS
export async function saveLembagaAction(item: Omit<Lembaga, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveLembaga(item);
  revalidatePath("/");
  revalidatePath("/lembaga");
  revalidatePath("/profil");
  return { success: true, item: saved };
}

export async function deleteLembagaAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteLembaga(id);
  revalidatePath("/");
  revalidatePath("/lembaga");
  revalidatePath("/profil");
  return { success: true };
}

export async function updateProfilVisiMisiAction(visi: string, misi: string[]) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateProfilVisiMisi(visi, misi);
  revalidatePath("/");
  revalidatePath("/profil");
  return { success: true };
}

// LAYANAN ACTIONS
export async function saveAgendaAction(item: Omit<Agenda, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveAgenda(item);
  revalidatePath("/");
  revalidatePath("/agenda");
  return { success: true, item: saved };
}

export async function deleteAgendaAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteAgenda(id);
  revalidatePath("/");
  revalidatePath("/agenda");
  return { success: true };
}

export async function deleteBukuTamuAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteBukuTamu(id);
  revalidatePath("/buku-tamu");
  return { success: true };
}

export async function updateStatusSuratAction(id: number, status: PermohonanSurat["status"], catatan?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateStatusSurat(id, status, catatan);
  revalidatePath("/layanan-surat");
  return { success: true };
}

export async function deletePermohonanSuratAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deletePermohonanSurat(id);
  revalidatePath("/layanan-surat");
  return { success: true };
}

export async function updateStatusPengaduanAction(id: number, status: Pengaduan["status"], tanggapan?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateStatusPengaduan(id, status, tanggapan);
  revalidatePath("/pengaduan");
  return { success: true };
}

export async function deletePengaduanAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deletePengaduan(id);
  revalidatePath("/pengaduan");
  return { success: true };
}

// TRANSPARANSI ACTIONS
export async function updateApbdesRingkasanAction(data: ApbdesRingkasan) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateApbdesRingkasan(data);
  revalidatePath("/");
  revalidatePath("/apbdes");
  return { success: true };
}

export async function saveApbdesBidangAction(item: Omit<ApbdesBidang, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveApbdesBidang(item);
  revalidatePath("/");
  revalidatePath("/apbdes");
  return { success: true, item: saved };
}

export async function deleteApbdesBidangAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteApbdesBidang(id);
  revalidatePath("/");
  revalidatePath("/apbdes");
  return { success: true };
}

export async function saveProdukHukumAction(item: Omit<ProdukHukum, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveProdukHukum(item);
  revalidatePath("/produk-hukum");
  return { success: true, item: saved };
}

export async function deleteProdukHukumAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteProdukHukum(id);
  revalidatePath("/produk-hukum");
  return { success: true };
}

export async function savePpidAction(item: Omit<PpidItem, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await savePpid(item);
  revalidatePath("/ppid");
  return { success: true, item: saved };
}

export async function deletePpidAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deletePpid(id);
  revalidatePath("/ppid");
  return { success: true };
}

export async function saveBansosAction(item: Omit<BansosItem, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveBansos(item);
  revalidatePath("/bansos");
  return { success: true, item: saved };
}

export async function deleteBansosAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteBansos(id);
  revalidatePath("/bansos");
  return { success: true };
}
