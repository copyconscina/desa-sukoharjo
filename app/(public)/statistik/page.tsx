import { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Statistik Kependudukan — Desa Sukoharjo",
  description: "Demografi dan statistik agregat penduduk Desa Sukoharjo berdasarkan kelompok umur, tingkat pendidikan, pekerjaan, dan agama.",
};

const statUmur = [
  { label: "0 - 14 Tahun (Anak-anak)", val: 980, total: 4915 },
  { label: "15 - 39 Tahun (Pemuda & Usia Produktif)", val: 1850, total: 4915 },
  { label: "40 - 64 Tahun (Dewasa)", val: 1420, total: 4915 },
  { label: "65+ Tahun (Lansia)", val: 665, total: 4915 },
];

const statPendidikan = [
  { label: "SD / Sederajat", val: 1250, pct: "25.4%" },
  { label: "SMP / Sederajat", val: 1480, pct: "30.1%" },
  { label: "SMA / SMK / Sederajat", val: 1620, pct: "33.0%" },
  { label: "Diploma / Sarjana (S1/S2)", val: 565, pct: "11.5%" },
];

const statPekerjaan = [
  { label: "Petani & Pekebun", val: 1840, pct: "37.4%" },
  { label: "Pedagang & Wiraswasta/UMKM", val: 1120, pct: "22.8%" },
  { label: "Karyawan Swasta & Buruh", val: 950, pct: "19.3%" },
  { label: "PNS, TNI & Polri", val: 210, pct: "4.3%" },
  { label: "Lainnya / Pelajar / Ibu Rumah Tangga", val: 795, pct: "16.2%" },
];

export default function StatistikPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Demografi Publik</p>
          <h1>Statistik Kependudukan Desa</h1>
          <p>
            Data agregat kependudukan Desa Sukoharjo (Total 4.915 Jiwa di 11 Dusun) berdasarkan usia, pendidikan, dan mata pencaharian.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          {/* REKAP KELOMPOK UMUR */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6">
            <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Demografi Kelompok Umur</h3>
            <div className="flex flex-col gap-4">
              {statUmur.map((item, idx) => {
                const percentage = ((item.val / item.total) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-[color:var(--ink)]">{item.label}</span>
                      <span className="font-mono text-[color:var(--ink-soft)]">{item.val} Jiwa ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-[color:var(--parchment-2)] h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[color:var(--forest)] to-[color:var(--sawah)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* TWO COL: PENDIDIKAN & PEKERJAAN */}
          <div className="grid cols-2 gap-6">
            {/* TINGKAT PENDIDIKAN */}
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Tingkat Pendidikan</h3>
              <div className="flex flex-col gap-3">
                {statPendidikan.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--parchment)] border border-[color:var(--line)]">
                    <span className="text-sm font-medium text-[color:var(--ink)]">{item.label}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[color:var(--forest)]">{item.val}</span>
                      <span className="text-xs font-mono text-[color:var(--ink-soft)] block">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* MATA PENCAHARIAN */}
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Mata Pencaharian Utama</h3>
              <div className="flex flex-col gap-3">
                {statPekerjaan.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--parchment)] border border-[color:var(--line)]">
                    <span className="text-sm font-medium text-[color:var(--ink)]">{item.label}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[color:var(--clay)]">{item.val}</span>
                      <span className="text-xs font-mono text-[color:var(--ink-soft)] block">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
