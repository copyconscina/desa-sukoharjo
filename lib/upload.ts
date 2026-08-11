import { supabaseServer } from "@/utils/supabase/admin";
import { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_FILE_LABEL } from "@/lib/upload-limits";

export async function uploadSingleFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Tidak ada file yang diunggah.");
  }

  const fileExt = (file.name.split(".").pop() || "").toLowerCase();
  const isImageByExt = ["jpg", "jpeg", "png", "webp", "jfif", "avif", "heic", "gif", "bmp", "tif", "tiff"].includes(fileExt);

  if (!file.type.startsWith("image/") && !isImageByExt) {
    throw new Error("File harus berupa gambar (JPG, JPEG, PNG, WebP, dll).");
  }
  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    throw new Error(`Ukuran file asli tidak boleh melebihi ${MAX_UPLOAD_FILE_LABEL}.`);
  }

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let outputBuffer: Buffer = inputBuffer;
  let contentType = file.type;
  let fileExtension = file.name.split(".").pop() || "jpg";

  // Decode and re-encode raster uploads to verify their content and remove
  // untrusted metadata. Do not fall back to the original binary on failure.
  try {
      // Load sharp only when compression is needed. Some serverless runtimes
      // cannot load its native binary; uploads should still work without it.
      const sharp = (await import("sharp")).default;
      outputBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();

      contentType = "image/webp";
      fileExtension = "webp";
  } catch (compressErr) {
    console.warn("Gagal memvalidasi gambar dengan sharp:", compressErr);
    throw new Error("File gambar tidak valid atau formatnya tidak didukung.");
  }

  const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

  // Upload file yang sudah dikompresi ke Supabase Storage bucket 'sukoharjo-assets'
  const { error: uploadError } = await supabaseServer.storage
    .from("sukoharjo-assets")
    .upload(uniqueFilename, outputBuffer, {
      contentType,
      duplex: "half",
    } as any);

  if (uploadError) {
    throw new Error(`Gagal mengunggah foto ke storage: ${uploadError.message}`);
  }

  // Get the public URL of the uploaded image
  const { data: publicUrlData } = supabaseServer.storage
    .from("sukoharjo-assets")
    .getPublicUrl(uniqueFilename);

  return publicUrlData.publicUrl;
}

export async function uploadPdfFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Tidak ada file PDF yang diunggah.");
  }
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("File harus berupa dokumen PDF (.pdf).");
  }
  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    throw new Error(`Ukuran file PDF tidak boleh melebihi ${MAX_UPLOAD_FILE_LABEL}.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uniqueFilename = `documents/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.pdf`;

  try {
    const { error: uploadError } = await supabaseServer.storage
      .from("sukoharjo-assets")
      .upload(uniqueFilename, buffer, {
        contentType: "application/pdf",
        duplex: "half",
      } as any);

    if (!uploadError) {
      const { data: publicUrlData } = supabaseServer.storage
        .from("sukoharjo-assets")
        .getPublicUrl(uniqueFilename);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.error("Supabase storage PDF upload error:", err);
  }

  // Never store a large base64 document in database fields as a fallback.
  throw new Error("Gagal mengunggah PDF ke penyimpanan. Pastikan bucket sukoharjo-assets aktif.");
}
