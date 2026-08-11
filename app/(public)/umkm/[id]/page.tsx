import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getUmkmList, getUmkmById } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MediaCarousel from "@/components/MediaCarousel";
import { defaultOgImage } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const umkmData = await getUmkmList();
  return umkmData.map((u) => ({
    id: u.id.toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const u = await getUmkmById(parseInt(id));
  if (!u) {
    return {
      title: "UMKM Tidak Ditemukan",
    };
  }
  return {
    title: `${u.name} — Detail UMKM Desa Sukoharjo`,
    description: u.desc,
    alternates: { canonical: `/umkm/${id}` },
    openGraph: { type: "website", title: u.name, description: u.desc, images: [{ url: u.image || defaultOgImage, alt: u.name }] },
    twitter: { card: "summary_large_image", title: u.name, description: u.desc, images: [u.image || defaultOgImage] },
  };
}

export default async function UmkmDetailPage({ params }: Props) {
  const { id } = await params;
  const u = await getUmkmById(parseInt(id));

  if (!u) {
    notFound();
  }
  const umkmList = await getUmkmList();
  const currentIndex = umkmList.findIndex((item) => item.id === u.id);
  const previousUmkm = currentIndex > 0 ? umkmList[currentIndex - 1] : undefined;
  const nextUmkm = currentIndex >= 0 && currentIndex < umkmList.length - 1 ? umkmList[currentIndex + 1] : undefined;

  const icTag = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <path d="M20.59 13.41 12 22l-9-9V4a1 1 0 0 1 1-1h9z" />
      <circle cx="7" cy="8" r="1.4" />
    </svg>
  );
  const icPin = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
  const icCal = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="3" y1="11" x2="21" y2="11" />
    </svg>
  );
  const icShare = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
  const icChat = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const icPhone = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const waText = encodeURIComponent(
    `Halo ${u.name}, saya melihat profil usaha Anda di Website Desa Sukoharjo dan tertarik untuk bertanya lebih lanjut.`
  );

  const cleanWa = u.wa ? u.wa.replace(/[^0-9]/g, "") : "";
  const mapsLink = u.mapsUrl || u.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.name + " " + u.address)}`;

  return (
    <div className="font-sans">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="wrap">
          <Button asChild className="btn btn-ghost border border-white/35" style={{ marginBottom: "20px", display: "inline-flex" }}>
            <Link href="/umkm">← Kembali ke Database</Link>
          </Button>
          <p className="eyebrow on-dark">Detail UMKM</p>
          <h1 style={{ marginTop: "8px" }}>{u.name}</h1>
        </div>
      </div>

      {/* DETAIL CONTENT */}
      <section className="block" style={{ paddingBottom: "24px" }}>
        <div className="wrap two-col">
          <div>
            <div className="mb-6">
              <MediaCarousel
                imagesData={u.images}
                coverImage={u.image}
                title={u.name}
                badge={u.category}
                grad={u.grad}
                aspectRatio="h-[280px] sm:h-[360px]"
                thumbnailContainerClassName="bg-[color:var(--parchment-2)] border-[color:var(--line)]"
              />
            </div>
            {u.tagline && <h2 style={{ marginBottom: "12px" }}>{u.tagline}</h2>}
            <p style={{ fontSize: "15px", lineHeight: "1.6", color: "var(--ink-soft)" }}>
              {u.desc}
            </p>
          </div>

          <Card className="card border border-[color:var(--line)] shadow-none" style={{ padding: "14px 18px", borderRadius: "var(--radius)" }}>
            <h3 style={{ borderBottom: "1px solid var(--line)", paddingBottom: "4px", marginBottom: "8px", fontSize: "16px" }}>
              Informasi Usaha
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="detail-row" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--forest)", marginTop: "2px", flexShrink: 0 }}>
                  {icTag}
                </div>
                <div>
                  <div className="lbl" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)", color: "var(--ink-soft)", marginBottom: "0px" }}>Produk Unggulan</div>
                  <div className="val" style={{ fontSize: "13.5px", color: "var(--ink)", fontWeight: "600" }}>{u.product}</div>
                </div>
              </div>

              <div className="detail-row" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--forest)", marginTop: "2px", flexShrink: 0 }}>
                  {icPin}
                </div>
                <div>
                  <div className="lbl" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)", color: "var(--ink-soft)", marginBottom: "0px" }}>Alamat</div>
                  <div className="val" style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: "1.4" }}>{u.address}</div>
                </div>
              </div>

              <div className="detail-row" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--forest)", marginTop: "2px", flexShrink: 0 }}>
                  {icCal}
                </div>
                <div>
                  <div className="lbl" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)", color: "var(--ink-soft)", marginBottom: "0px" }}>Tahun Berdiri</div>
                  <div className="val" style={{ fontSize: "13.5px", color: "var(--ink)" }}>{u.year}</div>
                </div>
              </div>

              {u.phone ? (
                <div className="detail-row" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ color: "var(--forest)", marginTop: "2px", flexShrink: 0 }}>
                    {icPhone}
                  </div>
                  <div>
                    <div className="lbl" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)", color: "var(--ink-soft)", marginBottom: "0px" }}>No. Telepon Seluler/Biasa</div>
                    <a href={`tel:${u.phone.replace(/[^0-9+]/g, '')}`} className="val" style={{ fontSize: "13.5px", color: "var(--ink)", fontWeight: "600" }}>
                      {u.phone}
                    </a>
                  </div>
                </div>
              ) : null}

              {u.social ? (
                <div className="detail-row" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ color: "var(--forest)", marginTop: "2px", flexShrink: 0 }}>
                    {icShare}
                  </div>
                  <div>
                    <div className="lbl" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)", color: "var(--ink-soft)", marginBottom: "0px" }}>Media Sosial</div>
                    <div className="val" style={{ fontSize: "13.5px", color: "var(--ink)" }}>{u.social}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {cleanWa ? (
                <Button asChild className="btn btn-wa border-none w-full" style={{ display: "inline-flex", justifyContent: "center" }}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${cleanWa}?text=${waText}`}
                  >
                    {icChat} <span style={{ marginLeft: "8px" }}>Hubungi via WhatsApp</span>
                  </a>
                </Button>
              ) : null}

              {u.phone ? (
                <Button asChild className="btn btn-ghost border border-[color:var(--line)] text-[color:var(--ink)] w-full" style={{ display: "inline-flex", justifyContent: "center" }}>
                  <a href={`tel:${u.phone.replace(/[^0-9+]/g, '')}`}>
                    {icPhone} <span style={{ marginLeft: "8px" }}>Panggil Telepon ({u.phone})</span>
                  </a>
                </Button>
              ) : null}

              <Button asChild className="btn btn-dark border-none w-full" style={{ display: "inline-flex", justifyContent: "center" }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={mapsLink}
                >
                  {icPin} <span style={{ marginLeft: "8px" }}>Buka Petunjuk Arah di Google Maps</span>
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      <section aria-label="Navigasi UMKM" style={{ padding: "20px 0" }}>
        <div className="wrap flex flex-col sm:flex-row gap-3 justify-between">
          {previousUmkm ? <Button asChild className="btn btn-ghost border border-[color:var(--line)]"><Link href={`/umkm/${previousUmkm.id}`}>← UMKM sebelumnya</Link></Button> : <span />}
          {nextUmkm ? <Button asChild className="btn btn-dark border-none"><Link href={`/umkm/${nextUmkm.id}`}>UMKM berikutnya →</Link></Button> : <span />}
        </div>
      </section>
      <section style={{ padding: "16px 0 24px" }}>
        <div className="wrap text-sm text-[color:var(--ink-soft)]">
          Ada informasi yang tidak sesuai? <Link href="/pengaduan" className="underline font-medium text-[color:var(--forest)]">Laporkan atau koreksi data UMKM</Link>.
        </div>
      </section>
    </div>
  );
}
