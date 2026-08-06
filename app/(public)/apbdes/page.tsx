import { Metadata } from "next";
import { getApbdesRingkasan, getApbdesBidangList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Transparansi Keuangan (APBDes) — Desa Sukoharjo",
  description: "Laporan Anggaran Pendapatan dan Belanja Desa (APBDes) Sukoharjo Tahun Anggaran 2026.",
};

export default async function APBDesPage() {
  const apbdesRingkasan = await getApbdesRingkasan();
  const bidangBelanja = await getApbdesBidangList();
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Keterbukaan Anggaran</p>
          <h1>APBDes & Transparansi Keuangan</h1>
          <p>
            Laporan Anggaran Pendapatan dan Belanja Desa (APBDes) Sukoharjo Tahun Anggaran 2026 secara terbuka dan akuntabel.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          {/* STRIP RINGKASAN APBDES */}
          <div className="flex flex-wrap justify-center gap-6 w-full">
            <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)] flex flex-col justify-between w-fit shrink-0">
              <div className="min-w-0">
                <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-semibold tracking-wider block">Total Pendapatan Desa</span>
                <h2 className="text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-bold font-display text-[color:var(--forest-deep)] mt-3 mb-1 tracking-tight whitespace-nowrap">
                  {apbdesRingkasan.pendapatan}
                </h2>
              </div>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-2 leading-relaxed">Dana Desa, ADD, Bagi Hasil Pajak & PADes</span>
            </Card>

            <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)] flex flex-col justify-between w-fit shrink-0">
              <div className="min-w-0">
                <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-semibold tracking-wider block">Total Belanja Desa</span>
                <h2 className="text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-bold font-display text-[color:var(--forest-deep)] mt-3 mb-1 tracking-tight whitespace-nowrap">
                  {apbdesRingkasan.belanja}
                </h2>
              </div>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-2 leading-relaxed">Pembangunan, Pemerintahan & Pemberdayaan</span>
            </Card>

            <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)] flex flex-col justify-between w-fit shrink-0">
              <div className="min-w-0">
                <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-semibold tracking-wider block">Pembiayaan</span>
                <h2 className="text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-bold font-display text-[color:var(--forest-deep)] mt-3 mb-1 tracking-tight whitespace-nowrap">
                  {apbdesRingkasan.pembiayaan}
                </h2>
              </div>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-2 leading-relaxed"></span>
            </Card>
          </div>

          {/* DETAIL BIDANG BELANJA */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-2xl text-[color:var(--ink)]">Rincian Realisasi Belanja per Bidang</h3>
            {bidangBelanja.map((bidang, idx) => (
              <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-5">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                  <h4 className="font-heading text-lg text-[color:var(--ink)]">{bidang.name}</h4>
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span>Anggaran: <strong>{bidang.anggaran}</strong></span>
                    <Badge className="bg-[color:var(--forest)] text-white border-none">{bidang.pct}</Badge>
                  </div>
                </div>
                <p className="text-sm text-[color:var(--ink-soft)] mb-3">{bidang.desc}</p>
                <div className="w-full bg-[color:var(--parchment-2)] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[color:var(--forest)] h-full rounded-full" style={{ width: bidang.pct }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
