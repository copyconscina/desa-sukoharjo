import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Layanan Mandiri Permohonan Surat — Desa Sukoharjo",
  description: "Pengajuan permohonan surat keterangan online (SKTM, Surat Domisili, Surat Usaha) Desa Sukoharjo.",
};

const jenisSurat = [
  { name: "Surat Keterangan Tidak Mampu (SKTM)", code: "SKTM", req: "Syarat: KTP, KK, & Surat Pengantar RT/RW" },
  { name: "Surat Keterangan Domisili", code: "SKD", req: "Syarat: KTP, KK, & Bukti Alamat Tinggal" },
  { name: "Surat Keterangan Usaha (SKU)", code: "SKU", req: "Syarat: KTP, KK, & Nama/Alamat Usaha UMKM" },
  { name: "Surat Keterangan Kelahiran / Kematian", code: "SKK", req: "Syarat: KTP Pemohon & Surat RS/Bidan" },
];

export default function LayananSuratPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Layanan Mandiri Warga</p>
          <h1>Permohonan Surat Online</h1>
          <p>
            Ajukan permohonan surat keterangan desa dengan mudah secara mandiri dari mana saja.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap two-col">
          {/* FORM PENGAJUAN SURAT */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6">
            <h3 className="font-heading text-xl mb-4 text-[color:var(--ink)]">Formulir Pengajuan Surat</h3>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  placeholder="Nama sesuai KTP"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  placeholder="16-digit NIK Pemohon"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Jenis Surat Keterangan</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]">
                  {jenisSurat.map((s, idx) => (
                    <option key={idx} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Keperluan Surat</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan tujuan dan keperluan pembuatan surat..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <Button type="button" className="btn btn-dark w-full justify-center">
                Ajukan Permohonan Surat
              </Button>
            </form>
          </Card>

          {/* PETUNJUK & DAFTAR SURAT */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xl text-[color:var(--ink)]">Jenis Layanan Surat Tersedia</h3>
            {jenisSurat.map((s, idx) => (
              <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[color:var(--ink)] text-base">{s.name}</h4>
                  <Badge className="bg-[color:var(--forest)] text-white border-none">{s.code}</Badge>
                </div>
                <p className="text-xs font-mono text-[color:var(--ink-soft)]">{s.req}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
