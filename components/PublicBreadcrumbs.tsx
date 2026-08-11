"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  agenda: "Agenda",
  apbdes: "APBDes",
  berita: "Berita",
  "buku-tamu": "Buku Tamu",
  galeri: "Galeri",
  "kebijakan-privasi": "Kebijakan Privasi",
  "ketentuan-penggunaan": "Ketentuan Penggunaan",
  lembaga: "Lembaga",
  pengaduan: "Pengaduan",
  potensi: "Potensi",
  "produk-hukum": "Produk Hukum",
  profil: "Profil",
  statistik: "Statistik",
  tentang: "Tentang",
  umkm: "UMKM",
};

function labelFor(segment: string) {
  return LABELS[segment] ?? segment.replace(/-/g, " ");
}

export default function PublicBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "admin") return null;

  const crumbs = segments.map((segment, index) => ({
    label: /^\d+$/.test(segment) ? `Detail ${segment}` : labelFor(segment),
    href: `/${segments.slice(0, index + 1).join("/")}`,
  }));

  return (
    <nav className="wrap mt-4 text-xs text-[color:var(--ink-soft)]" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-[color:var(--forest)]">
            Beranda
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span className="capitalize text-[color:var(--ink)]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="capitalize hover:text-[color:var(--forest)]">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
