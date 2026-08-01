import { Metadata } from "next";
import { popData } from "@/lib/data";
import { getProfilData, getLembagaList, getStatistikPenduduk } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Profil Desa Sukoharjo",
  description: "Sejarah, visi-misi, struktur pemerintahan, data kependudukan, dan kontak kantor Desa Sukoharjo.",
};

export default async function ProfilPage() {
  const profil = await getProfilData();
  const lembagaList = await getLembagaList();
  const statistik = await getStatistikPenduduk();

  const pemdes = lembagaList.find((l) => l.name.toLowerCase().includes("pemerintah")) || lembagaList[0];
  const dusunList = statistik.dusunList?.length
    ? statistik.dusunList
    : popData.map((p) => ({ nama: p.label, rt: 0, rw: 0, jiwa: p.val, kk: 0 }));
  const popMax = Math.max(...dusunList.map((d) => d.jiwa || 1));

  return (
    <div className="font-sans">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="terraces" aria-hidden="true" style={{ opacity: 0.5 }}>
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none">
            <polygon points="0,300 0,240 1200,280 1200,300" fill="#2d4425" />
            <polygon points="0,240 0,190 1200,230 1200,280" fill="#39542f" />
          </svg>
        </div>
        <div className="wrap">
          <p className="eyebrow on-dark">Profil Desa</p>
          <h1>Sejarah, arah, dan struktur pemerintahan Sukoharjo</h1>
        </div>
      </div>

      {/* SEJARAH & VISI MISI */}
      <section className="block">
        <div className="wrap two-col">
          <div>
            <p className="eyebrow">Sejarah Desa</p>
            <h2 style={{ marginTop: "10px", marginBottom: "24px" }}>
              Dari Desa Bonagung menjadi Desa Sukoharjo
            </h2>
            <div className="timeline">
              <div>
                <div className="yr">Era Kolonial Belanda</div>
                <p>
                  Sebelum dikenal dengan nama Sukoharjo, wilayah ini secara administratif merupakan bagian dari Desa Bonagung dengan cakupan daerah yang sangat luas membentang dari Tirtomoyo hingga Baturetno. Keberadaan kesenian tradisional Srandil yang kerap mendatangkan keramaian dan kebahagiaan bagi masyarakat setempat menginspirasi Pemerintah Kolonial Belanda kala itu untuk menyematkan nama Desa Sukoharjo.
                </p>
              </div>
              <div>
                <div className="yr">1941 (Penggabungan Wilayah)</div>
                <p>
                  Kedua wilayah administratif akhirnya secara resmi diintegrasikan menjadi satu kesatuan di bawah nama Desa Sukoharjo. Diambil dari perpaduan kata bahasa Jawa "Suko" yang bermakna kemakmuran atau kebahagiaan dan "Harjo" yang berarti keselamatan atau kesejahteraan, nama ini melambangkan harapan luhur terwujudnya desa yang makmur, aman, dan sentosa.
                </p>
              </div>
              <div>
                <div className="yr">1955 – Sekarang</div>
                <p>
                  Setelah periode kepemimpinan Siswo Sutirto, estafet kepemimpinan Desa Sukoharjo diampu secara berturut-turut oleh Sastro Darwoso (1955–2002), Sunarto (2002–2012), dan Sartono (2012–2019), sebelum sempat diisi oleh Prihastanto, SE., MM. sebagai Penjabat Kepala Desa. Melalui pemilihan kepala desa (Pilkades) tahun 2019, Sunarto kembali dipercaya oleh masyarakat untuk mengemban mandat sebagai Kepala Desa Sukoharjo hingga masa jabatan saat ini.
                </p>
              </div>
            </div>
          </div>
          <Card className="vm-card border-none shadow-none text-white">
            <h3 className="text-white">Visi</h3>
            <p className="text-[#e7e6d6]">"{profil.visi}"</p>
            <h3 className="text-white" style={{ marginTop: "20px" }}>Misi</h3>
            <ul className="text-[#e7e6d6]">
              {profil.misi.map((m: string, idx: number) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* STRUKTUR PEMERINTAHAN */}
      <section className="block on-parchment2">
        <div className="wrap">
          <div className="section-head" style={{ margin: "0 auto 30px", textAlign: "center" }}>
            <p className="eyebrow" style={{ textAlign: "center" }}>
              Struktur Pemerintahan
            </p>
            <h2>Perangkat Desa Sukoharjo</h2>
            {pemdes && (
              <div className="flex justify-center items-center gap-2 mt-2">
                <Badge className="bg-[color:var(--forest)] text-white text-xs px-3 py-1 border-none">
                  {pemdes.members}
                </Badge>
                <span className="text-xs font-mono text-[color:var(--clay)] font-semibold">{pemdes.leader}</span>
              </div>
            )}
          </div>
          <div className="org-chart">
            <div className="org-node top">
              Kepala Desa
              <small>Sunarto</small>
            </div>
            <div className="org-node">
              Sekretaris Desa
              <small>Eri Suryani</small>
            </div>
            <div className="org-row">
              <div className="org-node">
                Kaur Keuangan
                <small>Ade Nur Pratama</small>
              </div>
              <div className="org-node">
                Kaur Tata Usaha & Umum
                <small>Indra Suryawati</small>
              </div>
              <div className="org-node">
                Kaur Perencanaan
                <small>Siti Rahmawati</small>
              </div>
            </div>
            <div className="org-row">
              <div className="org-node">
                Kasi Pemerintahan
                <small>Sisca Cahyani</small>
              </div>
              <div className="org-node">
                Kasi Kesejahteraan
                <small>Unik Wulandari</small>
              </div>
              <div className="org-node">
                Kasi Pelayanan
                <small>Susilo</small>
              </div>
            </div>
            <div className="org-row">
              <div className="org-node">
                Kadus Blaraksari, Sukoharjo, dan Jati
                <small>Dwijoko Widyanto</small>
              </div>
              <div className="org-node">
                Kadus Tulakan dan Pule
                <small>Surahni</small>
              </div>
              <div className="org-node">
                Kadus Ngandong
                <small>Septyan Dwihanto</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DATA KEPENDUDUKAN */}
      <section className="block">
        <div className="wrap two-col">
          <div>
            <p className="eyebrow">Data Kependudukan</p>
            <h2 style={{ margin: "10px 0 24px" }}>Sebaran penduduk per dusun</h2>
            <div id="pop-chart">
              {dusunList.map((d, idx) => (
                <div key={idx} className="pop-bar-row">
                  <div className="pop-bar-label">{d.nama}</div>
                  <div className="pop-bar-track">
                    <div
                      className="pop-bar-fill"
                      style={{ width: `${(((d.jiwa || 0) / popMax) * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <div className="pop-bar-num">
                    {d.jiwa} jiwa
                    {d.kk ? (
                      <span className="text-xs text-[color:var(--ink-soft)] font-normal ml-2">({d.kk} KK)</span>
                    ) : (
                      <span className="text-xs text-[color:var(--ink-soft)] font-normal ml-2">({Math.round((d.jiwa || 0) / 3.4)} KK)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KONTAK & LOKASI KANTOR DESA */}
      <section className="block on-parchment2">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Kontak</p>
            <h2>Hubungi Kantor Desa Sukoharjo</h2>
          </div>
          <div className="contact-grid" style={{ marginTop: "24px" }}>
            <div>
              <div className="contact-item">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3>Alamat Kantor Desa</h3>
                  <p>
                     Desa Sukoharjo RT 03/ RW 02, Kec. Tirtomoyo, Kab. Wonogiri, Jawa Tengah 57672
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h3>Email</h3>
                  <p>desasukoharjotio11@gmail.go.id</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <div>
                  <h3>Jam Layanan</h3>
                  <p>Senin–Jumat, 08.00–15.00 WIB</p>
                </div>
              </div>
            </div>
            <div style={{ height: "100%", minHeight: "340px", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <iframe
                src="https://maps.google.com/maps?q=Kantor%20Kepala%20Desa%20Sukoharjo%20Tirtomoyo%20Wonogiri&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "340px" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}