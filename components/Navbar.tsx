"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import WonogiriLogo from "@/components/WonogiriLogo";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeAll = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  return (
    <div className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" onClick={closeAll}>
          <WonogiriLogo className="brand-mark" />
          <span className="brand-text">
            Desa Sukoharjo
            <span>Kec. Tirtomoyo · Kab. Wonogiri</span>
          </span>
        </Link>

        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Buka menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <ul className={cn("nav-links", isOpen && "open")} id="navLinks">
          <li>
            <Link
              href="/"
              className={cn(pathname === "/" && "active")}
              onClick={closeAll}
            >
              Beranda
            </Link>
          </li>

          {/* DROPDOWN PROFIL */}
          <li
            className="relative group"
            onMouseEnter={() => setActiveDropdown("profil")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={cn(
                "nav-dropdown-trigger flex items-center gap-1 w-full text-left px-3.5 py-2 rounded-full text-sm font-semibold text-[color:var(--ink-soft)] hover:bg-[color:var(--parchment-2)] hover:text-[color:var(--ink)] transition-colors cursor-pointer",
                (pathname.startsWith("/profil") || pathname.startsWith("/potensi") || pathname.startsWith("/lembaga")) && "bg-[color:var(--forest)] text-white hover:bg-[color:var(--forest)] hover:text-white"
              )}
              onClick={() => toggleDropdown("profil")}
            >
              Profil Desa <span className="text-xs">▾</span>
            </button>
            <div
              className={cn(
                "dropdown-menu absolute top-full left-0 mt-1 w-48 bg-[#fbfaf5] border border-[color:var(--line)] rounded-xl shadow-lg py-2 flex-col gap-1 z-50",
                activeDropdown === "profil" ? "flex" : "hidden"
              )}
            >
              <Link
                href="/profil"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Profil & Sejarah
              </Link>
              <Link
                href="/lembaga"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Lembaga Desa
              </Link>
              <Link
                href="/potensi"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Potensi Desa
              </Link>
            </div>
          </li>

          {/* DROPDOWN LAYANAN */}
          <li
            className="relative group"
            onMouseEnter={() => setActiveDropdown("layanan")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={cn(
                "nav-dropdown-trigger flex items-center gap-1 w-full text-left px-3.5 py-2 rounded-full text-sm font-semibold text-[color:var(--ink-soft)] hover:bg-[color:var(--parchment-2)] hover:text-[color:var(--ink)] transition-colors cursor-pointer",
                (pathname.startsWith("/agenda") || pathname.startsWith("/buku-tamu") || pathname.startsWith("/layanan-surat") || pathname.startsWith("/pengaduan")) && "bg-[color:var(--forest)] text-white hover:bg-[color:var(--forest)] hover:text-white"
              )}
              onClick={() => toggleDropdown("layanan")}
            >
              Layanan ▾
            </button>
            <div
              className={cn(
                "dropdown-menu absolute top-full left-0 mt-1 w-52 bg-[#fbfaf5] border border-[color:var(--line)] rounded-xl shadow-lg py-2 flex-col gap-1 z-50",
                activeDropdown === "layanan" ? "flex" : "hidden"
              )}
            >
              <Link
                href="/layanan-surat"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Permohonan Surat Online
              </Link>
              <Link
                href="/pengaduan"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Pengaduan & Lapor Warga
              </Link>
              <Link
                href="/agenda"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Agenda Kegiatan
              </Link>
              <Link
                href="/buku-tamu"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Buku Tamu Warga
              </Link>
            </div>
          </li>

          {/* DROPDOWN TRANSPARANSI */}
          <li
            className="relative group"
            onMouseEnter={() => setActiveDropdown("transparansi")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={cn(
                "nav-dropdown-trigger flex items-center gap-1 w-full text-left px-3.5 py-2 rounded-full text-sm font-semibold text-[color:var(--ink-soft)] hover:bg-[color:var(--parchment-2)] hover:text-[color:var(--ink)] transition-colors cursor-pointer",
                (pathname.startsWith("/produk-hukum") || pathname.startsWith("/apbdes") || pathname.startsWith("/statistik") || pathname.startsWith("/ppid") || pathname.startsWith("/bansos")) && "bg-[color:var(--forest)] text-white hover:bg-[color:var(--forest)] hover:text-white"
              )}
              onClick={() => toggleDropdown("transparansi")}
            >
              Transparansi ▾
            </button>
            <div
              className={cn(
                "dropdown-menu absolute top-full left-0 mt-1 w-52 bg-[#fbfaf5] border border-[color:var(--line)] rounded-xl shadow-lg py-2 flex-col gap-1 z-50",
                activeDropdown === "transparansi" ? "flex" : "hidden"
              )}
            >
              <Link
                href="/apbdes"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                APBDes & Keuangan
              </Link>
              <Link
                href="/statistik"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Statistik Kependudukan
              </Link>
              <Link
                href="/produk-hukum"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Produk Hukum Desa
              </Link>
              <Link
                href="/ppid"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                PPID (Informasi Publik)
              </Link>
              <Link
                href="/bansos"
                className="px-4 py-2 text-sm font-medium hover:bg-[color:var(--parchment-2)] text-[color:var(--ink)] block rounded-lg mx-1"
                onClick={closeAll}
              >
                Transparansi Bansos
              </Link>
            </div>
          </li>

          <li>
            <Link
              href="/peta"
              className={cn(pathname.startsWith("/peta") && "active")}
              onClick={closeAll}
            >
              Peta Desa
            </Link>
          </li>
          <li>
            <Link
              href="/umkm"
              className={cn(pathname.startsWith("/umkm") && "active")}
              onClick={closeAll}
            >
              UMKM
            </Link>
          </li>
          <li>
            <Link
              href="/berita"
              className={cn(pathname.startsWith("/berita") && "active")}
              onClick={closeAll}
            >
              Berita
            </Link>
          </li>
          <li>
            <Link
              href="/galeri"
              className={cn(pathname.startsWith("/galeri") && "active")}
              onClick={closeAll}
            >
              Galeri
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}


