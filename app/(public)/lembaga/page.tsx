import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lembaga Desa — Desa Sukoharjo",
  description: "Struktur organisasi kelembagaan Pemerintah Desa, BPD, PKK, Karang Taruna, dan RT/RW Desa Sukoharjo.",
};

const lembagaList = [
  {
    name: "Pemerintah Desa Sukoharjo",
    leader: "Kepala Desa: Bpk. Suparno",
    desc: "Unsur penyelenggara pemerintahan desa yang bertugas memimpin pelaksanaan urusan pemerintahan, pembangunan, dan kemasyarakatan.",
    members: "14 Perangkat Desa & Staf",
    icon: "🏛️",
  },
  {
    name: "Badan Permusyawaratan Desa (BPD)",
    leader: "Ketua: Bpk. Drs. Mulyono",
    desc: "Lembaga perwujudan demokrasi dalam penyelenggaraan pemerintahan desa yang mengawasi kinerja Kades dan menyalurkan aspirasi warga.",
    members: "9 Anggota BPD",
    icon: "📜",
  },
  {
    name: "Pemberdayaan Kesejahteraan Keluarga (PKK)",
    leader: "Ketua: Ibu Suparmi",
    desc: "Lembaga kemasyarakatan sebagai mitra kerja pemerintah desa dalam membina dan memberdayakan keluarga sejahtera.",
    members: "35 Pengurus & Kader Pokja",
    icon: "🌸",
  },
  {
    name: "Karang Taruna Sukhoharjo Mandiri",
    leader: "Ketua: Mas Rizky Febrian",
    desc: "Wadah pengembangan generasi muda desa di bidang olahraga, kebudayaan, sosial, dan kewirausahaan pemuda.",
    members: "45 Pemuda & Pemudi Dusun",
    icon: "⚽",
  },
  {
    name: "Lembaga Pemberdayaan Masyarakat Desa (LPMD)",
    leader: "Ketua: Bpk. Suroto",
    desc: "Wadah yang dibentuk atas prakarsa masyarakat sebagai mitra pemerintah desa dalam menampung dan menyalurkan aspirasi pembangunan.",
    members: "11 Pengurus LPMD",
    icon: "🤝",
  },
  {
    name: "Pengurus RT & RW se-Desa Sukoharjo",
    leader: "Koordinator: Bpk. Wagiman",
    desc: "Lembaga kemasyarakatan terdepan yang membantu pelayanan administratif dan menjaga keharmonisan antar warga dusun.",
    members: "11 RW & 38 RT",
    icon: "🏡",
  },
];

export default function LembagaPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Struktur Kelembagaan</p>
          <h1>Lembaga Desa Sukoharjo</h1>
          <p>
            Mengenal struktur kelembagaan, kemitraan pemerintah desa, dan organisasi kemasyarakatan yang aktif membangun desa.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="grid cols-3">
            {lembagaList.map((item, idx) => (
              <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-6 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <Badge className="bg-[color:var(--forest)] text-white border-none w-fit mb-2">
                    {item.members}
                  </Badge>
                  <h3 className="font-heading text-xl text-[color:var(--ink)] mb-1">{item.name}</h3>
                  <p className="text-xs font-mono text-[color:var(--clay)] font-semibold mb-3">{item.leader}</p>
                  <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
