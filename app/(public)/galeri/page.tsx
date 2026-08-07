import { Metadata } from "next";
import { getGaleriList } from "@/lib/db";
import GaleriList from "@/components/GaleriList";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Galeri Desa Sukoharjo",
  description: "Dokumentasi foto kegiatan warga, database UMKM, dan potensi Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.",
};

export default async function GaleriPage() {
  const galeriData = await getGaleriList();

  return (
    <div className="font-sans">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Galeri</p>
          <h1 className="font-heading font-semibold tracking-[-0.01em]">Dokumentasi Desa Sukoharjo</h1>
        </div>
      </div>

      {/* FILTER & GRID */}
      <section className="block tight">
        <GaleriList initialGaleriData={galeriData} />
      </section>
    </div>
  );
}
