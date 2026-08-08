"use client";

import { createImageUploadUrlAction } from "@/app/admin/actions";
import { supabase } from "@/utils/supabase/static";

export type ImageUploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

async function compressImageInBrowser(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || typeof createImageBitmap !== "function") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });
    if (!compressedBlob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([compressedBlob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    // Keep the original file for formats the browser cannot decode, such as HEIC.
    return file;
  }
}

export async function uploadImageDirect(file: File): Promise<ImageUploadResult> {
  try {
    const uploadFile = await compressImageInBrowser(file);
    const signedUpload = await createImageUploadUrlAction(uploadFile.name, uploadFile.type);
    if (!signedUpload.success || !signedUpload.path || !signedUpload.token) {
      return { success: false, error: signedUpload.error || "Gagal menyiapkan upload foto." };
    }

    const { error: uploadError } = await supabase.storage
      .from("sukoharjo-assets")
      .uploadToSignedUrl(signedUpload.path, signedUpload.token, uploadFile, {
        contentType: uploadFile.type || undefined,
      });

    if (uploadError) {
      return { success: false, error: `Gagal mengunggah foto: ${uploadError.message}` };
    }

    const { data } = supabase.storage.from("sukoharjo-assets").getPublicUrl(signedUpload.path);
    return { success: true, url: data.publicUrl };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengunggah foto.",
    };
  }
}
