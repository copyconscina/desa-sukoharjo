import Link from "next/link";
import Navbar from "@/components/Navbar";
import WonogiriLogo from "@/components/WonogiriLogo";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer>
        <div className="wrap footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: "12px" }}>
              <WonogiriLogo className="brand-mark" />
              <span className="brand-text" style={{ color: "#fcfcf8" }}>
                Desa Sukoharjo
              </span>
            </div>
            <p style={{ color: "#dfe3d6", fontSize: "14px", maxWidth: "320px" }}>
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
              <li>23RP+578, Sukorejo, Sukoharjo</li>
              <li>Kec. Tirtomoyo, Kab. Wonogiri</li>
              <li>Jawa Tengah 57672</li>
              <li>Telp: (0821) 38002221</li>
            </ul>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span>© 2026 Pemerintah Desa Sukoharjo.</span>
          <span>KKN Tim II Universitas Diponegoro</span>
        </div>
      </footer>
    </>
  );
}
