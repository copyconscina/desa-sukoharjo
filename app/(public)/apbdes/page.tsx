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
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[color:var(--line)] border-y border-[color:var(--line)]">
          <div className="flex-1 py-5 sm:py-6 sm:px-6" style={{ containerType: "inline-size" }}>
            <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-semibold tracking-wider block">Total Pendapatan Desa</span>
            <div className="num" style={{ fontSize: "clamp(1.4rem, 7cqw, 2rem)", marginTop: "4px" }}>{apbdesRingkasan.pendapatan}</div>
            <span className="text-xs text-[color:var(--ink-soft)] block mt-1 leading-relaxed">Pendapatan didapat dari Hasil Usaha Desa, Dana Desa, Bagi hasil Pajak dan Retribusi, dan Bantuan Keuangan Provinsi</span>
          </div>

          <div className="flex-1 py-5 sm:py-6 sm:px-6" style={{ containerType: "inline-size" }}>
            <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-semibold tracking-wider block">Total Belanja Desa</span>
            <div className="num" style={{ fontSize: "clamp(1.4rem, 7cqw, 2rem)", marginTop: "4px" }}>{apbdesRingkasan.belanja}</div>
            <span className="text-xs text-[color:var(--ink-soft)] block mt-1 leading-relaxed">Belanja Desa digunakan untuk Pembangunan, Pemerintahan & Pemberdayaan masyarakat Desa</span>
          </div>

          <div className="flex-1 py-5 sm:py-6 sm:px-6" style={{ containerType: "inline-size" }}>
            <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-semibold tracking-wider block">Pembiayaan</span>
            <div className="num" style={{ fontSize: "clamp(1.4rem, 7cqw, 2rem)", marginTop: "4px" }}>{apbdesRingkasan.pembiayaan}</div>
            <span className="text-xs text-[color:var(--ink-soft)] block mt-1 leading-relaxed">Pembiayaan yang digunakan untuk kebutuhan operasional dan investasi Desa</span>
          </div>
        </div>

          {/* DETAIL BIDANG BELANJA */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-2xl text-[color:var(--ink)]">Rincian Realisasi Belanja per Bidang</h3>
            {bidangBelanja.map((bidang, idx) => (
              <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-5 [--card-spacing:8px]">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                  <h4 className="font-heading text-lg text-[color:var(--ink)]">{bidang.name}</h4>
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span>Anggaran: <strong>{bidang.anggaran}</strong></span>
                    <Badge className="bg-[color:var(--forest)] text-white border-none">{bidang.pct}</Badge>
                  </div>
                </div>
                <p className="text-sm  text-[color:var(--ink-soft)] mb-2">{bidang.desc}</p>
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
