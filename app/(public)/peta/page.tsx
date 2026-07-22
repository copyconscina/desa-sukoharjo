import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Peta Geospasial Desa — Desa Sukoharjo",
  description: "Peta wilayah dusun, sarana prasarana desa, dan lokasi UMKM unggulan di Desa Sukoharjo, Kecamatan Tirtomoyo.",
};

const titikPenting = [
  { name: "Balai Desa Sukoharjo", cat: "Fasilitas Publik", dusun: "Dusun Sukoharjo", icon: "🏛️" },
  { name: "Sentra Batik Tulis Parang Lereng", cat: "Sentra UMKM", dusun: "Dusun Ngrancah", icon: "🎨" },
  { name: "Olahan Tiwul & Gaplek Bu Sarmi", cat: "Kuliner UMKM", dusun: "Dusun Sukorejo", icon: "🍲" },
  { name: "Kebun & Budidaya Lebah Madu", cat: "Pertanian", dusun: "Dusun Karangnongko", icon: "🍯" },
  { name: "Jembatan Utama Tirtomoyo–Sukoharjo", cat: "Infrastruktur", dusun: "Dusun Tanggulangin", icon: "🌉" },
];

export default function PetaPage() {
  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Pemetaan Wilayah</p>
          <h1>Peta Geospasial Desa Sukoharjo</h1>
          <p>
            Peta wilayah administratif 11 dusun (Luas 837,77 Ha) serta sebaran lokasi UMKM dan sarana infrastruktur desa.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          {/* PETA INTERAKTIF PREVIEW */}
          <Card className="card shadow-none border border-[color:var(--line)] overflow-hidden p-0 relative">
            <div className="w-full h-96 bg-[color:var(--forest-deep)] relative flex items-center justify-center text-white p-6">
              {/* TERRAIN / GEOSPATIAL VECTOR MAP BACKGROUND */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8ba368" strokeWidth="1" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10 text-center max-w-lg">
                <span className="text-4xl mb-3 block">🗺️</span>
                <h3 className="text-2xl font-display text-[#fcfcf8] mb-2">Peta Digital Desa Sukoharjo</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Kecamatan Tirtomoyo · Kabupaten Wonogiri · Jawa Tengah (Koordinat: 7°56&apos;12&quot;S 111°04&apos;45&quot;E)
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--forest)] text-xs font-mono border border-white/20">
                  <span>📍 11 Dusun · 637,31 Ha Lahan Kering · 101,29 Ha Sawah</span>
                </div>
              </div>
            </div>
          </Card>

          {/* TITIK LOKASI PENTING & UMKM */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-2xl text-[color:var(--ink)]">Titik Sarana & Sentra UMKM Terdaftar</h3>
            <div className="grid cols-3 gap-4">
              {titikPenting.map((pt, idx) => (
                <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-5 flex items-start gap-4">
                  <span className="text-3xl">{pt.icon}</span>
                  <div>
                    <Badge className="bg-[color:var(--sawah)] text-[color:var(--forest-deep)] border-none text-xs mb-1">
                      {pt.cat}
                    </Badge>
                    <h4 className="font-semibold text-[color:var(--ink)] text-base">{pt.name}</h4>
                    <span className="text-xs font-mono text-[color:var(--ink-soft)] block mt-1">📍 {pt.dusun}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
