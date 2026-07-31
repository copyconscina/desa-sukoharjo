import { Metadata } from "next";
import Link from "next/link";
import { getPotensiList } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Potensi Desa — Desa Sukoharjo",
  description: "Kekayaan alam, pertanian, kerajinan, peternakan, dan peluang pengembangan Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.",
};

export default async function PotensiPage() {
  const potensiData = await getPotensiList();
  return (
    <div className="font-sans">
      <div className="page-header">
        <div className="terraces" aria-hidden="true" style={{ opacity: 0.5 }}>
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none">
            <polygon points="0,300 0,240 1200,280 1200,300" fill="#2d4425" />
            <polygon points="0,240 0,190 1200,230 1200,280" fill="#39542f" />
          </svg>
        </div>
        <div className="wrap">
          <p className="eyebrow on-dark">Potensi Desa</p>
          <h1>Kekayaan alam dan peluang usaha Desa Sukoharjo</h1>
          <p>
            Potensi desa ini merangkum sektor yang paling menonjol untuk dikembangkan, dari pertanian dan perkebunan sampai wisata alam perbukitan.
          </p>
        </div>
      </div>

      <section className="block">
        <div className="wrap two-col">
          <div>
            <p className="eyebrow">Gambaran Umum</p>
            <h2 style={{ marginTop: "10px" }}>Potensi utama yang bisa diolah menjadi penggerak ekonomi</h2>
            <p style={{ marginTop: "16px" }}>
              Desa Sukoharjo punya kombinasi lahan pertanian berbukit, hasil perkebunan (kelapa, cengkeh, kopi, janggelan), perajin rumahan, dan industri olahan pangan yang saling terhubung. Beberapa sektor sudah berjalan lewat kelompok tani dan koperasi desa, sisanya masih punya ruang besar untuk dikembangkan lewat promosi digital, kemasan, dan kolaborasi antarwarga.
            </p>
            <p style={{ marginTop: "12px" }}>
              Halaman ini dibuat untuk memudahkan warga, investor kecil, maupun pendamping desa melihat bidang mana yang paling siap didorong lebih jauh.
            </p>
          </div>
          <Card className="card border border-[color:var(--line)] shadow-none" style={{ padding: "24px" }}>
            <p className="eyebrow">Fokus Pengembangan</p>
            <ul style={{ marginTop: "14px", paddingLeft: "18px", color: "var(--ink-soft)", display: "grid", gap: "10px" }}>
              <li>Konservasi dan penguatan lahan pertanian kering berbukit.</li>
              <li>Pengemasan hasil perkebunan serta produk industri rumahan.</li>
              <li>Digitalisasi promosi kerajinan anyaman bambu dan genteng khas Sukoharjo.</li>
              <li>Penguatan kelembagaan ekonomi desa lewat Koperasi Desa Merah Putih (KDMP).</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="block on-parchment2 tight">
        <div className="wrap">
          <div className="section-head" style={{ maxWidth: "100%" }}>
            <p className="eyebrow">Daftar Potensi</p>
            <h2 style={{ marginTop: "10px" }}>Bidang yang sudah teridentifikasi</h2>
          </div>
          <div className="grid cols-3" style={{ marginTop: "24px" }}>
            {potensiData.map((potensi) => (
              <Card key={potensi.num} className="card shadow-none border border-[color:var(--line)]" style={{ padding: "22px" }}>
                <div
                  className="eyebrow"
                  style={{ fontSize: "1.35rem", fontFamily: "var(--font-display)", fontStyle: "italic", marginBottom: "10px" }}
                >
                  {potensi.num}
                </div>
                <h3 style={{ marginBottom: "8px" }}>{potensi.title}</h3>
                <p style={{ fontSize: "14px" }}>{potensi.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap two-col">
          <div>
            <p className="eyebrow">Arah Lanjut</p>
            <h2 style={{ marginTop: "10px" }}>Potensi yang paling cepat bisa dipasarkan</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
              <Card className="card border border-[color:var(--line)] shadow-none" style={{ padding: "20px" }}>
                <h3 className="font-heading">Produk olahan pangan</h3>
                <p> Jamur, tempe, dan aneka makanan ringan punya basis produksi yang sudah berjalan di wilayah Tirtomoyo dan bisa diperkuat lewat kemasan serta branding khas Sukoharjo.</p>
              </Card>
              <Card className="card border border-[color:var(--line)] shadow-none" style={{ padding: "20px" }}>
                <h3 className="font-heading">Kerajinan lokal</h3>
                <p>Anyaman bambu dan genteng punya nilai jual tinggi jika dipaketkan sebagai produk khas desa dan dipromosikan lewat kanal digital.</p>
              </Card>
              <Card className="card border border-[color:var(--line)] shadow-none" style={{ padding: "20px" }}>
                <h3 className="font-heading">Wisata desa</h3>
                <p>Lahan berbukit yang tengah direhabilitasi lewat penanaman sengon berpotensi jadi jalur agrowisata dan edukasi konservasi lahan, sekaligus mendukung UMKM setempat.</p>
              </Card>
            </div>
          </div>
          <div className="vm-card border-none shadow-none">
            <h3>Langkah yang bisa diambil</h3>
            <p>
              Mulai dari pendataan pelaku usaha, pelatihan pengemasan hasil kebun dan olahan pangan, sampai promosi lewat website desa dan media sosial dengan koperasi desa (KDMP) sebagai penggerak awal.
            </p>
            <p style={{ marginTop: "14px" }}>
              Jika ingin melihat pelaku usaha yang sudah berjalan, buka database UMKM. Jika ingin mengenal latar wilayahnya, lihat profil desa.
            </p>
            <div className="hero-cta" style={{ marginTop: "24px" }}>
              <Button asChild className="btn btn-primary border-none">
                <Link href="/umkm">Lihat Database UMKM</Link>
              </Button>
              <Button asChild className="btn btn-ghost border border-white/35">
                <Link href="/profil">Baca Profil Desa</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}