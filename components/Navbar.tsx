"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import SukoharjoLogo from "@/components/SukoharjoLogo";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeAll = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.nav} ref={navRef}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={closeAll}>
          <SukoharjoLogo className={styles.brandMark} />
          <span className={styles.brandText}>
            Desa Sukoharjo
            <span>Kec. Tirtomoyo · Kab. Wonogiri</span>
          </span>
        </Link>

        <button
          className={styles.toggle}
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

        <ul className={cn(styles.links, isOpen && styles.open)} id="navLinks">
          <li>
            <Link
              href="/"
              className={cn(pathname === "/" && styles.active)}
              onClick={closeAll}
            >
              Beranda
            </Link>
          </li>

          {/* DROPDOWN PROFIL */}
          <li className="relative group">
            <button
              className={cn(
                styles.trigger, "flex items-center gap-1 w-full text-left cursor-pointer",
                (pathname.startsWith("/profil") || pathname.startsWith("/potensi") || pathname.startsWith("/lembaga")) && styles.active
              )}
              onClick={() => toggleDropdown("profil")}
            >
              Profil Desa ▾
            </button>
            <div
              className={cn(
                styles.dropdown, "absolute top-full left-0 mt-1 w-48 bg-[#fbfaf5] border border-[color:var(--line)] rounded-xl shadow-lg py-2 flex-col gap-1 z-50",
                activeDropdown === "profil" ? "flex" : "hidden"
              )}
            >
              <Link
                href="/profil"
                className={cn(pathname.startsWith("/profil") && styles.active)}
                onClick={closeAll}
              >
                Profil & Sejarah
              </Link>
              <Link
                href="/lembaga"
                className={cn(pathname.startsWith("/lembaga") && styles.active)}
                onClick={closeAll}
              >
                Lembaga Desa
              </Link>
              <Link
                href="/potensi"
                className={cn(pathname.startsWith("/potensi") && styles.active)}
                onClick={closeAll}
              >
                Potensi Desa
              </Link>
            </div>
          </li>

          {/* DROPDOWN LAYANAN */}
          <li className="relative group">
            <button
              className={cn(
                styles.trigger, "flex items-center gap-1 w-full text-left cursor-pointer",
                (pathname.startsWith("/agenda") || pathname.startsWith("/buku-tamu") || pathname.startsWith("/pengaduan")) && styles.active
              )}
              onClick={() => toggleDropdown("layanan")}
            >
              Layanan ▾
            </button>
            <div
              className={cn(
                styles.dropdown, "absolute top-full left-0 mt-1 w-52 bg-[#fbfaf5] border border-[color:var(--line)] rounded-xl shadow-lg py-2 flex-col gap-1 z-50",
                activeDropdown === "layanan" ? "flex" : "hidden"
              )}
            >
              <Link
                href="/pengaduan"
                className={cn(pathname.startsWith("/pengaduan") && styles.active)}
                onClick={closeAll}
              >
                Pengaduan & Lapor Warga
              </Link>
              <Link
                href="/agenda"
                className={cn(pathname.startsWith("/agenda") && styles.active)}
                onClick={closeAll}
              >
                Agenda Kegiatan
              </Link>
              <Link
                href="/buku-tamu"
                className={cn(pathname.startsWith("/buku-tamu") && styles.active)}
                onClick={closeAll}
              >
                Buku Tamu Warga
              </Link>
            </div>
          </li>

          {/* DROPDOWN TRANSPARANSI */}
          <li className="relative group">
            <button
              className={cn(
                styles.trigger, "flex items-center gap-1 w-full text-left cursor-pointer",
                (pathname.startsWith("/produk-hukum") || pathname.startsWith("/apbdes") || pathname.startsWith("/statistik")) && styles.active
              )}
              onClick={() => toggleDropdown("transparansi")}
            >
              Transparansi ▾
            </button>
            <div
              className={cn(
                styles.dropdown, "absolute top-full left-0 mt-1 w-52 bg-[#fbfaf5] border border-[color:var(--line)] rounded-xl shadow-lg py-2 flex-col gap-1 z-50",
                activeDropdown === "transparansi" ? "flex" : "hidden"
              )}
            >
              <Link
                href="/apbdes"
                className={cn(pathname.startsWith("/apbdes") && styles.active)}
                onClick={closeAll}
              >
                APBDes & Keuangan
              </Link>
              <Link
                href="/produk-hukum"
                className={cn(pathname.startsWith("/produk-hukum") && styles.active)}
                onClick={closeAll}
              >
                Produk Hukum Desa
              </Link>
              <Link
                href="/statistik"
                className={cn(pathname.startsWith("/statistik") && styles.active)}
                onClick={closeAll}
              >
                Statistik Kependudukan
              </Link>
            </div>
          </li>

          <li>
            <Link
              href="/umkm"
              className={cn(pathname.startsWith("/umkm") && styles.active)}
              onClick={closeAll}
            >
              UMKM
            </Link>
          </li>
          <li>
            <Link
              href="/berita"
              className={cn(pathname.startsWith("/berita") && styles.active)}
              onClick={closeAll}
            >
              Berita
            </Link>
          </li>
          <li>
            <Link
              href="/galeri"
              className={cn(pathname.startsWith("/galeri") && styles.active)}
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


