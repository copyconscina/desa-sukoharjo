import { supabaseServer } from "@/utils/supabase/admin";
import { parseImagesList } from "@/lib/utils";

const BUCKET = "sukoharjo-assets";

/**
 * Mengambil path relatif di dalam bucket Storage dari sebuah public URL
 * Supabase, mis. ".../storage/v1/object/public/sukoharjo-assets/1699.webp"
 * -> "1699.webp". Mengembalikan null jika URL bukan berasal dari bucket ini
 * (mis. gambar eksternal), sehingga tidak pernah keliru menghapus file lain.
 */
function extractStoragePath(url: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rawPath = url.slice(idx + marker.length).split("?")[0];
  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

/**
 * Tabel & kolom yang berpotensi menyimpan URL file dari bucket
 * sukoharjo-assets. Berita dan Galeri sengaja saling terhubung (foto berita
 * otomatis disalin sebagai entri Galeri), sehingga sebuah URL gambar bisa
 * dipakai oleh lebih dari satu baris/tabel sekaligus.
 */
const REFERENCE_SOURCES: { table: string; columns: string[] }[] = [
  { table: "berita", columns: ["images"] },
  { table: "galeri", columns: ["image", "images"] },
  { table: "umkm", columns: ["image", "images"] },
  { table: "pengaduan", columns: ["foto", "image"] },
  { table: "produk_hukum", columns: ["fileUrl", "file_url"] },
];

async function isUrlStillReferenced(url: string): Promise<boolean> {
  for (const source of REFERENCE_SOURCES) {
    for (const column of source.columns) {
      try {
        const { count, error } = await supabaseServer
          .from(source.table)
          .select("id", { count: "exact", head: true })
          .ilike(column, `%${url}%`);
        if (!error && (count || 0) > 0) return true;
      } catch {
        // Kolom/tabel mungkin tidak ada di skema tertentu; abaikan dan lanjut.
      }
    }
  }
  return false;
}

/**
 * Menghapus file di Supabase Storage yang sudah tidak dirujuk oleh baris
 * manapun di database, untuk mencegah file "yatim" menumpuk memenuhi kuota
 * Storage setiap kali foto/dokumen dihapus atau diganti dari panel admin.
 *
 * PENTING: fungsi ini harus dipanggil SETELAH operasi delete/update ke
 * database berhasil dikonfirmasi. Dengan begitu, baris yang baru saja
 * dihapus/diubah otomatis tidak lagi terhitung sebagai "masih dipakai" saat
 * pengecekan referensi dijalankan.
 */
export async function cleanupUnusedStorageUrls(
  urlsInput: string | string[] | null | undefined
): Promise<void> {
  const list = parseImagesList(urlsInput);
  if (list.length === 0) return;

  const pathsToRemove: string[] = [];

  for (const url of list) {
    const path = extractStoragePath(url);
    if (!path) continue; // Bukan file dari bucket kita -> jangan disentuh.

    try {
      const stillUsed = await isUrlStillReferenced(url);
      if (!stillUsed) {
        pathsToRemove.push(path);
      }
    } catch (err) {
      console.error(`Gagal memeriksa referensi penyimpanan untuk ${url}:`, err);
    }
  }

  if (pathsToRemove.length === 0) return;

  const { error } = await supabaseServer.storage.from(BUCKET).remove(pathsToRemove);
  if (error) {
    console.error("Gagal membersihkan file storage yang tidak terpakai:", error.message);
  }
}
