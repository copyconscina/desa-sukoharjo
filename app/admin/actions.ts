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
} from "@/lib/db";
import { Umkm, Berita, GaleriItem } from "@/lib/data";
import {
  ADMIN_USER,
  ADMIN_PASS,
  checkAuth,
  setAuthSession,
  clearAuthSession,
  checkRateLimit,
  resetRateLimit,
} from "@/lib/auth";
import { uploadSingleFile, uploadMultipleFiles } from "@/lib/upload";

// Auth Actions
export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const rateCheck = checkRateLimit(username || "global");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${Math.ceil(
        (rateCheck.remainingSeconds || 900) / 60
      )} menit.`,
    };
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    resetRateLimit(username || "global");
    await setAuthSession();
    return { success: true };
  }

  return { success: false, error: "Username atau password salah!" };
}

export async function logoutAction() {
  await clearAuthSession();
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
