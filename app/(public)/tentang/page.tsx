import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Pengelola | Desa Sukoharjo",
  description:
    "Informasi mengenai pengelola Website Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.",
  alternates: {
    canonical: "/tentang",
  },
};

export default function TentangPage() {
  return (
    <div className="font-sans">
      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Desa Sukoharjo</p>
          <h1>Tentang Pengelola Website</h1>
        </div>
      </div>

      <section className="block">
        <article className="wrap max-w-3xl space-y-4 leading-relaxed text-black text-justify [&_h2]:!mb-2 [&_h2]:!mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[color:var(--ink)]">
          <p>
            Website Desa Sukoharjo merupakan media informasi dan layanan digital
            yang dikelola oleh <strong>Pemerintah Desa Sukoharjo</strong>,
            Kecamatan Tirtomoyo, Kabupaten Wonogiri, Jawa Tengah.
          </p>

          <p>
            Website ini dikembangkan sebagai sarana untuk memudahkan masyarakat
            dalam memperoleh informasi mengenai penyelenggaraan pemerintahan
            desa, pelayanan masyarakat, kegiatan desa, potensi wilayah, serta
            informasi mengenai Usaha Mikro, Kecil, dan Menengah (UMKM) yang
            terdapat di Desa Sukoharjo.
          </p>

          <h2 className="!mb-2">Tujuan Website</h2>

          <p>
            Kehadiran website ini diharapkan dapat mendukung keterbukaan
            informasi dan meningkatkan kemudahan akses masyarakat terhadap
            informasi desa. Melalui website ini, masyarakat dapat memperoleh
            informasi secara lebih mudah tanpa harus selalu datang langsung ke
            kantor desa.
          </p>

          <p className="!mb-2">Website ini digunakan untuk mendukung beberapa fungsi utama, antara lain:</p>

          <ul className="list-disc space-y-2 pl-6">
            <li>
              menyediakan informasi mengenai Pemerintah Desa dan pelayanan
              masyarakat;
            </li>
            <li>
              menyampaikan informasi kegiatan dan program yang dilaksanakan di
              Desa Sukoharjo;
            </li>
            <li>
              mendukung keterbukaan dan penyebarluasan informasi publik desa;
            </li>
            <li>
              memperkenalkan potensi dan produk UMKM masyarakat Desa Sukoharjo;
            </li>
            <li>
              menyediakan informasi yang dapat membantu masyarakat maupun pihak
              luar mengenal Desa Sukoharjo; dan
            </li>
            <li>
              menyediakan sarana komunikasi melalui fitur yang tersedia pada
              website.
            </li>
          </ul>

          <h2>Pengelola</h2>

          <p>
            Pengelolaan website berada di bawah Pemerintah Desa Sukoharjo.
            Informasi yang berkaitan dengan penyelenggaraan pemerintahan,
            pelayanan, kegiatan, dan publikasi desa disampaikan sesuai dengan
            kebutuhan informasi masyarakat dan kewenangan Pemerintah Desa.
          </p>

          <p>
            Informasi UMKM yang ditampilkan pada website dapat berasal dari
            pemilik atau pengelola usaha. Oleh karena itu, untuk informasi
            tertentu mengenai produk, harga, ketersediaan, alamat, maupun kontak,
            masyarakat disarankan melakukan konfirmasi langsung kepada pemilik
            atau pengelola UMKM terkait.
          </p>

          <h2>Alamat Kantor Desa</h2>

          <p>
            <strong>Pemerintah Desa Sukoharjo</strong>
            <br />
            Desa Sukoharjo RT 03 RW 02 Kecamatan Tirtomoyo, Kabupaten Wonogiri, Jawa Tengah 57672
          </p>

          <h2>Kontak</h2>

          <p>
            Masyarakat dapat menghubungi Pemerintah Desa Sukoharjo melalui
            nomor berikut:
          </p>

          <p>
            Telepon: (0812) 25432772 / (0851) 73204364
            <br />
            Jam layanan: Senin–Jumat, 08.00–15.00 WIB
          </p>

          <h2>Pengembangan Website</h2>

          <p>
            Website Desa Sukoharjo dikembangkan pada tahun 2026 sebagai bagian
            dari upaya pemanfaatan teknologi digital dalam penyampaian informasi
            dan pelayanan kepada masyarakat.
          </p>

          <p>
            Pengembangan website diharapkan dapat membantu menciptakan akses
            informasi desa yang lebih mudah, terbuka, dan terstruktur sekaligus
            memberikan ruang bagi masyarakat untuk mengenalkan potensi dan
            kegiatan ekonomi yang ada di Desa Sukoharjo.
          </p>

          <h2>Hubungi Kami</h2>

          <p>
            Apabila masyarakat memiliki pertanyaan, saran, koreksi informasi,
            atau pengaduan terkait website maupun informasi yang ditampilkan,
            silakan menggunakan halaman Pengaduan atau menghubungi Pemerintah
            Desa Sukoharjo melalui kontak yang tersedia.
          </p>
        </article>
      </section>
    </div>
  );
}