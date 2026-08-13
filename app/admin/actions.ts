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
  archiveItems,
  getArchivedItems,
  restoreArchivedItem,
  type ArchivedItemType,
} from "@/lib/db";
import {
  UmkmSchema,
  BeritaSchema,
  GaleriItemSchema,
  LembagaSchema,
  AgendaSchema,
  BukuTamuInputSchema,
  PengaduanInputSchema,
  PengaduanSchema,
  ApbdesRingkasanSchema,
  ApbdesBidangSchema,
  ProdukHukumSchema,
  StatistikPendudukSchema,
  ProfilDesaSchema,
  type Umkm,
  type Berita,
  type GaleriItem,
  type Lembaga,
  type Agenda,
  type Pengaduan,
  type ApbdesRingkasan,
  type ApbdesBidang,
  type ProdukHukum,
  type StatistikPenduduk,
} from "@/lib/schemas";
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
import { z } from "zod";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Format ZodError menjadi pesan error tunggal yang ramah pengguna. */
function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message ?? "Data tidak valid.";
}

/** Cek rate limit berdasarkan IP dari header request. */
async function checkPublicRateLimit(action: string) {
  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "anonymous";
  return checkRateLimit(`${action}_${clientIp}`);
}

// ─── Upload Actions ───────────────────────────────────────────────────────────

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

/** Upload foto oleh warga (publik, tanpa auth). */
export async function uploadPublicFotoAction(formData: FormData) {
  const rateCheck = await checkPublicRateLimit("public_upload");
  if (!rateCheck.allowed)
    return { success: false, error: "Terlalu banyak unggahan. Silakan coba lagi beberapa menit lagi." };

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

// ─── Public Actions ───────────────────────────────────────────────────────────

export async function addBukuTamuPublicAction(
  name: string,
  origin: string,
  message: string,
  consent: boolean
) {
  const rateCheck = await checkPublicRateLimit("buku_tamu");
  if (!rateCheck.allowed)
    return { success: false, error: "Terlalu banyak kiriman. Silakan coba lagi beberapa menit lagi." };

  // Validasi dengan Zod
  const result = BukuTamuInputSchema.safeParse({ name, origin, message, consent });
  if (!result.success) {
    return { success: false, error: formatZodError(result.error) };
  }

  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const saved = await addBukuTamu({
    name: result.data.name,
    origin: result.data.origin,
    message: result.data.message,
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
  if (!rateCheck.allowed)
    return { success: false, error: "Terlalu banyak kiriman. Silakan coba lagi beberapa menit lagi." };

  // Validasi dengan Zod
  const result = PengaduanInputSchema.safeParse({ nama, dusun, judul, isi, foto, consent });
  if (!result.success) {
    return { success: false, error: formatZodError(result.error) };
  }

  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const saved = await addPengaduan({
    nama: result.data.nama,
    dusun: result.data.dusun,
    judul: result.data.judul,
    isi: result.data.isi,
    tanggal: dateStr,
    foto: result.data.foto,
    image: result.data.foto,
  });

  revalidateAll();
  return { success: true, item: saved };
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = (
    (formData.get("email") as string) ||
    (formData.get("username") as string) ||
    ""
  ).trim();
  const password = (formData.get("password") as string) || "";

  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "global_ip";
  const ipRateLimitKey = `login_ip_${clientIp}`;
  const accountRateLimitKey = `login_account_${email.toLowerCase() || "unknown"}`;

  const [ipRateCheck, accountRateCheck] = await Promise.all([
    checkRateLimit(ipRateLimitKey),
    checkRateLimit(accountRateLimitKey),
  ]);
  const blockedCheck = !ipRateCheck.allowed
    ? ipRateCheck
    : !accountRateCheck.allowed
    ? accountRateCheck
    : null;
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

  await Promise.all([resetRateLimit(ipRateLimitKey), resetRateLimit(accountRateLimitKey)]);
  return { success: true };
}

export async function logoutAction() {
  await logoutWithSupabase();
  redirect("/admin/login");
}

export async function checkAuthAction(): Promise<boolean> {
  return checkAuth();
}

// ─── Berita Actions ───────────────────────────────────────────────────────────

export async function addBeritaAction(tag: string, title: string, desc: string, images?: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = BeritaSchema.omit({ id: true, date: true, publishedAt: true }).safeParse({
    tag,
    title,
    desc,
    images,
  });
  if (!result.success) throw new Error(formatZodError(result.error));

  const newBerita: Omit<Berita, "date"> & { date?: string } = {
    tag: result.data.tag,
    cls:
      result.data.tag.toLowerCase() === "pengumuman"
        ? "pengumuman"
        : result.data.tag.toLowerCase() === "pembangunan"
        ? "pembangunan"
        : "",
    title: result.data.title,
    desc: result.data.desc,
    images: result.data.images,
  };

  const saved = await addBerita(newBerita);
  revalidateAll();
  return { success: true, item: saved };
}

export async function updateBeritaAction(
  id: number,
  tag: string,
  title: string,
  desc: string,
  images?: string
) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = BeritaSchema.omit({ id: true, date: true, publishedAt: true }).safeParse({
    tag,
    title,
    desc,
    images,
  });
  if (!result.success) throw new Error(formatZodError(result.error));

  const updatedBerita: Omit<Berita, "id" | "date"> & { date?: string } = {
    tag: result.data.tag,
    cls:
      result.data.tag.toLowerCase() === "pengumuman"
        ? "pengumuman"
        : result.data.tag.toLowerCase() === "pembangunan"
        ? "pembangunan"
        : "",
    title: result.data.title,
    desc: result.data.desc,
    images: result.data.images,
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

// ─── Galeri Actions ───────────────────────────────────────────────────────────

export async function addGaleriAction(
  label: string,
  cat: string,
  grad: string,
  image?: string,
  desc?: string,
  images?: string
) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = GaleriItemSchema.omit({ id: true }).safeParse({ label, cat, grad, image, desc, images });
  if (!result.success) throw new Error(formatZodError(result.error));

  const newItem: GaleriItem = {
    ...result.data,
    image: result.data.images ? result.data.images.split(",")[0].trim() : result.data.image,
    images: result.data.images || result.data.image,
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

  const result = GaleriItemSchema.omit({ id: true }).safeParse({ label, cat, grad, image, desc, images });
  if (!result.success) throw new Error(formatZodError(result.error));

  const saved = await updateGaleri(id, {
    ...result.data,
    image: result.data.images ? result.data.images.split(",")[0].trim() : result.data.image,
    images: result.data.images || result.data.image,
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

// ─── Potensi Actions ──────────────────────────────────────────────────────────

export async function updatePotensiAction(num: string, title: string, desc: string) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await updatePotensi(num, title, desc);
  revalidateAll();
  return { success: true };
}

// ─── UMKM Actions ─────────────────────────────────────────────────────────────

export async function saveUmkmAction(itemData: Omit<Umkm, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = UmkmSchema.safeParse(itemData);
  if (!result.success) throw new Error(formatZodError(result.error));

  const saved = await saveUmkm(result.data as Omit<Umkm, "id"> & { id?: number });
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

// ─── Profil & Lembaga Actions ─────────────────────────────────────────────────

export async function saveLembagaAction(item: Omit<Lembaga, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = LembagaSchema.safeParse(item);
  if (!result.success) throw new Error(formatZodError(result.error));

  const saved = await saveLembaga(result.data as Omit<Lembaga, "id"> & { id?: number });
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

  const result = ProfilDesaSchema.safeParse({ visi, misi });
  if (!result.success) throw new Error(formatZodError(result.error));

  await updateProfilVisiMisi({ visi: result.data.visi, misi: result.data.misi });
  revalidateAll();
  return { success: true };
}

// ─── Agenda Actions ───────────────────────────────────────────────────────────

export async function saveAgendaAction(item: Omit<Agenda, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = AgendaSchema.safeParse(item);
  if (!result.success) throw new Error(formatZodError(result.error));

  const saved = await saveAgenda(result.data as Omit<Agenda, "id"> & { id?: number });
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

// ─── Buku Tamu Actions ────────────────────────────────────────────────────────

export async function deleteBukuTamuAction(id: number) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  await deleteBukuTamu(id);
  revalidateAll();
  return { success: true };
}

// ─── Pengaduan Actions ────────────────────────────────────────────────────────

export async function updateStatusPengaduanAction(
  id: number,
  status: Pengaduan["status"],
  tanggapan?: string
) {
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

// ─── Transparansi Actions ─────────────────────────────────────────────────────

export async function updateApbdesRingkasanAction(data: ApbdesRingkasan) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = ApbdesRingkasanSchema.safeParse(data);
  if (!result.success) throw new Error(formatZodError(result.error));

  await updateApbdesRingkasan(result.data);
  revalidateAll();
  return { success: true };
}

export async function saveApbdesBidangAction(item: Omit<ApbdesBidang, "id"> & { id?: number }) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  const result = ApbdesBidangSchema.safeParse(item);
  if (!result.success) throw new Error(formatZodError(result.error));

  const saved = await saveApbdesBidang(result.data as Omit<ApbdesBidang, "id"> & { id?: number });
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

  const result = ProdukHukumSchema.safeParse(item);
  if (!result.success) throw new Error(formatZodError(result.error));

  const saved = await saveProdukHukum(result.data as Omit<ProdukHukum, "id"> & { id?: number });
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

  const result = StatistikPendudukSchema.safeParse(dataInput);
  if (!result.success) throw new Error(formatZodError(result.error));

  await updateStatistikPenduduk(result.data);
  revalidateAll();
  return { success: true };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ─── Arsip Backup Actions ─────────────────────────────────────────────────────

/**
 * Arsipkan item terpilih dari galeri, UMKM, dan produk hukum.
 * Item yang diarsipkan langsung disembunyikan dari tampilan publik.
 */
export async function archiveForBackupAction(
  galeriIds: number[],
  umkmIds: number[],
  produkHukumIds: number[]
) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  if (galeriIds.length + umkmIds.length + produkHukumIds.length === 0) {
    return { success: false, error: "Tidak ada item yang dipilih." };
  }

  try {
    const result = await archiveItems(galeriIds, umkmIds, produkHukumIds);
    revalidateAll();
    return { success: true, archived: result.archived };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengarsipkan item.",
    };
  }
}

/** Ambil daftar item yang sedang dalam status arsip (belum dihapus permanen). */
export async function getArchivedItemsAction() {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  try {
    const items = await getArchivedItems();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengambil data arsip.",
      items: [],
    };
  }
}

/** Restore satu item dari arsip — item kembali tampil di website publik. */
export async function undoArchiveAction(id: number, type: ArchivedItemType) {
  const isAuth = await checkAuthAction();
  if (!isAuth) throw new Error("Unauthorized");

  try {
    await restoreArchivedItem(id, type);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal merestore item.",
    };
  }
}
