import { Metadata } from "next";
import { getPengaduanList } from "@/lib/db";
import PengaduanClient from "./PengaduanClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Lapor & Pengaduan Warga — Desa Sukoharjo",
  description: "Layanan pengaduan dan aspirasi warga Desa Sukoharjo secara online dan transparan.",
};

export default async function PengaduanPage() {
  const aduanList = await getPengaduanList();

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Layanan Aspirasi Warga</p>
          <h1>Pengaduan & Lapor Warga</h1>
          <p>
            Sampaikan laporan masalah infrastruktur, fasilitas publik, atau pelayanan desa secara transparan.
          </p>
        </div>
      </header>

      <PengaduanClient initialList={aduanList} />
    </div>
  );
}
