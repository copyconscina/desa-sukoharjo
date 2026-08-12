/**
 * lib/data.ts
 *
 * Re-ekspor tipe dari lib/schemas.ts agar kompatibel dengan semua
 * import yang sudah ada di seluruh codebase.
 *
 * Tipe sekarang diturunkan dari Zod schema sehingga compile-time type
 * dan runtime validation selalu sinkron.
 */

export type {
  Umkm,
  Berita,
  GaleriItem,
  Potensi,
  Lembaga,
  ProfilDesa,
  Agenda,
  BukuTamu,
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  StatistikPenduduk,
  PopData,
} from "./schemas";

export { STAT, popData } from "./schemas";
