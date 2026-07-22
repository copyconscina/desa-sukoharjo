export interface Umkm {
  id: number;
  name: string;
  owner: string;
  category: string;
  year: number;
  product: string;
  desc: string;
  address: string;
  wa: string;
  social?: string;
  grad: string;
  image?: string;
}

export interface Berita {
  id?: number;
  tag: string;
  cls: string;
  title: string;
  desc: string;
  date: string;
  images?: string;
}

export interface GaleriItem {
  id?: number;
  label: string;
  cat: string;
  grad: string;
  image?: string;
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
  population: "4.915",
  umkm: 54,
};
