import { Metadata } from "next";
import { getStatistikPenduduk } from "@/lib/db";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Statistik Kependudukan — Desa Sukoharjo",
  description: "Demografi dan statistik agregat penduduk Desa Sukoharjo berdasarkan dusun, tingkat pendidikan, dan pekerjaan.",
};

export default async function StatistikPage() {
  const stat = await getStatistikPenduduk();

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Demografi Publik</p>
          <h1 className="font-heading font-semibold tracking-[-0.01em]">Statistik Kependudukan Desa</h1>
          <p>
            Data agregat kependudukan Desa Sukoharjo (Total {stat.totalPenduduk.toLocaleString("id-ID")} Jiwa · {stat.totalKk.toLocaleString("id-ID")} KK) berdasarkan wilayah dusun, pendidikan, dan mata pencaharian.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          {/* REKAP UTAMA */}
          <div className="grid cols-4 gap-4">
            <Card className="card shadow-none border border-[color:var(--line)] p-5 text-center">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] block mb-1 font-medium">Total Penduduk</span>
              <span className="text-3xl font-bold font-heading text-[color:var(--forest-deep)]">{stat.totalPenduduk.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-1">Jiwa</span>
            </Card>
            <Card className="card shadow-none border border-[color:var(--line)] p-5 text-center">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] block mb-1 font-medium">Kepala Keluarga</span>
              <span className="text-3xl font-bold font-heading text-[color:var(--forest-deep)]">{stat.totalKk.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-1">KK</span>
            </Card>
            <Card className="card shadow-none border border-[color:var(--line)] p-5 text-center">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] block mb-1 font-medium">Laki-Laki</span>
              <span className="text-3xl font-bold font-heading text-[color:var(--forest-deep)]">{stat.lakiLaki.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-1">Jiwa</span>
            </Card>
            <Card className="card shadow-none border border-[color:var(--line)] p-5 text-center">
              <span className="text-xs uppercase font-mono text-[color:var(--ink-soft)] block mb-1 font-medium">Perempuan</span>
              <span className="text-3xl font-bold font-heading text-[color:var(--forest-deep)]">{stat.perempuan.toLocaleString("id-ID")}</span>
              <span className="text-xs text-[color:var(--ink-soft)] block mt-1">Jiwa</span>
            </Card>
          </div>

          {/* DISTRIBUSI DUSUN */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6">
            <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Sebaran Penduduk per Dusun</h3>
            <div className="grid cols-3 gap-4">
              {stat.dusunList.map((dusun, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[color:var(--parchment)] border border-[color:var(--line)] flex justify-between items-center">
                  <div>
                    <h4 className="font-heading text-lg text-[color:var(--ink)]">{dusun.nama}</h4>
                    <span className="text-xs font-mono text-[color:var(--ink-soft)]">{dusun.rt} RT · {dusun.rw} RW</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-heading text-[color:var(--forest-deep)]">{dusun.jiwa}</span>
                    <span className="text-xs text-[color:var(--ink-soft)] block">Jiwa</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* TWO COL: PENDIDIKAN & PEKERJAAN */}
          <div className="grid cols-2 gap-6">
            {/* TINGKAT PENDIDIKAN */}
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Tingkat Pendidikan</h3>
              <div className="flex flex-col gap-3">
                {stat.pendidikanList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--parchment)] border border-[color:var(--line)]">
                    <span className="text-sm font-medium text-[color:var(--ink)]">{item.name}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[color:var(--forest-deep)]">{item.count.toLocaleString("id-ID")} Jiwa</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* MATA PENCAHARIAN */}
            <Card className="card shadow-none border border-[color:var(--line)] p-6">
              <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Mata Pencaharian Utama</h3>
              <div className="flex flex-col gap-3">
                {stat.pekerjaanList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--parchment)] border border-[color:var(--line)]">
                    <span className="text-sm font-medium text-[color:var(--ink)]">{item.name}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[color:var(--forest-deep)]">{item.count.toLocaleString("id-ID")} Jiwa</span>
                      <span className="text-xs font-mono text-[color:var(--ink-soft)] block">{item.pct}%</span>
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
