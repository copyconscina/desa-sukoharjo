import { Metadata } from "next";
import { getUmkmList } from "@/lib/db";
import UmkmList from "@/components/UmkmList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Database UMKM Desa Sukoharjo",
  description: "Daftar unit usaha mikro, kecil, dan menengah (UMKM) unggulan Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.",
};

export default async function UmkmPage() {
  const umkmData = await getUmkmList();

  return (
    <div className="font-sans">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Database UMKM</p>
          <h1>Etalase digital usaha warga Sukoharjo</h1>
          <p>Cari dan temukan produk unggulan langsung dari pelaku usaha, lengkap dengan kontak WhatsApp.</p>
        </div>
      </div>

      {/* FILTER & GRID */}
      <section className="block tight">
        <UmkmList initialUmkmData={umkmData} />
      </section>
    </div>
  );
}
