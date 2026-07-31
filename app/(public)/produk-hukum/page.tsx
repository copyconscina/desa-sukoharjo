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
              <Card key={doc.id} className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[color:var(--clay)] text-white border-none text-xs">
                      {doc.kategori}
                    </Badge>
                    <span className="font-mono text-xs text-[color:var(--ink-soft)]">{doc.nomor}</span>
                  </div>
                  <h3 className="font-heading text-lg text-[color:var(--ink)] mt-1">{doc.judul}</h3>
                  <span className="font-mono text-xs text-[color:var(--ink-soft)]">Ditetapkan: {doc.tanggal}</span>
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
