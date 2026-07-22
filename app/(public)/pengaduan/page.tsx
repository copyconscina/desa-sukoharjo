import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lapor & Pengaduan Warga — Desa Sukoharjo",
  description: "Layanan pengaduan dan aspirasi warga Desa Sukoharjo secara online dan transparan.",
};

const sampleAduan = [
  {
    id: 1,
    title: "Lampu Penerangan Jalan Umum (PJU) Mati di Dusun Sukorejo",
    kategori: "Infrastruktur",
    nama: "Warga Sukorejo (Anonim)",
    status: "Diproses",
    date: "20 Juli 2026",
    desc: "Lampu PJU di dekat jembatan Dusun Sukorejo RT 02 padam sejak 3 hari lalu, mohon perbaikan demi keamanan warga.",
  },
  {
    id: 2,
    title: "Saluran Irigasi Tertutup Saluran Air Sawah Dusun Ngrancah",
    kategori: "Pertanian",
    nama: "Bpk. Wagiyo",
    status: "Selesai",
    date: "12 Juli 2026",
    desc: "Pembersihan endapan lumpur pada saluran irigasi sawah telah ditindaklanjuti bersama tim kerja bakti desa.",
  },
];

export default function PengaduanPage() {
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
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Kategori Aduan</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]">
                  <option value="infrastruktur">Infrastruktur & Jalan</option>
                  <option value="pelayanan">Pelayanan Administrasi Desa</option>
                  <option value="pertanian">Pertanian & Irigasi</option>
                  <option value="kebersihan">Kebersihan & Lingkungan</option>
                  <option value="lainnya">Lain-lain</option>
                </select>
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
            {sampleAduan.map((aduan) => (
              <Card key={aduan.id} className="card shadow-none border border-[color:var(--line)] p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`border-none ${aduan.status === 'Selesai' ? 'bg-[color:var(--forest)]' : 'bg-[color:var(--clay)]'} text-white`}>
                    {aduan.status}
                  </Badge>
                  <span className="text-xs font-mono text-[color:var(--ink-soft)]">{aduan.date}</span>
                </div>
                <h4 className="font-semibold text-[color:var(--ink)] text-base mt-1">{aduan.title}</h4>
                <p className="text-xs font-mono text-[color:var(--ink-soft)] mb-2">Pelapor: {aduan.nama} · Kategori: {aduan.kategori}</p>
                <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">{aduan.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
