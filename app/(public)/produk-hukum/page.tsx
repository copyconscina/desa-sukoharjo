import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Produk Hukum — Desa Sukoharjo",
  description: "Arsip Peraturan Desa (Perdes), Peraturan Kepala Desa (Perkades), dan Keputusan Kepala Desa Sukoharjo.",
};

const sampleDokumen = [
  {
    id: 1,
    nomor: "Perdes No. 03 Tahun 2025",
    judul: "Peraturan Desa tentang Rencana Kerja Pemerintah Desa (RKPDes) Tahun 2026",
    jenis: "Perdes",
    tahun: 2025,
    size: "1.2 MB",
  },
  {
    id: 2,
    nomor: "Perdes No. 01 Tahun 2025",
    judul: "Peraturan Desa tentang Pengelolaan Sampah dan Pelestarian Lingkungan Hidup",
    jenis: "Perdes",
    tahun: 2025,
    size: "850 KB",
  },
  {
    id: 3,
    nomor: "SK Kades No. 12 Tahun 2026",
    judul: "Keputusan Kepala Desa tentang Pembentukan Pengurus BUMDes Sukoharjo Sejahtera",
    jenis: "SK Kades",
    tahun: 2026,
    size: "520 KB",
  },
];

export default function ProdukHukumPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Transparansi Hukum</p>
          <h1>Produk Hukum Desa</h1>
          <p>
            Dokumen publik Peraturan Desa (Perdes), Peraturan Kepala Desa, serta SK Kades Sukoharjo yang dapat diakses warga.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="flex flex-col gap-4">
            {sampleDokumen.map((doc) => (
              <Card key={doc.id} className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[color:var(--clay)] text-white border-none text-xs">
                      {doc.jenis}
                    </Badge>
                    <span className="font-mono text-xs text-[color:var(--ink-soft)]">{doc.nomor}</span>
                  </div>
                  <h3 className="font-heading text-lg text-[color:var(--ink)] mt-1">{doc.judul}</h3>
                  <span className="font-mono text-xs text-[color:var(--ink-soft)]">Tahun: {doc.tahun} · Ukuran: {doc.size}</span>
                </div>
                <Button variant="outline" className="btn btn-dark border-none text-xs px-4 py-2 flex items-center gap-2 self-start md:self-auto">
                  <span>📄 Unduh Dokumen PDF</span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
