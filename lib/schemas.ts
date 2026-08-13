/**
 * lib/schemas.ts
 *
 * Single source of truth untuk tipe data dan validasi runtime.
 * Semua tipe diturunkan dari schema Zod via `z.infer<>` sehingga
 * tidak ada gap antara compile-time type dan runtime validation.
 *
 * Kompatibel dengan Zod v4.
 */

import { z } from "zod";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Ubah string kosong menjadi undefined (berguna untuk field opsional) */
const optionalStr = z
  .string()
  .optional()
  .transform((v) => (v?.trim() === "" ? undefined : v?.trim()));

/** String wajib, otomatis di-trim */
function reqStr(label: string, max = 500) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(max, `${label} melebihi batas ${max} karakter.`);
}

/** URL gambar opsional – boleh kosong, kalau ada harus https:// */
const imageUrlOpt = z
  .string()
  .optional()
  .transform((v) => (v?.trim() === "" ? undefined : v?.trim()))
  .refine(
    (v) => v === undefined || v.startsWith("https://"),
    "URL gambar harus diawali https://"
  );

// ─── UMKM ────────────────────────────────────────────────────────────────────

export const UmkmSchema = z.object({
  /** id ada saat update, tidak ada saat create */
  id: z.number().int().positive().optional(),
  name: reqStr("Nama UMKM", 200),
  owner: reqStr("Nama pemilik", 150),
  category: reqStr("Kategori", 100),
  year: z
    .number({ error: "Tahun harus angka." })
    .int("Tahun harus bilangan bulat.")
    .min(1900, "Tahun tidak valid.")
    .max(new Date().getFullYear() + 1, "Tahun tidak valid."),
  product: reqStr("Produk unggulan", 300),
  tagline: optionalStr,
  desc: reqStr("Deskripsi", 5_000),
  address: reqStr("Alamat", 500),
  wa: optionalStr,
  phone: optionalStr,
  mapsUrl: optionalStr,
  maps_url: optionalStr,
  social: optionalStr,
  grad: z.string().default("g1"),
  image: imageUrlOpt,
  images: optionalStr,
});

export type Umkm = z.infer<typeof UmkmSchema> & { id: number };

// ─── BERITA ──────────────────────────────────────────────────────────────────

export const BeritaSchema = z.object({
  id: z.number().int().positive().optional(),
  tag: reqStr("Tag berita", 100),
  cls: z.string().optional().default(""),
  title: reqStr("Judul berita", 300),
  desc: reqStr("Isi berita", 150_000),
  date: z.string().optional(),
  publishedAt: z.string().optional(),
  images: z.string().nullable().optional(),
});

export type Berita = z.infer<typeof BeritaSchema>;

// ─── GALERI ──────────────────────────────────────────────────────────────────

export const GaleriItemSchema = z.object({
  id: z.number().int().positive().optional(),
  label: reqStr("Label galeri", 200),
  cat: reqStr("Kategori", 100),
  grad: z.string().default("g1"),
  image: imageUrlOpt,
  images: optionalStr,
  desc: optionalStr,
});

export type GaleriItem = z.infer<typeof GaleriItemSchema>;

// ─── POTENSI ─────────────────────────────────────────────────────────────────

export const PotensiSchema = z.object({
  num: reqStr("Nomor potensi", 10),
  title: reqStr("Judul potensi", 200),
  desc: reqStr("Deskripsi potensi", 3_000),
});

export type Potensi = z.infer<typeof PotensiSchema>;

// ─── LEMBAGA ─────────────────────────────────────────────────────────────────

export const LembagaSchema = z.object({
  id: z.number().int().positive().optional(),
  name: reqStr("Nama lembaga", 200),
  leader: reqStr("Nama ketua", 150),
  desc: reqStr("Deskripsi", 2_000),
  members: reqStr("Anggota", 2_000),
  icon: reqStr("Ikon", 100),
});

export type Lembaga = z.infer<typeof LembagaSchema> & { id: number };

// ─── PROFIL DESA ─────────────────────────────────────────────────────────────

export const ProfilDesaSchema = z.object({
  visi: reqStr("Visi", 2_000),
  misi: z
    .array(z.string().trim().min(1, "Poin misi tidak boleh kosong."))
    .min(1, "Minimal satu poin misi."),
});

export type ProfilDesa = z.infer<typeof ProfilDesaSchema>;

// ─── AGENDA ──────────────────────────────────────────────────────────────────

export const AgendaSchema = z.object({
  id: z.number().int().positive().optional(),
  title: reqStr("Judul agenda", 200),
  desc: reqStr("Deskripsi", 3_000),
  location: reqStr("Lokasi", 300),
  date: reqStr("Tanggal", 50),
  time: reqStr("Waktu", 50),
  category: reqStr("Kategori", 100),
});

export type Agenda = z.infer<typeof AgendaSchema> & { id: number };

// ─── BUKU TAMU ───────────────────────────────────────────────────────────────

export const BukuTamuSchema = z.object({
  id: z.number().int().positive().optional(),
  name: reqStr("Nama", 100),
  origin: reqStr("Asal daerah", 150),
  message: reqStr("Pesan", 2_000),
  date: z.string().optional(),
});

/** Schema khusus input publik (tanpa id & date, plus consent) */
export const BukuTamuInputSchema = z.object({
  name: reqStr("Nama", 100),
  origin: reqStr("Asal daerah", 150),
  message: reqStr("Pesan", 2_000),
  consent: z.literal(true, "Persetujuan publikasi diperlukan untuk mengirim buku tamu."),
});

export type BukuTamu = z.infer<typeof BukuTamuSchema> & { id: number };

// ─── PENGADUAN ───────────────────────────────────────────────────────────────

export const PengaduanStatusEnum = z.enum(["Baru", "Diproses", "Selesai", "Ditolak"]);

export const PengaduanSchema = z.object({
  id: z.number().int().positive().optional(),
  nama: z.string().trim().max(100, "Nama melebihi 100 karakter.").default("Warga Anonim"),
  dusun: z.string().trim().max(150, "Dusun melebihi 150 karakter.").default("Sukoharjo"),
  judul: reqStr("Judul laporan", 200),
  isi: reqStr("Rincian laporan", 5_000),
  tanggal: z.string().optional(),
  status: PengaduanStatusEnum.default("Baru"),
  tanggapan: z.string().optional(),
  foto: imageUrlOpt,
  image: imageUrlOpt,
});

/** Schema khusus input publik */
export const PengaduanInputSchema = z.object({
  nama: z.string().trim().max(100, "Nama melebihi 100 karakter.").default("Warga Anonim"),
  dusun: z.string().trim().max(150, "Dusun melebihi 150 karakter.").default("Sukoharjo"),
  judul: reqStr("Judul laporan", 200),
  isi: reqStr("Rincian laporan", 5_000),
  foto: imageUrlOpt,
  consent: z.literal(true, "Persetujuan pemrosesan data diperlukan untuk mengirim pengaduan."),
});

export type Pengaduan = z.infer<typeof PengaduanSchema> & { id: number };

// ─── APBDES ──────────────────────────────────────────────────────────────────

export const ApbdesRingkasanSchema = z.object({
  pendapatan: reqStr("Pendapatan", 50),
  belanja: reqStr("Belanja", 50),
  pembiayaan: reqStr("Pembiayaan", 50),
  tahun: z
    .number({ error: "Tahun harus angka." })
    .int()
    .min(2000, "Tahun tidak valid.")
    .max(2100, "Tahun tidak valid."),
});

export type ApbdesRingkasan = z.infer<typeof ApbdesRingkasanSchema>;

export const ApbdesBidangSchema = z.object({
  id: z.number().int().positive().optional(),
  name: reqStr("Nama bidang", 200),
  anggaran: reqStr("Anggaran", 50),
  realisasi: reqStr("Realisasi", 50),
  pct: reqStr("Persentase", 10),
  desc: reqStr("Deskripsi", 1_000),
});

export type ApbdesBidang = z.infer<typeof ApbdesBidangSchema> & { id: number };

// ─── PRODUK HUKUM ────────────────────────────────────────────────────────────

export const ProdukHukumSchema = z.object({
  id: z.number().int().positive().optional(),
  nomor: reqStr("Nomor produk hukum", 100),
  judul: reqStr("Judul", 300),
  kategori: reqStr("Kategori", 100),
  tanggal: reqStr("Tanggal", 50),
  fileUrl: optionalStr,
});

export type ProdukHukum = z.infer<typeof ProdukHukumSchema> & { id: number };

// ─── STATISTIK PENDUDUK ──────────────────────────────────────────────────────

const DusunItemSchema = z.object({
  nama: reqStr("Nama dusun", 100),
  rt: z.number().int().min(0),
  rw: z.number().int().min(0),
  jiwa: z.number().int().min(0),
  kk: z.number().int().min(0).optional(),
});

const PekerjaanItemSchema = z.object({
  name: reqStr("Nama pekerjaan", 100),
  pct: z.number().min(0).max(100),
  count: z.number().int().min(0),
});

const PendidikanItemSchema = z.object({
  name: reqStr("Nama jenjang", 100),
  count: z.number().int().min(0),
});

export const StatistikPendudukSchema = z.object({
  totalPenduduk: z.number().int().min(0, "Total penduduk tidak boleh negatif."),
  totalKk: z.number().int().min(0, "Total KK tidak boleh negatif."),
  lakiLaki: z.number().int().min(0),
  perempuan: z.number().int().min(0),
  dusunList: z.array(DusunItemSchema).min(1, "Minimal satu data dusun."),
  pekerjaanList: z.array(PekerjaanItemSchema).min(1, "Minimal satu data pekerjaan."),
  pendidikanList: z.array(PendidikanItemSchema).min(1, "Minimal satu data pendidikan."),
});

export type StatistikPenduduk = z.infer<typeof StatistikPendudukSchema>;

// ─── PopData ─────────────────────────────────────────────────────────────────

export interface PopData {
  label: string;
  val: number;
}

export const popData: PopData[] = [
  { label: "Dusun Blaraksari", val: 168 },
  { label: "Dusun Sukoharjo", val: 351 },
  { label: "Dusun Tulakan", val: 410 },
  { label: "Dusun Jati", val: 210 },
  { label: "Dusun Pule", val: 364 },
  { label: "Dusun Dadapan", val: 901 },
  { label: "Dusun Bonagung", val: 279 },
  { label: "Dusun Dalan Gede", val: 358 },
  { label: "Dusun Sendangsari", val: 420 },
  { label: "Dusun Ngroto", val: 739 },
  { label: "Dusun Ngandong", val: 717 },
];

export const STAT = {
  dusun: 11,
};
