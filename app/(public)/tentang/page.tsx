import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang Pengelola | Desa Sukoharjo", alternates: { canonical: "/tentang" } };

export default function TentangPage() {
  return <div className="font-sans"><div className="page-header"><div className="wrap"><p className="eyebrow on-dark">Desa Sukoharjo</p><h1>Tentang Pengelola Website</h1></div></div><section className="block"><div className="wrap max-w-3xl space-y-6 text-[color:var(--ink-soft)] leading-relaxed"><p>Website Desa Sukoharjo dikelola oleh Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri, sebagai media informasi pelayanan desa, transparansi, publikasi kegiatan, dan promosi UMKM warga.</p><h2>Kontak</h2><p>Kantor Desa Sukoharjo, RT 03 RW 02, Kecamatan Tirtomoyo, Kabupaten Wonogiri, Jawa Tengah 57672.<br />Telepon: (0812) 25432772 / (0851) 73204364.<br />Jam layanan: Senin–Jumat, 08.00–15.00 WIB.</p><p>Website ini dikembangkan pada tahun 2026 untuk memudahkan akses informasi masyarakat.</p></div></section></div>;
}
