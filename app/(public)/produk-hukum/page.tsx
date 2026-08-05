import { Metadata } from "next";
import { getProdukHukumList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Produk Hukum — Desa Sukoharjo",
  description: "Arsip Peraturan Desa (Perdes), Peraturan Kepala Desa (Perkades), dan Keputusan Kepala Desa Sukoharjo.",
};

export default async function ProdukHukumPage() {
  const dokumenList = await getProdukHukumList();

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
            {dokumenList.map((doc) => (
              <Card key={doc.id} className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-[color:var(--clay)] text-white border-none text-[11px] px-2.5 py-0.5">
                      {doc.kategori}
                    </Badge>
                    <span className="font-mono text-xs text-[color:var(--ink-soft)]">{doc.nomor}</span>
                  </div>
                  <h3 className="font-heading text-base md:text-lg text-[color:var(--ink)] mt-1 break-words leading-snug">
                    {doc.judul}
                  </h3>
                  <span className="font-mono text-xs text-[color:var(--ink-soft)]">Ditetapkan: {doc.tanggal}</span>
                </div>

                <div className="shrink-0 self-stretch sm:self-center flex items-center justify-end">
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[185px] h-[40px] rounded-full bg-[color:var(--forest-deep)] hover:bg-[color:var(--forest)] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors border-none shrink-0 no-underline"
                    >
                      <span>📄 Unduh Dokumen PDF</span>
                    </a>
                  ) : (
                    <div className="w-[185px] h-[40px] rounded-full bg-[color:var(--parchment-2)] border border-[color:var(--line)] text-[color:var(--ink-soft)] text-xs font-medium flex items-center justify-center gap-2 shrink-0 opacity-60 cursor-not-allowed">
                      <span>📄 PDF Belum Tersedia</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
