import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ketentuan Penggunaan | Desa Sukoharjo", alternates: { canonical: "/ketentuan-penggunaan" } };

export default function KetentuanPenggunaanPage() {
  return <div className="font-sans"><div className="page-header"><div className="wrap"><p className="eyebrow on-dark">Informasi Publik</p><h1>Ketentuan Penggunaan</h1></div></div><section className="block"><div className="wrap max-w-3xl space-y-6 text-[color:var(--ink-soft)] leading-relaxed"><p>Website ini adalah media informasi Pemerintah Desa Sukoharjo dan etalase digital UMKM warga.</p><h2>Ketepatan informasi</h2><p>Informasi UMKM disampaikan oleh pemilik atau pengelola dan dapat diperbarui. Kami berupaya menjaga ketepatan data, tetapi pemilik UMKM bertanggung jawab atas kebenaran informasi yang diberikan.</p><h2>Penggunaan konten</h2><p>Pengunjung dapat menggunakan informasi untuk tujuan yang wajar dan tidak melanggar hukum. Dilarang menyalahgunakan data kontak, mengirim spam, atau mengganggu layanan website.</p><h2>Koreksi data</h2><p>Jika menemukan informasi yang tidak tepat atau ingin meminta perubahan, kirimkan laporan melalui halaman Pengaduan atau hubungi kantor desa.</p></div></section></div>;
}
