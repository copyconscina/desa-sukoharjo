"use client";

import { uploadImageAction } from "@/app/admin/actions";

export type ImageUploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadImageDirect(file: File): Promise<ImageUploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImageAction(formData);
    return result.success && result.url
      ? { success: true, url: result.url }
      : { success: false, error: result.error || "Gagal mengunggah foto." };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengunggah foto.",
    };
  }
}
