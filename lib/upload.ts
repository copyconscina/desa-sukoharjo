import { supabaseServer } from "@/utils/supabase/admin";
import sharp from "sharp";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // Allow up to 15MB input file since server compresses it down to ~300KB

export async function uploadSingleFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Tidak ada file yang diunggah.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, WebP, dll).");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file asli tidak boleh melebihi 15MB.");
  }

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let outputBuffer: Buffer = inputBuffer;
  let contentType = file.type;
  let fileExtension = file.name.split(".").pop() || "jpg";

  // Kompresi otomatis untuk semua format gambar raster menggunakan sharp
  if (file.type !== "image/svg+xml") {
    try {
      outputBuffer = await sharp(inputBuffer)
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
      console.warn("Gagal kompresi gambar dengan sharp, menggunakan buffer asli:", compressErr);
    }
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

export async function uploadMultipleFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    throw new Error("Tidak ada file yang diunggah.");
  }

  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    const url = await uploadSingleFile(file);
    urls.push(url);
  }
  return urls;
}

export async function uploadPdfFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Tidak ada file PDF yang diunggah.");
  }
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("File harus berupa dokumen PDF (.pdf).");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("Ukuran file PDF tidak boleh melebihi 25MB.");
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
    console.warn("Supabase storage PDF upload error, using Data URL fallback:", err);
  }

  // Fallback to Data URL if Supabase storage bucket is not active
  return `data:application/pdf;base64,${buffer.toString("base64")}`;
}
