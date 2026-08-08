"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addBerita,
  updateBerita,
  deleteBerita,
  addGaleri,
  updateGaleri,
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
  addPengaduan,
  updateStatusPengaduan,
  deletePengaduan,
  updateApbdesRingkasan,
  saveApbdesBidang,
  deleteApbdesBidang,
  saveProdukHukum,
  deleteProdukHukum,
  updateStatistikPenduduk,
} from "@/lib/db";
import {
  Umkm,
  Berita,
  GaleriItem,
  Lembaga,
  Agenda,
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  StatistikPenduduk,
} from "@/lib/data";
import {
  checkAuth,
  loginWithSupabase,
  logoutWithSupabase,
  checkRateLimit,
  resetRateLimit,
} from "@/lib/auth";
import { uploadSingleFile, uploadPdfFile } from "@/lib/upload";
import { supabaseServer } from "@/utils/supabase/admin";
import { headers } from "next/headers";

export async function uploadPdfAction(formData: FormData) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  try {
    if (!file || file.size === 0) {
      throw new Error("File PDF wajib diunggah.");
    }

    const fileUrl = await uploadPdfFile(file);
    return { success: true, url: fileUrl };
  } catch (err: unknown) {
    console.error("Failed to upload PDF:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengunggah dokumen PDF.",
    };
  }
}

// Public Actions for Citizens (No Admin Auth Required)
export async function uploadPublicFotoAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "Tidak ada foto yang diunggah." };
  }
  try {
    const url = await uploadSingleFile(file);
    return { success: true, url };
  } catch (err: any) {
    console.error("Gagal upload foto publik:", err);
    return { success: false, error: err.message || "Gagal mengunggah foto." };
  }
}

export async function addBukuTamuPublicAction(name: string, origin: string, message: string) {
  if (!name.trim() || !origin.trim() || !message.trim()) {
    return { success: false, error: "Mohon isi semua bidang yang wajib." };
  }
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const saved = await addBukuTamu({
    name: name.trim(),
    origin: origin.trim(),
    message: message.trim(),
    date: dateStr,
  });
  revalidateAll();
  return { success: true, item: saved };
}

export async function addPengaduanPublicAction(
  nama: string,
  dusun: string,
  judul: string,
  isi: string,
  foto?: string
) {
  if (!judul.trim() || !isi.trim()) {
    return { success: false, error: "Judul dan Rincian Laporan wajib diisi." };
  }
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const saved = await addPengaduan({
    nama: nama.trim() || "Warga Anonim",
    dusun: dusun.trim() || "Sukoharjo",
    judul: judul.trim(),
    isi: isi.trim(),
    tanggal: dateStr,
    foto: foto?.trim() || undefined,
    image: foto?.trim() || undefined,
  });
  revalidateAll();
  return { success: true, item: saved };
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

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

  revalidateAll();
  return { success: true, item: saved };
}

export async function updateBeritaAction(id: number, tag: string, title: string, desc: string, images?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const updatedBerita: Omit<Berita, "id" | "date"> & { date?: string } = {
    tag,
    cls: tag.toLowerCase() === "pengumuman" ? "pengumuman" : tag.toLowerCase() === "pembangunan" ? "pembangunan" : "",
    title,
    desc,
    images,
  };

  const saved = await updateBerita(id, updatedBerita);
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteBeritaAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteBerita(id);
  revalidateAll();
  return { success: true };
}

// Galeri Actions
export async function addGaleriAction(label: string, cat: string, grad: string, image?: string, desc?: string, images?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const newItem: GaleriItem = {
    label,
    cat,
    grad,
    image: images ? images.split(",")[0].trim() : image,
    images: images || image,
    desc,
  };

  const saved = await addGaleri(newItem);
  revalidateAll();
  return { success: true, item: saved };
}

export async function updateGaleriAction(
  id: number,
  label: string,
  cat: string,
  grad: string,
  image?: string,
  desc?: string,
  images?: string
) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await updateGaleri(id, {
    label,
    cat,
    grad,
    image: images ? images.split(",")[0].trim() : image,
    images: images || image,
    desc,
  });
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteGaleriAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteGaleri(id);
  revalidateAll();
  return { success: true };
}

// Potensi Actions
export async function updatePotensiAction(num: string, title: string, desc: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updatePotensi(num, title, desc);
  revalidateAll();
  return { success: true };
}

// UMKM Actions
export async function saveUmkmAction(itemData: Omit<Umkm, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveUmkm(itemData);
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteUmkmAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteUmkm(id);
  revalidateAll();
  return { success: true };
}

export async function createImageUploadUrlAction(fileName: string, contentType: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const extension = (fileName.split(".").pop() || "").toLowerCase();
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "jfif", "avif", "heic", "gif", "svg", "bmp", "tif", "tiff"]);
  if (!contentType.startsWith("image/") && !allowedExtensions.has(extension)) {
    return { success: false, error: "File harus berupa gambar (JPG, JPEG, PNG, WebP, dll)." };
  }

  const objectPath = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension || "jpg"}`;
  try {
    const { data, error } = await supabaseServer.storage
      .from("sukoharjo-assets")
      .createSignedUploadUrl(objectPath);
    if (error || !data) {
      throw new Error(error?.message || "Gagal menyiapkan upload foto.");
    }
    return { success: true, path: data.path, token: data.token };
  } catch (err: unknown) {
    console.error("Failed to create image upload URL:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyiapkan upload foto.",
    };
  }
}

// PROFIL & LEMBAGA ACTIONS
export async function saveLembagaAction(item: Omit<Lembaga, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveLembaga(item);
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteLembagaAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteLembaga(id);
  revalidateAll();
  return { success: true };
}

export async function updateProfilVisiMisiAction(visi: string, misi: string[]) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateProfilVisiMisi({ visi, misi });
  revalidateAll();
  return { success: true };
}

// LAYANAN ACTIONS
export async function saveAgendaAction(item: Omit<Agenda, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveAgenda(item);
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteAgendaAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteAgenda(id);
  revalidateAll();
  return { success: true };
}

export async function deleteBukuTamuAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteBukuTamu(id);
  revalidateAll();
  return { success: true };
}

export async function updateStatusPengaduanAction(id: number, status: Pengaduan["status"], tanggapan?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateStatusPengaduan(id, status, tanggapan);
  revalidateAll();
  return { success: true };
}

export async function deletePengaduanAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deletePengaduan(id);
  revalidateAll();
  return { success: true };
}

// TRANSPARANSI ACTIONS
export async function updateApbdesRingkasanAction(data: ApbdesRingkasan) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateApbdesRingkasan(data);
  revalidateAll();
  return { success: true };
}

export async function saveApbdesBidangAction(item: Omit<ApbdesBidang, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveApbdesBidang(item);
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteApbdesBidangAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteApbdesBidang(id);
  revalidateAll();
  return { success: true };
}

export async function saveProdukHukumAction(item: Omit<ProdukHukum, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const saved = await saveProdukHukum(item);
  revalidateAll();
  return { success: true, item: saved };
}

export async function deleteProdukHukumAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteProdukHukum(id);
  revalidateAll();
  return { success: true };
}

export async function updateStatistikPendudukAction(dataInput: StatistikPenduduk) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updateStatistikPenduduk(dataInput);
  revalidateAll();
  return { success: true };
}
