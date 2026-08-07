import { Metadata } from "next";
import { getStatistikPenduduk } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { PendidikanDonut, PekerjaanDonut } from "@/components/statistik-charts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Statistik Kependudukan — Desa Sukoharjo",
  description: "Demografi dan statistik agregat penduduk Desa Sukoharjo berdasarkan dusun, tingkat pendidikan, dan pekerjaan.",
};

export default async function StatistikPage() {
  const stat = await getStatistikPenduduk();

  const dusunSorted = [...stat.dusunList].sort((a, b) => b.jiwa - a.jiwa);
  const maxDusun = dusunSorted[0]?.jiwa ?? 1;

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Demografi Publik</p>
          <h1>Statistik Kependudukan Desa</h1>
          <p>
            Data agregat kependudukan Desa Sukoharjo (Total {stat.totalPenduduk.toLocaleString("id-ID")} Jiwa dan {stat.totalKk.toLocaleString("id-ID")} KK) berdasarkan wilayah dusun, pendidikan, dan mata pencaharian.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          {/* REKAP UTAMA */}
          <div className="grid cols-4 gap-4">
            <Card className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col gap-2">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide">Total Penduduk</span>
              <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] tabular-nums">{stat.totalPenduduk.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)]">Jiwa</span>
            </Card>
            <Card className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col gap-2">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide">Kepala Keluarga</span>
              <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] tabular-nums">{stat.totalKk.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)]">KK</span>
            </Card>
            <Card className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col gap-2">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide">Laki-Laki</span>
              <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] tabular-nums">{stat.lakiLaki.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)]">Jiwa</span>
            </Card>
            <Card className="card shadow-none border border-[color:var(--line)] p-5 flex flex-col gap-2">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide">Perempuan</span>
              <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] tabular-nums">{stat.perempuan.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)]">Jiwa</span>
            </Card>
          </div>

        {/* DISTRIBUSI DUSUN — sorted, top 3 highlighted */}
        <Card className="card shadow-none border border-[color:var(--line)] p-6">
          <h3 className="font-heading text-xl mb-5 text-[color:var(--ink)]">Sebaran Penduduk per Dusun</h3>
          <div className="flex flex-col gap-1">
            {dusunSorted.map((dusun, idx) => (
              <div key={idx} className="pop-bar-row">
                <div className="pop-bar-label flex items-center gap-2">
                  {idx < 3 && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-white shrink-0"
                      style={{ background: idx === 0 ? "var(--clay)" : idx === 1 ? "var(--padi)" : "var(--sawah)" }}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span>
                    {dusun.nama}
                    <span className="block text-xs font-mono font-normal text-[color:var(--ink-soft)] mt-0.5">{dusun.rt} RT · {dusun.rw} RW</span>
                  </span>
                </div>
                <div className="pop-bar-track">
                  <div className="pop-bar-fill" style={{ width: `${(dusun.jiwa / maxDusun) * 100}%` }} />
                </div>
                <div className="pop-bar-num">
                  {dusun.jiwa} Jiwa
                  <span className="block text-[color:var(--ink-soft)] font-normal">{((dusun.jiwa / stat.totalPenduduk) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

          {/* TWO COL: PENDIDIKAN & PEKERJAAN sebagai donut chart */}
          <div className="grid cols-2 gap-6">
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h2 className="font-heading text-xl mb-0 text-[color:var(--ink)]">Tingkat Pendidikan</h2>
              <PendidikanDonut data={stat.pendidikanList} />
            </Card>

            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h2 className="font-heading text-xl mb-0 text-[color:var(--ink)]">Mata Pencaharian Utama</h2>
              <PekerjaanDonut data={stat.pekerjaanList} />
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}