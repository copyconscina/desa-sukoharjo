# 🌾 Website Resmi & Portal Pelayanan Desa Sukoharjo
### Kecamatan Tirtomoyo, Kabupaten Wonogiri

Website ini merupakan platform digital terpadu Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri. Platform ini berfungsi sebagai media publikasi informasi desa, portal pelayanan publik mandiri, transparansi anggaran APBDes, etalase digital UMKM warga, serta pusat dokumentasi kegiatan desa.

---

## 🚀 Fitur Utama & Struktur Halaman

Website ini dirancang secara modular, modern, dan responsif:

1. **Beranda (`/`)**:
   - Hero interaktif bertema sawah & perbukitan Sukoharjo.
   - Ringkasan statistik desa (Dusun, Jiwa Penduduk, UMKM Terdaftar).
   - Preview profil singkat, UMKM unggulan, potensi desa, galeri foto, dan berita terbaru.
   - Dirender statis dengan revalidasi berkala (5 menit).
2. **Profil Desa (`/profil`)**: Sejarah desa, Visi & Misi, struktur pemerintahan, data kependudukan per dusun, serta informasi kontak kantor desa.
3. **Berita Desa (`/berita` & `/berita/[id]`)**: Berita kegiatan, pengumuman publik, dan informasi pembangunan desa beserta detail dan galeri gambar.
4. **Database & Etalase UMKM (`/umkm` & `/umkm/[id]`)**: Katalog produk lokal dengan pencarian *real-time*, filter kategori, detail usaha, serta fitur pemesanan *Direct to WhatsApp*.
5. **Potensi Desa (`/potensi`)**: Pemetaan potensi unggulan desa (pertanian, perkebunan, industri rumah tangga, pengolahan pangan) dan fokus pengembangannya.
6. **Lembaga Kemasyarakatan (`/lembaga`)**: Profil lembaga desa (Pemerintah Desa, BPD, PKK, Karang Taruna, RT/RW, dan organisasi kemasyarakatan).
7. **Agenda Kegiatan (`/agenda`)**: Jadwal dan kalender kegiatan pemerintahan serta kemasyarakatan desa.
8. **Transparansi APBDes (`/apbdes`)**: Ringkasan Pendapatan, Belanja, dan Pembiayaan, serta realisasi anggaran per bidang secara terbuka dan akuntabel.
9. **Produk Hukum & Perdes (`/produk-hukum`)**: Arsip Peraturan Desa (Perdes), Peraturan Kepala Desa, dan SK Kepala Desa yang dapat diunduh sebagai berkas PDF.
10. **Pengaduan & Lapor Warga (`/pengaduan`)**: Layanan penyampaian laporan dan aspirasi warga secara online.
11. **Buku Tamu (`/buku-tamu`)**: Formulir buku tamu serta ruang kesan, pesan, dan saran untuk Pemerintah Desa.
12. **Statistik Kependudukan (`/statistik`)**: Visualisasi data demografi publik (total penduduk, KK, sebaran per dusun, tingkat pendidikan, dan mata pencaharian) dengan grafik interaktif.
13. **Galeri Desa (`/galeri`)**: Dokumentasi foto kegiatan warga, UMKM, dan potensi desa dengan filter kategori.
14. **Tentang (`/tentang`)**: Informasi mengenai pengelola website dan tujuan keberadaannya.
15. **Kebijakan Privasi (`/kebijakan-privasi`)** & **Ketentuan Penggunaan (`/ketentuan-penggunaan`)**: Dokumen hukum yang mengatur penggunaan website.

### ⚙️ Fitur Teknis
- **SEO Lengkap**: Metadata dinamis, canonical URL, Open Graph, `robots.txt`, dan `sitemap.xml` otomatis.
- **Keamanan Konten**: Sanitasi HTML input menggunakan **DOMPurify** dan **sanitize-html** untuk mencegah serangan XSS.
- **Manajemen Media**: Konversi & kompresi gambar (format HEIC) serta upload langsung ke **Supabase Storage** (`sukoharjo-assets`).
- **Ketersediaan Data**: Database **Supabase PostgreSQL** dengan *fallback* data lokal (`lib/db.json`) jika koneksi offline.
- **Dokumen PDF**: Pembuatan laporan data desa berformat A4 siap cetak menggunakan **jsPDF**.

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

* **Framework Utama**: [Next.js 16.3.0](https://nextjs.org/) (App Router, Turbopack, Server Actions)
* **Library UI**: [React 19.2.4](https://react.dev/) & [React DOM 19.2.4](https://react.dev/)
* **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/)
* **Database & Autentikasi**:
  - [Supabase PostgreSQL](https://supabase.com/) dengan RLS Policies.
  - **Supabase Auth** via `@supabase/ssr` & `@supabase/supabase-js`.
  - Storage untuk media unggahan (gambar, dokumen).
* **Styling & Desain**:
  - [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS custom design system (`globals.css`).
  - Google Fonts (*Fraunces*, *Public Sans*, *JetBrains Mono*).
* **Komponen & Ikon**:
  - [Shadcn UI](https://ui.shadcn.com/) berbasis [Radix UI](https://www.radix-ui.com/).
  - [Lucide React](https://lucide.dev/) Icons.
* **Pustaka Pendukung**:
  - [Recharts](https://recharts.org/) untuk visualisasi statistik.
  - [Zod](https://zod.dev/) untuk validasi skema data.
  - [jsPDF](https://github.com/parallax/jsPDF) & `jspdf-autotable` untuk generasi PDF.
  - [DOMPurify](https://github.com/cure53/DOMPurify) & [sanitize-html](https://github.com/apostrophecms/sanitize-html) untuk sanitasi HTML.
  - [heic2any](https://github.com/alexcorvi/heic2any) & [sharp](https://sharp.pixelplumbing.com/) untuk pemrosesan gambar.

---

## 📁 Struktur Direktori Proyek

```bash
desa-sukoharjo/
├── app/                        # Next.js App Router
│   ├── (public)/               # Seluruh halaman publik website
│   │   ├── page.tsx            # Beranda (/)
│   │   ├── profil/             # Profil & sejarah desa
│   │   ├── berita/             # Berita & detail (/berita, /berita/[id])
│   │   ├── umkm/               # Database UMKM (/umkm, /umkm/[id])
│   │   ├── potensi/            # Potensi desa
│   │   ├── lembaga/            # Lembaga kemasyarakatan
│   │   ├── agenda/             # Agenda kegiatan
│   │   ├── apbdes/             # Transparansi APBDes
│   │   ├── produk-hukum/       # Produk hukum & perdes
│   │   ├── pengaduan/          # Pengaduan & lapor warga
│   │   ├── buku-tamu/          # Buku tamu
│   │   ├── statistik/          # Statistik kependudukan
│   │   ├── galeri/             # Galeri foto
│   │   ├── tentang/            # Tentang pengelola website
│   │   ├── kebijakan-privasi/  # Kebijakan privasi
│   │   ├── ketentuan-penggunaan/ # Ketentuan penggunaan
│   │   └── layout.tsx          # Layout khusus halaman publik
│   ├── api/                    # API Routes (mis. cron maintenance)
│   ├── robots.ts               # robots.txt otomatis
│   ├── sitemap.ts              # sitemap.xml otomatis
│   ├── globals.css             # Design system & variabel warna CSS
│   └── layout.tsx              # Root Layout
├── components/                 # Komponen UI Reusable (Navbar, GaleriList, UmkmList, grafik statistik, dll.)
├── lib/                        # Logika Aplikasi & Akses Data (db.ts, data.ts, upload.ts, pdf/, site.ts)
├── utils/supabase/             # Client Supabase (server, client, middleware, static)
├── public/                     # Aset Statis (Gambar, Logos, Icons)
├── .env.local                  # Variabel Lingkungan Supabase
├── next.config.ts              # Konfigurasi Next.js
├── package.json                # Dependencies & Skrip npm
└── tsconfig.json               # Konfigurasi TypeScript
```

*Dibuat dengan dedikasi untuk kemajuan digitalisasi Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.*
