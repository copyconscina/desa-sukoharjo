import { Metadata } from "next";
import { getStatistikPenduduk } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Users, Home, UserRound, UserRound as UserRoundIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Statistik Kependudukan — Desa Sukoharjo",
  description: "Demografi dan statistik agregat penduduk Desa Sukoharjo berdasarkan dusun, tingkat pendidikan, dan pekerjaan.",
};

export default async function StatistikPage() {
  const stat = await getStatistikPenduduk();

  const maxDusun = Math.max(...stat.dusunList.map((d) => d.jiwa));
  const maxPendidikan = Math.max(...stat.pendidikanList.map((d) => d.count));

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Demografi Publik</p>
          <h1>Statistik Kependudukan Desa</h1>
          <p>
            Data agregat kependudukan Desa Sukoharjo (Total {stat.totalPenduduk.toLocaleString("id-ID")} Jiwa · {stat.totalKk.toLocaleString("id-ID")} KK) berdasarkan wilayah dusun, pendidikan, dan mata pencaharian.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
        {/* REKAP UTAMA */}
        <div className="grid cols-4 gap-3">
          <Card className="card shadow-none border border-[color:var(--line)] p-5">
            <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide block">Total Penduduk</span>
            <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] block mt-0 tabular-nums">{stat.totalPenduduk.toLocaleString("id-ID")}</span>
            <span className="text-sm text-[color:var(--ink-soft)] block mt-0">Jiwa</span>
          </Card>

          <Card className="card shadow-none border border-[color:var(--line)] p-5">
            <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide block">Kepala Keluarga</span>
            <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] block mt-0 tabular-nums">{stat.totalKk.toLocaleString("id-ID")}</span>
            <span className="text-sm text-[color:var(--ink-soft)] block mt-0">KK</span>
          </Card>

          <Card className="card shadow-none border border-[color:var(--line)] p-5">
            <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide block">Laki-Laki</span>
            <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] block mt-0 tabular-nums">{stat.lakiLaki.toLocaleString("id-ID")}</span>
            <span className="text-sm text-[color:var(--ink-soft)] block mt-0">Jiwa</span>
          </Card>

          <Card className="card shadow-none border border-[color:var(--line)] p-5">
            <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] font-medium tracking-wide block">Perempuan</span>
            <span className="text-4xl font-bold font-mono text-[color:var(--forest-deep)] block mt-0 tabular-nums">{stat.perempuan.toLocaleString("id-ID")}</span>
            <span className="text-sm text-[color:var(--ink-soft)] block mt-0">Jiwa</span>
          </Card>
        </div>

          {/* DISTRIBUSI DUSUN */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6">
            <h2 className="font-heading text-2xl mb-0 text-[color:var(--ink)]">Sebaran Penduduk per Dusun</h2>
            <div className="flex flex-col gap-0">
              {stat.dusunList.map((dusun, idx) => (
                <div key={idx} className="pop-bar-row">
                  <div className="pop-bar-label">
                    {dusun.nama}
                    <span className="block text-xs font-mono font-normal text-[color:var(--ink-soft)] mt-0.1">{dusun.rt} RT · {dusun.rw} RW</span>
                  </div>
                  <div className="pop-bar-track">
                    <div className="pop-bar-fill" style={{ width: `${(dusun.jiwa / maxDusun) * 100}%` }} />
                  </div>
                  <div className="pop-bar-num">{dusun.jiwa} Jiwa</div>
                </div>
              ))}
            </div>
          </Card>

          {/* TWO COL: PENDIDIKAN & PEKERJAAN */}
          <div className="grid cols-2 gap-6">
            {/* TINGKAT PENDIDIKAN */}
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h2 className="font-heading text-xl mb-0 text-[color:var(--ink)]">Tingkat Pendidikan</h2>
              <div className="flex flex-col gap-4">
                {stat.pendidikanList.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-medium text-[color:var(--ink)]">{item.name}</span>
                      <span className="font-mono text-xs font-bold text-[color:var(--forest-deep)]">{item.count.toLocaleString("id-ID")} Jiwa</span>
                    </div>
                    <div className="pop-bar-track" style={{ height: "8px" }}>
                      <div className="pop-bar-fill" style={{ width: `${(item.count / maxPendidikan) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* MATA PENCAHARIAN */}
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h2 className="font-heading text-xl mb-0 text-[color:var(--ink)]">Mata Pencaharian Utama</h2>
              <div className="flex flex-col gap-4">
                {stat.pekerjaanList.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-medium text-[color:var(--ink)]">{item.name}</span>
                      <span className="font-mono text-xs">
                        <span className="font-bold text-[color:var(--forest-deep)]">{item.count.toLocaleString("id-ID")} Jiwa</span>
                        <span className="text-[color:var(--ink-soft)] ml-1.5">{item.pct}%</span>
                      </span>
                    </div>
                    <div className="pop-bar-track" style={{ height: "8px"}}>
                      <div className="pop-bar-fill" style={{ width: `${item.pct}%`}} />
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