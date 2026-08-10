import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { STAT } from "@/lib/data";
import { getUmkmList, getBeritaList, getGaleriList, getPotensiList } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "Selamat Datang di Desa Sukoharjo — Tirtomoyo, Wonogiri",
  description: "Website Resmi Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri — media informasi desa dan etalase digital UMKM warga.",
};

export default async function Home() {
  const umkmData = await getUmkmList();
  const beritaData = await getBeritaList();
  const galeriData = await getGaleriList();
  const potensiData = await getPotensiList();
  return (
    <div className="font-sans">
      {/* HERO SECTION */}
      <div className="hero">
        <div className="terraces" aria-hidden="true">
          <svg viewBox="0 0 1200 520" preserveAspectRatio="none">
            <polygon points="0,520 0,420 1200,470 1200,520" fill="#2d4425" />
            <polygon points="0,420 0,340 1200,400 1200,470" fill="#39542f" />
            <polygon points="0,340 0,270 1200,330 1200,400" fill="#44603a" />
            <polygon points="0,270 0,210 1200,260 1200,330" fill="#4d6b40" opacity="0.9" />
          </svg>
        </div>
        <div className="hero-inner hero-cascade">
          <p className="eyebrow on-dark">Website Resmi Pemerintah Desa</p>
          <h1 className="font-heading text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.03] font-semibold tracking-[-0.01em]">
            Sukoharjo, desa yang tumbuh dari <em>sawah, karya, dan usaha warganya.</em>
          </h1>
          <p className="lead">
            Terletak di lereng Tirtomoyo, Wonogiri — Sukoharjo menghubungkan cerita desa, potensi usaha, dan peluang wisata alam perbukitan. Website ini menjadi pintu informasi bagi warga, investor, dan pendamping desa.
          </p>
          <div className="hero-cta">
            <Button asChild className="btn btn-primary border-none">
              <Link href="/umkm">Jelajahi Database UMKM</Link>
            </Button>
            <Button asChild className="btn btn-ghost border border-white/35">
              <Link href="/profil">Kenali Desa Kami</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="terrace-divider" aria-hidden="true">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
          <polygon points="0,60 0,30 300,55 600,20 900,50 1200,10 1200,60" fill="#fbfaf5" />
        </svg>
      </div>

      {/* STAT STRIP */}
      <div className="stat-strip wrap" style={{ borderTop: "none" }}>
        <Reveal direction="up" className="stat">
          <div className="num">{STAT.dusun}</div>
          <div className="lbl">Dusun</div>
        </Reveal>
        <Reveal direction="up" delay={70} className="stat">
          <div className="num">{STAT.population}</div>
          <div className="lbl">Jiwa Penduduk</div>
        </Reveal>
        <Reveal direction="up" delay={140} className="stat">
          <div className="num">{STAT.umkm}+</div>
          <div className="lbl">UMKM Terdaftar</div>
        </Reveal>
      </div>

      {/* PROFIL SINGKAT */}
      <section className="block">
        <div className="wrap two-col">
          <Reveal direction="left">
            <p className="eyebrow">Profil Singkat</p>
            <h2 style={{ marginTop: "10px" }} className="text-[clamp(1.4rem,2vw,4rem)]  font-semibold leading-[1.03] tracking-[-0.01em]">Pesona Bentang Alam Perbukitan di Jalur Tirtomoyo–Baturetno</h2>
            <p style={{ marginTop: "16px" }}>
              Terletak strategis di Kecamatan Tirtomoyo, Kabupaten Wonogiri, Jawa Tengah, Desa Sukoharjo membentang di atas wilayah seluas 837,77 hektare. Potensi geografisnya diwarnai oleh bentang alam berupa 637,31 hektare lahan kering produktif serta 101,29 hektare area persawahan yang subur. Secara batas wilayah administratif, Desa Sukoharjo berdampingan langsung dengan Desa Girirejo di utara, Desa Hargosari di selatan, Desa Hargorejo di timur, serta Desa Wiroko di sebelah barat.
            </p>
            <p style={{ marginTop: "12px" }}>
              Portal resmi ini hadir sebagai perpanjangan tangan layanan Pemerintah Desa Sukoharjo untuk menghadirkan pusat informasi satu pintu yang transparan. Di sini, masyarakat dapat mengakses data profil desa secara terbuka, mengikuti perkembangan kabar berita teraktual, serta menjelajahi etalase digital produk UMKM unggulan karya warga desa.
            </p>
          </Reveal>
          <Reveal direction="right" delay={100} className="umkm-mini" style={{ flexDirection: "column", gap: "14px" }}>
            <p className="text-2xl italic bold eyebrow">UMKM Unggulan</p>
            {umkmData.slice(0, 3).map((u) => (
              <Card key={u.id} className="umkm-mini border border-[color:var(--line)] shadow-none" style={{ width: "100%" }}>
                <div className="thumb" style={u.image ? { backgroundImage: `url(${u.image})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: u.grad }} />
                <div>
                  <div className="cat">{u.category}</div>
                  <h3 className="font-heading">{u.name}</h3>
                  <p className="desc">{u.desc}</p>
                </div>
              </Card>
            ))}
            <Button asChild className="btn btn-dark border-none" style={{ alignSelf: "flex-start" }}>
              <Link href="/umkm">Lihat Semua UMKM</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* POTENSI DESA */}
      <section className="block on-parchment2 tight">
        <div className="wrap">
          <div className="section-head" style={{ maxWidth: "100%" }}>
            <p className="eyebrow">Potensi Desa</p>
            <h2 style={{ marginTop: "10px" }} className="text-[clamp(1.4rem,2vw,4rem)] font-heading font-semibold tracking-[-0.01em]">
              Kekayaan Sumber Daya dan Potensinya
            </h2>
          </div>
          <div className="grid cols-2" style={{ marginTop: "24px" }}>
            {potensiData.slice(0, 2).map((p, idx) => (
              <Reveal key={p.num} direction="up" delay={idx * 60}>
              <Card className="card shadow-none border border-[color:var(--line)]" style={{ padding: "20px" }}>
                <div
                  className="eyebrow"
                  style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)", fontStyle: "italic", marginBottom: "8px" }}
                >
                  {p.num}
                </div>
                <h3 style={{ marginBottom: "8px" }} className="font-heading text-[clamp(0.5rem,2vw,1.25rem)] font-semibold tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p style={{ fontSize: "13px" }}>{p.desc}</p>
              </Card>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Button asChild className="btn btn-dark border-none">
              <Link href="/potensi">Lihat Potensi Lengkap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* GALERI PREVIEW */}
      <section className="block tight">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Dokumentasi</p>
            <h2 style={{ marginTop: "10px" }} className="text-[clamp(1.4rem,2vw,4rem)] font-heading font-semibold">Momen di Desa Sukoharjo</h2>
          </div>
          <div className="gal-grid" style={{ marginTop: "24px" }}>
            {galeriData.slice(0, 4).map((g, idx) => (
              <Reveal key={idx} direction="up" delay={idx * 60} className="gal-tile" style={g.image ? { backgroundImage: `url(${g.image})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: g.grad }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>{g.label}</span>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Button asChild className="btn btn-dark border-none">
              <Link href="/galeri">Lihat Galeri Lengkap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* INFORMASI TERBARU */}
      <section className="block on-parchment2 tight">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Informasi Terbaru</p>
            <h2 style={{ marginTop: "10px" }} className="text-[clamp(1.4rem,2vw,4rem)] font-heading font-semibold">
              Kabar dari Balai Desa
            </h2>
          </div>
          <div className="grid cols-3" style={{ marginTop: "24px" }}>
            {beritaData.slice(0, 3).map((b, idx) => {
              const firstImage = b.images ? b.images.split(",")[0] : null;
              return (
                <Reveal key={idx} direction="up" delay={idx * 70} className="h-full">
                <Link href={`/berita/${b.id}`} target="_blank" style={{ textDecoration: "none", color: "inherit" }} className="h-full block">
                  <Card 
                    className="card info-card shadow-none border border-[color:var(--line)] transition-transform hover:-translate-y-1 hover:shadow-sm duration-200 cursor-pointer h-full flex flex-col justify-between overflow-hidden"
                    style={{ padding: 0 }}
                  >
                    {firstImage && (
                      <div className="w-full h-44 overflow-hidden border-b border-[color:var(--line)] relative bg-black/5">
                        <Image
                          src={firstImage}
                          alt={b.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Badge className={`tag ${b.cls} border-none w-fit inline-flex justify-center`} variant="default" style={{ height: "auto", margin: 0 }}>
                          {b.tag}
                        </Badge>
                        <h3 className="font-heading" style={{ margin: 0, fontSize: "1.15rem", lineHeight: "1.35", color: "var(--ink)" }}>{b.title}</h3>
                        <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "14px", lineHeight: "1.5" }} className="line-clamp-3">{b.desc}</p>
                      </div>
                      <div className="date" style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "12px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                        {b.date}
                      </div>
                    </div>
                  </Card>
                </Link>
                </Reveal>
              );
            })}
          </div>
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Button asChild className="btn btn-dark border-none">
              <Link href="/berita">Lihat Semua Berita</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
