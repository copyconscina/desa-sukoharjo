import Link from "next/link";
import Navbar from "@/components/Navbar";
import SukoharjoLogo from "@/components/SukoharjoLogo";
import styles from "./PublicLayout.module.css";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
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
        </div>
        <div className={`${styles.wrap} ${styles.bottom}`}>
          <span>Pemerintah Desa Sukoharjo</span>
          <span>2026 KKN Tim II Universitas Diponegoro ©</span>
        </div>
      </footer>
    </>
  );
}
