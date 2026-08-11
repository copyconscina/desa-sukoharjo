import {
  getBeritaList,
  getGaleriList,
  getUmkmList,
  getPotensiList,
  getLembagaList,
  getPengaduanList,
  getProdukHukumList,
  getAdminActivityList,
} from "@/lib/db";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

type GalleryWithCreatedAt = {
  label: string;
  created_at?: string | null;
};

export const metadata: Metadata = {
  title: "Dashboard Admin Desa Sukoharjo",
  description: "Website Resmi Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri — media informasi desa dan etalase digital UMKM warga.",
};

export const dynamic = "force-dynamic";

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 30) return `${days} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardPage() {
  const [
    newsList,
    galleryList,
    umkmList,
    potentialsList,
    lembagaList,
    pengaduanList,
    produkHukumList,
    activityLog,
  ] = await Promise.all([
    getBeritaList(),
    getGaleriList(),
    getUmkmList(),
    getPotensiList(),
    getLembagaList(),
    getPengaduanList(),
    getProdukHukumList(),
    getAdminActivityList(),
  ]);

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
      label: "Galeri",
      value: galleryList.length + potentialsList.length,
      desc: "Foto dokumentasi & sektor desa",
      href: "/admin/dashboard/galeri",
      color: "border-l-4 border-l-[color:var(--sawah)]",
      ic: "🖼️",
    },
  ];
type ActivityItem = {
  type: string;
  title: string;
  label: string;
  sortDate: string | null;
  href: string;
  color: string;
};

const activityMeta: Record<string, Pick<ActivityItem, "href" | "color">> = {
  Berita: { href: "/admin/dashboard/berita", color: "bg-[color:var(--forest-deep)]" },
  Galeri: { href: "/admin/dashboard/galeri", color: "bg-[color:var(--sawah)]" },
  UMKM: { href: "/admin/dashboard/umkm", color: "bg-[color:var(--clay)]" },
  Profil: { href: "/admin/dashboard/profil", color: "bg-[color:var(--forest)]" },
  Layanan: { href: "/admin/dashboard/layanan", color: "bg-[color:var(--padi)]" },
  Transparansi: { href: "/admin/dashboard/transparansi", color: "bg-[color:var(--red)]" },
};

const recentActivity: ActivityItem[] = [
  ...activityLog.map((item): ActivityItem => {
    const meta = activityMeta[item.module] || activityMeta.Profil;
    return {
      type: item.module,
      title: item.title,
      label: timeAgo(item.created_at),
      sortDate: item.created_at,
      ...meta,
    };
  }),
  // Riwayat lama sebelum tabel log tersedia tetap ditampilkan.
  ...newsList.slice(0, 5).map((item): ActivityItem => ({
    type: "Berita",
    title: item.title,
    label: item.date,
    sortDate: item.publishedAt || null,
    href: "/admin/dashboard/berita",
    color: "bg-[color:var(--forest-deep)]",
  })),
  ...galleryList.slice(0, 5).map((item): ActivityItem => {
    const galleryItem = item as GalleryWithCreatedAt;
    return {
    type: "Galeri",
    title: galleryItem.label,
    label: galleryItem.created_at ? timeAgo(galleryItem.created_at) : "Baru ditambahkan",
    sortDate: galleryItem.created_at || null,
    href: "/admin/dashboard/galeri",
    color: "bg-[color:var(--sawah)]",
    };
  }),
  ...pengaduanList.slice(0, 5).map((item): ActivityItem => ({
    type: "Pengaduan",
    title: item.judul,
    label: item.tanggal ?? "-",
    sortDate: item.tanggal || null,
    href: "/admin/dashboard/layanan",
    color: "bg-[color:var(--forest)]",
  })),
]
  .filter((item) => item.sortDate && !isNaN(new Date(item.sortDate).getTime()))
  .sort((a, b) => new Date(b.sortDate!).getTime() - new Date(a.sortDate!).getTime())
  .slice(0, 6);
  
  return (
    <div className="admin-dashboard flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="admin-welcome">
        <p className="eyebrow">Ringkasan Panel</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Selamat Datang, Administrator
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Pantau dan kelola seluruh konten Website Desa Sukoharjo dari satu tempat — mulai dari Profil & Lembaga, Layanan Warga, Transparansi Keuangan, Berita, Galeri, hingga Database UMKM. Pilih salah satu modul di bawah untuk mulai mengelola.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Link href={stat.href} key={idx} className="no-underline group">
            <Card className={`admin-stat-card bg-[color:var(--card)] p-6 border border-[color:var(--line)] transition-all duration-300 flex items-start justify-between ${stat.color} h-full`}>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase font-mono tracking-wider text-[color:var(--ink-soft)]">
                  {stat.label}
                </span>
                <span className="text-3xl font-bold font-heading my-1 text-[color:var(--ink)]">
                  {stat.value}
                </span>
                <span className="text-xs text-[color:var(--ink-soft)] group-hover:text-[color:var(--forest)] transition-colors duration-200">
                  {stat.desc}
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
        <Card className="admin-surface border border-[color:var(--line)] p-6 bg-[color:var(--card)] flex flex-col gap-4">
            <span className="top-0 text-[10px] font-bold tracking-wider text-white bg-[color:var(--red)] px-2 py-0.5 rounded-bl-lg">
             PENTING
             </span>
          <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
            Panduan Pengelolaan Website
          </h3>
          <Link
            href="/panduan-admin.pdf"
            target="_blank"
            className="group flex items-center gap-4 p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--forest)]/5 hover:bg-[color:var(--forest)]/10 hover:border-[color:var(--forest)] transition-all duration-200 no-underline mt-2"
          >
                <div className="relative w-11 h-14 rounded-md overflow-hidden border border-[color:var(--line)] bg-white shrink-0 shadow-sm">
                  <Image
                    src="/panduan-admin-thumb.png"
                    alt="Sampul Buku Panduan Admin"
                    fill
                    className="object-cover object-top"
                  />
                </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">
                Buku Panduan Lengkap Admin
              </span>
              <span className="text-xs text-[color:var(--ink-soft)]">
                Panduan langkah demi langkah mengelola seluruh fitur website
              </span>
            </div>
            <span className="text-xs font-medium text-[color:var(--forest)] group-hover:translate-x-1 transition-transform duration-200 shrink-0">
              Buka
            </span>
          </Link>
        </Card>

        <Card className="admin-surface border border-[color:var(--line)] p-6 bg-[color:var(--card)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
            Aktivitas Terbaru
          </h3>
          <span className="text-xs text-[color:var(--ink-soft)]">
            {recentActivity.length} perubahan
          </span>
        </div>

        <div className="flex flex-col divide-y divide-[color:var(--line)]">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-soft)] py-4 text-center">
              Belum ada aktivitas tercatat
            </p>
          ) : (
            recentActivity.map((item, idx) => (
              <Link
                href={item.href}
                key={idx}
                className="group flex items-center gap-3 py-3 no-underline hover:bg-[color:var(--parchment-2)] -mx-2 px-2 rounded-lg transition-colors duration-150"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full text-white shrink-0 ${item.color}`}>
                      {item.type}
                    </span>
                    <span className="text-sm font-medium text-[color:var(--ink)] truncate">
                      {item.title || "(Tanpa judul)"}
                    </span>
                  </div>
                  <span className="text-xs text-[color:var(--ink-soft)] pl-0.5">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs text-[color:var(--ink-soft)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                  →
                </span>
              </Link>
            ))
          )}
        </div>
      </Card>
      </div>
    </div>
  );
}
