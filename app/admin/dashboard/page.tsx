import {
  getBeritaList,
  getGaleriList,
  getUmkmList,
  getPotensiList,
  getLembagaList,
  getPengaduanList,
  getProdukHukumList,
} from "@/lib/db";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const newsList = await getBeritaList();
  const galleryList = await getGaleriList();
  const umkmList = await getUmkmList();
  const potentialsList = await getPotensiList();
  const lembagaList = await getLembagaList();
  const pengaduanList = await getPengaduanList();
  const produkHukumList = await getProdukHukumList();

  const stats = [
    {
      label: "Profil & Lembaga",
      value: lembagaList.length,
      desc: "Lembaga desa & Visi-Misi",
      href: "/admin/dashboard/profil",
      color: "border-l-4 border-l-[color:var(--forest)]",
      ic: "🏛️",
    },
    {
      label: "Layanan Warga",
      value: pengaduanList.length,
      desc: "Pengaduan, Agenda & Buku Tamu",
      href: "/admin/dashboard/layanan",
      color: "border-l-4 border-l-[color:var(--clay)]",
      ic: "📢",
    },
    {
      label: "Transparansi",
      value: produkHukumList.length,
      desc: "APBDes, Perdes & Statistik",
      href: "/admin/dashboard/transparansi",
      color: "border-l-4 border-l-[color:var(--padi)]",
      ic: "📜",
    },
    {
      label: "Berita Terbaru",
      value: newsList.length,
      desc: "Agenda, pengumuman & kegiatan",
      href: "/admin/dashboard/berita",
      color: "border-l-4 border-l-[color:var(--forest-deep)]",
      ic: "📰",
    },
    {
      label: "Database UMKM",
      value: umkmList.length,
      desc: "Profil usaha warga terdaftar",
      href: "/admin/dashboard/umkm",
      color: "border-l-4 border-l-[color:var(--clay)]",
      ic: "🏪",
    },
    {
      label: "Galeri & Potensi",
      value: galleryList.length + potentialsList.length,
      desc: "Foto dokumentasi & sektor desa",
      href: "/admin/dashboard/galeri",
      color: "border-l-4 border-l-[color:var(--sawah)]",
      ic: "🖼️",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div>
        <p className="eyebrow">Ringkasan Panel</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Selamat Datang, Administrator
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Gunakan panel ini untuk mengelola Profil Desa & Lembaga, Layanan Surat & Pengaduan Warga, Transparansi Keuangan APBDes & Regulasi, Berita, Galeri, serta Database UMKM Desa Sukoharjo.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Link href={stat.href} key={idx} className="no-underline group">
            <Card className={`bg-[color:var(--card)] p-6 border border-[color:var(--line)] shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between ${stat.color} h-full`}>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase font-mono tracking-wider text-[color:var(--ink-soft)]">
                  {stat.label}
                </span>
                <span className="text-3xl font-bold font-heading my-1 text-[color:var(--ink)]">
                  {stat.value}
                </span>
                <span className="text-xs text-[color:var(--ink-soft)] group-hover:text-[color:var(--forest)] transition-colors duration-200">
                  {stat.desc} →
                </span>
              </div>
              <div className="p-2 bg-[color:var(--parchment-2)] rounded-lg text-2xl">
                {stat.ic}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Helpful Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <Card className="border border-[color:var(--line)] shadow-sm p-6 bg-[color:var(--card)] flex flex-col gap-4">
          <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
            Panduan Pengelolaan Website
          </h3>
          <ul className="text-sm text-[color:var(--ink-soft)] flex flex-col gap-3 pl-4 list-disc">
            <li>
              <strong>Berita Desa</strong>: Tambahkan informasi seputar agenda desa, pengumuman, dan berita terkini. Berita dengan tag "Pengumuman" akan otomatis diberi penanda merah di halaman depan.
            </li>
            <li>
              <strong>Galeri Foto</strong>: Tambahkan dokumentasi foto kegiatan desa, UMKM, dan panorama desa. Anda dapat memilih gradasi warna latar belakang representatif untuk memperindah visual galeri.
            </li>
            <li>
              <strong>Database UMKM</strong>: Lengkapi profil UMKM desa agar warga, investor, dan pembeli luar daerah dapat menghubungi pelaku usaha secara langsung via tombol WhatsApp otomatis.
            </li>
            <li>
              <strong>Potensi Desa</strong>: Sesuaikan deskripsi 5 sektor utama potensi desa agar data pembangunan dan kekayaan alam desa selalu termutakhirkan.
            </li>
          </ul>
        </Card>

        <Card className="border border-[color:var(--line)] shadow-sm p-6 bg-[color:var(--card)] flex flex-col gap-4">
          <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
            Akses Cepat Pengunjung
          </h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border border-[color:var(--line)] hover:bg-[color:var(--parchment)] transition-colors duration-200 text-sm no-underline font-medium text-[color:var(--ink)]"
            >
              <span>Beranda Website</span>
              <span className="text-xs text-[color:var(--ink-soft)]">Buka Website Utama →</span>
            </Link>
            <Link
              href="/umkm"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border border-[color:var(--line)] hover:bg-[color:var(--parchment)] transition-colors duration-200 text-sm no-underline font-medium text-[color:var(--ink)]"
            >
              <span>Daftar UMKM Warga</span>
              <span className="text-xs text-[color:var(--ink-soft)]">Lihat Etalase Digital →</span>
            </Link>
            <Link
              href="/berita"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border border-[color:var(--line)] hover:bg-[color:var(--parchment)] transition-colors duration-200 text-sm no-underline font-medium text-[color:var(--ink)]"
            >
              <span>Berita Resmi Desa</span>
              <span className="text-xs text-[color:var(--ink-soft)]">Buka Kabar Balai Desa →</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
