"use client";

import { createImageUploadUrlAction } from "@/app/admin/actions";
import { supabase } from "@/utils/supabase/static";

export type ImageUploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadImageDirect(file: File): Promise<ImageUploadResult> {
  try {
    const signedUpload = await createImageUploadUrlAction(file.name, file.type);
    if (!signedUpload.success || !signedUpload.path || !signedUpload.token) {
      return { success: false, error: signedUpload.error || "Gagal menyiapkan upload foto." };
    }

    const { error: uploadError } = await supabase.storage
      .from("sukoharjo-assets")
      .uploadToSignedUrl(signedUpload.path, signedUpload.token, file, {
        contentType: file.type || undefined,
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
