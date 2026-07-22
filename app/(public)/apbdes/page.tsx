import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Transparansi Keuangan (APBDes) — Desa Sukoharjo",
  description: "Laporan Anggaran Pendapatan dan Belanja Desa (APBDes) Sukoharjo Tahun Anggaran 2026.",
};

const apbdesRingkasan = {
  pendapatan: "Rp 1.485.000.000",
  belanja: "Rp 1.450.000.000",
  pembiayaan: "Rp 35.000.000",
  tahun: 2026,
};

const bidangBelanja = [
  {
    name: "Bidang Pembangunan Desa",
    anggaran: "Rp 680.000.000",
    realisasi: "Rp 450.000.000",
    pct: "66.2%",
    desc: "Pengaspalan jalan tani dusun, perbaikan drainase sawah, dan penerangan jalan umum.",
  },
  {
    name: "Bidang Penyelenggaraan Pemerintahan",
    anggaran: "Rp 390.000.000",
    realisasi: "Rp 310.000.000",
    pct: "79.4%",
    desc: "Siltap & tunjangan Kades/perangkat, operasional kantor desa, dan tata kelola sistem digital.",
  },
  {
    name: "Bidang Pembinaan Kemasyarakatan",
    anggaran: "Rp 180.000.000",
    realisasi: "Rp 145.000.000",
    pct: "80.5%",
    desc: "Dukungan kegiatan Karang Taruna, PKK, posyandu balita/lansia, dan festival budaya lokal.",
  },
  {
    name: "Bidang Pemberdayaan Masyarakat (UMKM)",
    anggaran: "Rp 150.000.000",
    realisasi: "Rp 110.000.000",
    pct: "73.3%",
    desc: "Penyertaan modal BUMDes, pelatihan kemasan UMKM, dan bantuan bibit ternak kambing etawa.",
  },
  {
    name: "Bidang Penanggulangan Bencana & Darurat",
    anggaran: "Rp 50.000.000",
    realisasi: "Rp 15.000.000",
    pct: "30.0%",
    desc: "Dana siaga bencana alam tanah longsor dan bantuan darurat sosial warga.",
  },
];

export default function APBDesPage() {
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
          <div className="grid cols-3 gap-6">
            <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)]">
              <span className="text-xs font-mono uppercase text-[color:var(--forest)] font-semibold">Total Pendapatan Desa</span>
              <h2 className="text-3xl font-display text-[color:var(--forest)] mt-1">{apbdesRingkasan.pendapatan}</h2>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-2">Dana Desa, ADD, Bagi Hasil Pajak & PADes</span>
            </Card>

            <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)]">
              <span className="text-xs font-mono uppercase text-[color:var(--clay)] font-semibold">Total Belanja Desa</span>
              <h2 className="text-3xl font-display text-[color:var(--clay)] mt-1">{apbdesRingkasan.belanja}</h2>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-2">Pembangunan, Pemerintahan & Pemberdayaan</span>
            </Card>

            <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)]">
              <span className="text-xs font-mono uppercase text-[color:var(--padi)] font-semibold">Pembiayaan / SILPA</span>
              <h2 className="text-3xl font-display text-[color:var(--ink)] mt-1">{apbdesRingkasan.pembiayaan}</h2>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-2">SiLPA Tahun Sebelumnya</span>
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
