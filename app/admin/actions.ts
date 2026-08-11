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
import { headers } from "next/headers";
import { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_FILE_LABEL } from "@/lib/upload-limits";

async function checkPublicRateLimit(action: string) {
  const headerList = await headers();
  const clientIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headerList.get("x-real-ip")
    || "anonymous";
  return checkRateLimit(`${action}_${clientIp}`);
}

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
  const rateCheck = await checkPublicRateLimit("public_upload");
  if (!rateCheck.allowed) return { success: false, error: "Terlalu banyak unggahan. Silakan coba lagi beberapa menit lagi." };
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "Tidak ada foto yang diunggah." };
  }
  try {
    const url = await uploadSingleFile(file);
    return { success: true, url };
  } catch (err) {
    console.error("Gagal upload foto publik:", err);
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengunggah foto." };
  }
}

export async function addBukuTamuPublicAction(name: string, origin: string, message: string, consent: boolean) {
  const rateCheck = await checkPublicRateLimit("buku_tamu");
  if (!rateCheck.allowed) return { success: false, error: "Terlalu banyak kiriman. Silakan coba lagi beberapa menit lagi." };
  if (!name.trim() || !origin.trim() || !message.trim()) {
    return { success: false, error: "Mohon isi semua bidang yang wajib." };
  }
  if (!consent) return { success: false, error: "Persetujuan publikasi diperlukan untuk mengirim buku tamu." };
  if (name.trim().length > 100 || origin.trim().length > 150 || message.trim().length > 2_000) {
    return { success: false, error: "Isian melebihi batas karakter yang diperbolehkan." };
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
  foto?: string,
  consent?: boolean
) {
  const rateCheck = await checkPublicRateLimit("pengaduan");
  if (!rateCheck.allowed) return { success: false, error: "Terlalu banyak kiriman. Silakan coba lagi beberapa menit lagi." };
  if (!judul.trim() || !isi.trim()) {
    return { success: false, error: "Judul dan Rincian Laporan wajib diisi." };
  }
  if (!consent) return { success: false, error: "Persetujuan pemrosesan data diperlukan untuk mengirim pengaduan." };
  if (nama.trim().length > 100 || dusun.trim().length > 150 || judul.trim().length > 200 || isi.trim().length > 5_000) {
    return { success: false, error: "Isian melebihi batas karakter yang diperbolehkan." };
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
  const clientIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "global_ip";
  const ipRateLimitKey = `login_ip_${clientIp}`;
  const accountRateLimitKey = `login_account_${email.toLowerCase() || "unknown"}`;

  const [ipRateCheck, accountRateCheck] = await Promise.all([
    checkRateLimit(ipRateLimitKey),
    checkRateLimit(accountRateLimitKey),
  ]);
  const blockedCheck = !ipRateCheck.allowed ? ipRateCheck : !accountRateCheck.allowed ? accountRateCheck : null;
  if (blockedCheck) {
    return {
      success: false,
      error: `Terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${Math.ceil(
        (blockedCheck.remainingSeconds || 900) / 60
      )} menit.`,
    };
  }

  if (!email || !password || password.length < 8) {
    return { success: false, error: "Email atau password salah." };
  }

  const { data, error } = await loginWithSupabase(email, password);

  if (error || !data.user) {
    return { success: false, error: "Email atau password salah." };
  }

  await Promise.all([
    resetRateLimit(ipRateLimitKey),
    resetRateLimit(accountRateLimitKey),
  ]);
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

  validateBeritaInput(title, desc);
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

  validateBeritaInput(title, desc);
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

function validateBeritaInput(title: string, desc: string) {
  if (!title?.trim() || title.trim().length > 300) throw new Error("Judul berita tidak valid.");
  if (!desc?.trim()) throw new Error("Isi berita wajib diisi.");
  if (desc.length > 150_000) throw new Error("Isi berita terlalu panjang (maksimal 150.000 karakter).");
}

export async function uploadImageAction(formData: FormData) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file || file.size <= 0 || file.size > MAX_UPLOAD_FILE_BYTES) {
    return { success: false, error: `File tidak valid atau melebihi ${MAX_UPLOAD_FILE_LABEL}.` };
  }
  try {
    const url = await uploadSingleFile(file);
    return { success: true, url };
  } catch (err: unknown) {
    console.error("Failed to upload image:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengunggah foto.",
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
