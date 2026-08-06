import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database UMKM — Desa Sukoharjo",
  description: "Etalase digital produk unggulan karya warga Desa Sukoharjo, Kecamatan Tirtomoyo, Wonogiri",
};

export default function UmkmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
