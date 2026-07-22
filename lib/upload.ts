import { supabaseServer } from "@/utils/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadSingleFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Tidak ada file yang diunggah.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar tidak boleh melebihi 5MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, WebP, dll).");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = file.name.split(".").pop();
  const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

  // Upload to Supabase Storage bucket 'sukoharjo-assets'
  const { error: uploadError } = await supabaseServer.storage
    .from("sukoharjo-assets")
    .upload(uniqueFilename, buffer, {
      contentType: file.type,
      duplex: "half", // standard option for node streams
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
