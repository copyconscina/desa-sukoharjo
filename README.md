# 🌾 Website Resmi & Portal Pelayanan Desa Sukoharjo
### Kecamatan Tirtomoyo, Kabupaten Wonogiri

Website ini merupakan platform digital terpadu Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri. Platform ini berfungsi sebagai media publikasi informasi desa, portal pelayanan publik mandiri, transparansi anggaran APBDES, etalase digital UMKM warga, serta dilengkapi **Panel Admin Terintegrasi** berbasis **Supabase Auth & Row Level Security (RLS)**.

---

## 🚀 Fitur Utama & Struktur Halaman

Website ini dirancang secara modular, modern, dan responsif:

### 🌐 Halaman Publik
1. **Beranda (`/`)**: 
   - Banner hero interaktif bertema alam Sukoharjo.
   - Ringkasan statistik desa (Dusun, Penduduk, UMKM, Potensi).
   - Preview berita terbaru, UMKM unggulan, agenda desa, dan galeri foto.
2. **Profil Desa (`/profil`)**: Sejarah desa, Visi & Misi, Struktur Pemerintahan, dan informasi kontak kantor desa.
3. **Berita Desa (`/berita` & `/berita/[id]`)**: Berita kegiatan, agenda acara, pengumuman publik, dan informasi pembangunan desa.
4. **Database & Etalase UMKM (`/umkm` & `/umkm/[id]`)**: Katalog produk lokal dengan pencarian *real-time*, filter kategori, detail usaha, serta fitur pemesanan *Direct to WhatsApp*.
5. **Potensi Desa (`/potensi`)**: Pemetaan 5 potensi utama desa (SDA, SDM, Pembangunan, Sosial Budaya, dan Kelembagaan).
6. **Lembaga Kemasyarakatan (`/lembaga`)**: Profil lembaga desa (BPD, LPM, PKK, Karang Taruna, RT/RW, Linmas).
7. **Agenda Desa (`/agenda`)**: Kalender dan jadwal kegiatan desa mendatang.
8. **Transparansi APBDES (`/apbdes`)**: Infografis ringkasan Pendapatan, Belanja, Pembiayaan, serta realisasi anggaran per bidang.
9. **Informasi Bantuan Sosial (`/bansos`)**: Data penerima dan alokasi program bantuan sosial (PKH, BLT-DD, BPNT, dll).
10. **Produk Hukum & Perdes (`/produk-hukum`)**: Unduh dokumen Peraturan Desa (Perdes) dan keputusan Kepala Desa.
11. **Layanan Informasi PPID (`/ppid`)**: Layanan Keterbukaan Informasi Publik (Berkala, Serta-Merta, Setiap Saat).
12. **Layanan Surat Online (`/layanan-surat`)**: Permohonan pengurusan surat publik secara mandiri.
13. **Layanan Pengaduan (`/pengaduan`)**: Form aspirasi dan pengaduan warga secara online.
14. **Buku Tamu Digital (`/buku-tamu`)**: Form pendaftaran kunjungan tamu/dinas desa.
15. **Peta Wilayah (`/peta`)**: Peta geografis dan batas wilayah Desa Sukoharjo.
16. **Statistik Desa (`/statistik`)**: Visualisasi data demografi dan kependudukan interaktif.

### 🔐 Panel Administrasi (`/admin`)
- **Keamanan Tingkat Tinggi**: Autentikasi berbasis **Supabase Auth** dan kebijakan **Row Level Security (RLS)** pada database PostgreSQL.
- **Dashboard Manajemen (`/admin/dashboard`)**:
  - **Manajemen Berita**: Tambah, edit, dan hapus berita beserta gambar pendukung.
  - **Manajemen UMKM**: Pengelolaan katalog UMKM warga secara *real-time*.
  - **Manajemen Galeri**: Unggah foto & dokumentasi kegiatan desa.
  - **Manajemen Potensi**: Pembaruan narasi potensi desa.
- **Fitur Keamanan**: *Rate-limiting* login, proteksi rute halaman admin, serta cookie terenkripsi HTTP-only dari Supabase SSR.

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

* **Framework Utama**: [Next.js 16.2.10](https://nextjs.org/) (App Router, Turbopack, Server Actions)
* **Library UI**: [React 19.2.4](https://react.dev/) & [React DOM 19.2.4](https://react.dev/)
* **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/)
* **Database & Autentikasi**:
  - [Supabase PostgreSQL](https://supabase.com/) dengan 15 tabel aktif & RLS Policies enabled.
  - **Supabase Auth** via `@supabase/ssr`.
  - Fallback data lokal di `lib/db.json` jika koneksi database offline.
* **Styling & Desain**:
  - [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS custom design system (`globals.css`).
  - Google Fonts (*Fraunces*, *Public Sans*, *JetBrains Mono*).
* **Komponen & Ikon**:
  - [Shadcn UI](https://ui.shadcn.com/) (Badge, Button, Card, Dialog, Input) berbasis [Radix UI](https://www.radix-ui.com/).
  - [Lucide React](https://lucide.dev/) Icons.

---

## 📁 Struktur Direktori Proyek

```bash
desa-sukoharjo/
├── app/                      # Next.js App Router (Halaman & Server Actions)
│   ├── admin/                # Panel Admin & Login (/admin, /admin/dashboard)
│   │   ├── dashboard/        # Halaman manajemen (berita, umkm, galeri, potensi)
│   │   ├── login/            # Form login admin berbasis Supabase Auth
│   │   └── actions.ts        # Server Actions untuk autentikasi & CRUD data
│   ├── agenda/               # Halaman Agenda Desa (/agenda)
│   ├── apbdes/               # Halaman Transparansi APBDES (/apbdes)
│   ├── bansos/               # Halaman Informasi Bansos (/bansos)
│   ├── berita/               # Halaman & Detail Berita (/berita, /berita/[id])
│   ├── buku-tamu/            # Halaman Buku Tamu Digital (/buku-tamu)
│   ├── galeri/               # Halaman Galeri Foto (/galeri)
│   ├── layanan-surat/        # Halaman Layanan Surat Online (/layanan-surat)
│   ├── lembaga/              # Halaman Profil Lembaga Desa (/lembaga)
│   ├── pengaduan/            # Halaman Pengaduan Warga (/pengaduan)
│   ├── peta/                 # Halaman Peta Wilayah (/peta)
│   ├── potensi/              # Halaman Potensi Desa (/potensi)
│   ├── ppid/                 # Halaman Informasi Publik PPID (/ppid)
│   ├── produk-hukum/         # Halaman Perdes & Produk Hukum (/produk-hukum)
│   ├── profil/               # Halaman Profil & Visi Misi Desa (/profil)
│   ├── statistik/            # Halaman Statistik Kependudukan (/statistik)
│   ├── umkm/                 # Halaman Katalog & Detail UMKM (/umkm, /umkm/[id])
│   ├── globals.css           # Design system & variabel warna CSS
│   ├── layout.tsx            # Root Layout
│   └── page.tsx              # Halaman Beranda utama
├── components/               # Komponen UI Reusable (Navbar, Footer, AdminSidebar, dll)
├── lib/                      # Logika Aplikasi & Database (db.ts, auth.ts, upload.ts)
├── utils/                    # Client Supabase (server.ts, client.ts, middleware.ts)
├── public/                   # Aset Statis (Gambar, Logos, Icons)
├── .env                      # Variabel Lingkungan Supabase
├── package.json              # Dependencies & Skrip npm
├── next.config.ts            # Konfigurasi Next.js
└── tsconfig.json             # Konfigurasi TypeScript
```

---

---

## ⚙️ Panduan Menjalankan Proyek Secara Lokal

### Prerequisites
Pastikan PC Anda telah terpasang **Node.js** (v18.x atau yang lebih baru).

### 1. Instal Dependensi
```bash
npm install
```

### 2. Jalankan Server Development
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 3. Build Production Check
Untuk menguji proses kompilasi dan optimasi produksi:
```bash
npm run build
npm run start
```

---
*Dibuat dengan dedikasi untuk kemajuan digitalisasi Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.*
