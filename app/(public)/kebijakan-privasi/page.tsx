import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Desa Sukoharjo",
  description: "Kebijakan pemrosesan data pribadi Website Desa Sukoharjo.",
  alternates: { canonical: "/kebijakan-privasi" },
};

export default function KebijakanPrivasiPage() {
  return <div className="font-sans"><div className="page-header"><div className="wrap"><p className="eyebrow on-dark">Informasi Publik</p><h1>Kebijakan Privasi</h1></div></div><section className="block"><div className="wrap max-w-3xl space-y-6 text-[color:var(--ink-soft)] leading-relaxed"><p>Website Desa Sukoharjo dikelola oleh Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.</p><h2>Data yang dikumpulkan</h2><p>Kami dapat mengumpulkan data UMKM seperti nama usaha dan pemilik, nomor kontak, alamat, produk, foto, serta data yang dikirim melalui buku tamu dan pengaduan.</p><h2>Tujuan dan publikasi</h2><p>Data UMKM digunakan untuk informasi dan promosi potensi desa; data yang ditandai untuk profil UMKM dapat ditampilkan secara publik. Data pengaduan digunakan untuk penanganan laporan oleh Pemerintah Desa.</p><h2>Penyimpanan dan pihak ketiga</h2><p>Data disimpan pada sistem website dan penyimpanan cloud yang digunakan untuk menjalankan layanan. Kami tidak menjual data pribadi kepada pihak lain.</p><h2>Koreksi atau penghapusan</h2><p>Pemilik data dapat meminta koreksi atau penghapusan melalui halaman Pengaduan atau menghubungi kantor desa. Permintaan akan diperiksa sesuai kewenangan dan kewajiban arsip yang berlaku.</p></div></section></div>;
}
