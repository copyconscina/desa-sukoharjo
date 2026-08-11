import Link from "next/link";
import Navbar from "@/components/Navbar";
import PublicBreadcrumbs from "@/components/PublicBreadcrumbs";
import SukoharjoLogo from "@/components/SukoharjoLogo";
import styles from "./PublicLayout.module.css";
import { siteUrl } from "@/lib/site";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: "Pemerintah Desa Sukoharjo",
    url: siteUrl,
    address: { "@type": "PostalAddress", streetAddress: "Desa Sukoharjo RT 03 RW 02", addressLocality: "Tirtomoyo", addressRegion: "Jawa Tengah", postalCode: "57672", addressCountry: "ID" },
    telephone: "+6281225432772",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar />
      <PublicBreadcrumbs />
      <main>{children}</main>
      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.grid}`}>
          <div>
            <div className={styles.brand}>
              <SukoharjoLogo className={styles.brandMark} />
              <span className={styles.brandText}>
                Desa Sukoharjo
              </span>
            </div>
            <p className={styles.description}>
              Website resmi Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri — media informasi desa dan etalase digital UMKM warga.
            </p>
          </div>
          <div>
            <h4>Navigasi</h4>
            <ul>
              <li>
                <Link href="/profil">Profil Desa</Link>
              </li>
              <li>
                <Link href="/umkm">Database UMKM</Link>
              </li>
              <li>
                <Link href="/berita">Berita</Link>
              </li>
              <li>
                <Link href="/potensi">Potensi Desa</Link>
              </li>
              <li>
                <Link href="/galeri">Galeri</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Kantor Desa</h4>
            <ul>
              <li>23RP+578, Desa Sukoharjo RT 03 RW 02</li>
              <li>Kec. Tirtomoyo, Kab. Wonogiri</li>
              <li>Jawa Tengah 57672</li>
              <li>Telp: (0812) 25432772 / (0851) 73204364</li>
              <li>Jam Layanan: Senin–Jumat, 08.00–15.00 WIB</li>
            </ul>
          </div>
          <div>
            <h4>Informasi</h4>
            <ul>
              <li><Link href="/tentang">Tentang Pengelola</Link></li>
              <li><Link href="/kebijakan-privasi">Kebijakan Privasi</Link></li>
              <li><Link href="/ketentuan-penggunaan">Ketentuan Penggunaan</Link></li>
            </ul>
          </div>
        </div>
        <div className={`${styles.wrap} ${styles.bottom}`}>
          <span>Pemerintah Desa Sukoharjo</span>
          <span>2026 KKN Tim II Universitas Diponegoro ©</span>
        </div>
      </footer>
    </>
  );
}
