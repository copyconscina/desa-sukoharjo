export interface Umkm {
  id: number;
  name: string;
  owner: string;
  category: string;
  year: number;
  product: string;
  tagline?: string;
  desc: string;
  address: string;
  wa?: string;
  phone?: string;
  mapsUrl?: string;
  maps_url?: string;
  social?: string;
  grad: string;
  image?: string;
  images?: string;
}

export interface Berita {
  id?: number;
  tag: string;
  cls?: string;
  title: string;
  desc: string;
  date: string;
  publishedAt?: string; // tambahan ini
  images?: string | null;
}

export interface GaleriItem {
  id?: number;
  label: string;
  cat: string;
  grad: string;
  image?: string;
  images?: string;
  desc?: string;
}

export interface Potensi {
  num: string;
  title: string;
  desc: string;
}

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
  population: "4.815",
  umkm: 54,
};

// Profil & Lembaga
export interface Lembaga {
  id: number;
  name: string;
  leader: string;
  desc: string;
  members: string;
  icon: string;
}

export interface ProfilDesa {
  visi: string;
  misi: string[];
}

// Layanan
export interface Agenda {
  id: number;
  title: string;
  desc: string;
  location: string;
  date: string;
  time: string;
  category: string;
}

export interface BukuTamu {
  id: number;
  name: string;
  origin: string;
  message: string;
  date: string;
}

export interface Pengaduan {
  id: number;
  nama: string;
  dusun: string;
  judul: string;
  isi: string;
  tanggal: string;
  status: "Baru" | "Diproses" | "Selesai" | "Ditolak";
  tanggapan?: string;
  foto?: string;
  image?: string;
}

// Transparansi
export interface ApbdesRingkasan {
  pendapatan: string;
  belanja: string;
  pembiayaan: string;
  tahun: number;
}

export interface ApbdesBidang {
  id: number;
  name: string;
  anggaran: string;
  realisasi: string;
  pct: string;
  desc: string;
}

export interface ProdukHukum {
  id: number;
  nomor: string;
  judul: string;
  kategori: string;
  tanggal: string;
  fileUrl?: string;
}

export interface StatistikPenduduk {
  totalPenduduk: number;
  totalKk: number;
  lakiLaki: number;
  perempuan: number;
  dusunList: { nama: string; rt: number; rw: number; jiwa: number; kk?: number }[];
  pekerjaanList: { name: string; pct: number; count: number }[];
  pendidikanList: { name: string; count: number }[];
}

