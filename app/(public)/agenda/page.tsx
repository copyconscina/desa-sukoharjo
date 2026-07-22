import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Agenda Kegiatan — Desa Sukoharjo",
  description: "Jadwal dan kalender kegiatan masyarakat serta Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Wonogiri.",
};

const sampleAgenda = [
  {
    id: 1,
    title: "Musyawarah Desa (Musdes) Rencana Pembangunan 2027",
    desc: "Pembahasan prioritas pembangunan sarana infrastruktur jalan tani dan pemberdayaan ekonomi UMKM desa.",
    location: "Balai Desa Sukoharjo",
    date: "15 Juli 2026",
    time: "09:00 WIB",
    category: "Pemerintahan",
  },
  {
    id: 2,
    title: "Pelatihan Packaging & Pemasaran Digital UMKM",
    desc: "Pelatihan pembuatan kemasan produk dan pendaftaran sertifikasi halal untuk pelaku UMKM lokal.",
    location: "Pendopo Desa Sukoharjo",
    date: "22 Juli 2026",
    time: "13:00 WIB",
    category: "Ekonomi",
  },
  {
    id: 3,
    title: "Gotong Royong & Pembersihan Akses Wisata",
    desc: "Kerja bakti pembersihan jalur perbukitan dan lingkungan dusun bersama Karang Taruna.",
    location: "Dusun Ngrancah & Sukorejo",
    date: "28 Juli 2026",
    time: "07:00 WIB",
    category: "Kemasyarakatan",
  },
];

export default function AgendaPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Jadwal & Agenda</p>
          <h1>Agenda Kegiatan Desa</h1>
          <p>
            Informasi kalender kegiatan pemerintahan, gotong royong warga, dan pelatihan kemasyarakatan di Desa Sukoharjo.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="grid cols-3">
            {sampleAgenda.map((item) => (
              <Card key={item.id} className="card shadow-none border border-[color:var(--line)] flex flex-col justify-between">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white border-none w-fit mb-3">
                    {item.category}
                  </Badge>
                  <h3 className="font-heading mb-2 text-[color:var(--ink)]">{item.title}</h3>
                  <p className="text-sm text-[color:var(--ink-soft)] mb-4">{item.desc}</p>
                </div>
                <div className="border-t border-[color:var(--line)] pt-3 text-xs font-mono text-[color:var(--ink-soft)] flex flex-col gap-1">
                  <div>📍 {item.location}</div>
                  <div>📅 {item.date} · {item.time}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
