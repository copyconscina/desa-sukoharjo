import { Metadata } from "next";
import { getPengaduanList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lapor & Pengaduan Warga — Desa Sukoharjo",
  description: "Layanan pengaduan dan aspirasi warga Desa Sukoharjo secara online dan transparan.",
};

export default async function PengaduanPage() {
  const aduanList = await getPengaduanList();

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Layanan Aspirasi Warga</p>
          <h1>Pengaduan & Lapor Warga</h1>
          <p>
            Sampaikan laporan masalah infrastruktur, fasilitas publik, atau pelayanan desa secara transparan.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap two-col">
          {/* FORM PENGADUAN */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6">
            <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Buat Laporan / Pengaduan Baru</h3>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Nama Pelapor (Opsional/Bisa Anonim)</label>
                <input
                  type="text"
                  placeholder="Nama Anda atau biarkan kosong jika anonim"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Dusun / Alamat</label>
                <input
                  type="text"
                  placeholder="Contoh: Sukorejo"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Judul Laporan</label>
                <input
                  type="text"
                  placeholder="Ringkasan singkat masalah"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Rincian Laporan & Lokasi</label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan detail lokasi dan permasalahan yang dialami..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <Button type="button" className="btn btn-dark w-full justify-center">
                Kirim Pengaduan Warga
              </Button>
            </form>
          </Card>

          {/* LIST ADUAN TERBARU */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xl text-[color:var(--ink)]">Daftar Laporan Terkini</h3>
            {aduanList.map((aduan) => (
              <Card key={aduan.id} className="card shadow-none border border-[color:var(--line)] p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`border-none ${aduan.status === 'Selesai' ? 'bg-[color:var(--forest)]' : 'bg-[color:var(--clay)]'} text-white`}>
                    {aduan.status}
                  </Badge>
                  <span className="text-xs font-mono text-[color:var(--ink-soft)]">{aduan.tanggal}</span>
                </div>
                <h4 className="font-semibold text-[color:var(--ink)] text-base mt-1">{aduan.judul}</h4>
                <p className="text-xs font-mono text-[color:var(--ink-soft)] mb-2">Pelapor: {aduan.nama} · Dusun: {aduan.dusun}</p>
                <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">{aduan.isi}</p>
                {aduan.tanggapan && (
                  <div className="mt-3 text-xs bg-[color:var(--forest)]/10 text-[color:var(--forest-deep)] p-2.5 rounded-lg border border-[color:var(--forest)]/20">
                    <strong>Tanggapan Resmi Desa:</strong> {aduan.tanggapan}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
