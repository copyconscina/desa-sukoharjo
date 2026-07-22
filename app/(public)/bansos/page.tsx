import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Transparansi Bansos — Desa Sukoharjo",
  description: "Transparansi data penerima dan program bantuan sosial (BLT Dana Desa, PKH, BPNT) Desa Sukoharjo.",
};

const bansosProgram = [
  {
    name: "BLT Dana Desa 2026",
    quota: "48 KPM (Keluarga Penerima Manfaat)",
    nominal: "Rp 300.000 / Bulan",
    status: "Tersalurkan Tahap II",
    desc: "Bantuan Langsung Tunai dari Dana Desa untuk keluarga miskin ekstrim & lansia tunggal.",
  },
  {
    name: "Program Keluarga Harapan (PKH)",
    quota: "142 KPM",
    nominal: "Sesuai Komponen (Kesehatan/Pendidikan)",
    status: "Tersalurkan via Himbara",
    desc: "Bantuan sosial bersyarat dari Kementerian Sosial untuk keluarga kurang mampu.",
  },
  {
    name: "Bantuan Pangan Non Tunai (BPNT)",
    quota: "195 KPM",
    nominal: "Bahan Pangan Pokok / Sembako",
    status: "Rutin Bulanan",
    desc: "Bantuan sembako beras dan bahan pangan pokok untuk menjaga ketahanan pangan keluarga.",
  },
];

export default function BansosPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Transparansi Bantuan</p>
          <h1>Program Bantuan Sosial (Bansos)</h1>
          <p>
            Informasi transparansi penyaluran bantuan sosial pemerintah pusat, daerah, dan BLT Dana Desa Sukoharjo.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          <div className="grid cols-3">
            {bansosProgram.map((prog, idx) => (
              <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-6 flex flex-col justify-between">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white border-none mb-3">
                    {prog.status}
                  </Badge>
                  <h3 className="font-heading text-xl text-[color:var(--ink)] mb-2">{prog.name}</h3>
                  <p className="text-sm text-[color:var(--ink-soft)] mb-4">{prog.desc}</p>
                  <div className="border-t border-[color:var(--line)] pt-3 flex flex-col gap-1 text-xs font-mono text-[color:var(--ink-soft)]">
                    <div>👥 Penerima: <strong className="text-[color:var(--ink)]">{prog.quota}</strong></div>
                    <div>💰 Nominal: <strong className="text-[color:var(--clay)]">{prog.nominal}</strong></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)]">
            <h3 className="font-heading text-xl text-[color:var(--ink)] mb-2">Prinsip Keterbukaan & Sanggah Bansos</h3>
            <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">
              Pemerintah Desa Sukoharjo berkomitmen memastikan penyaluran bansos tepat sasaran melalui Musyawarah Desa khusus penetapan KPM. Warga yang melihat ketidaksesuaian data dapat menyampaikan masukan melalui layanan <a href="/pengaduan" className="underline font-semibold text-[color:var(--forest)]">Pengaduan Warga</a>.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
