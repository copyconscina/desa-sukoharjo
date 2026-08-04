"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GaleriItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialGaleriData: GaleriItem[];
}

export default function GaleriList({ initialGaleriData }: Props) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<GaleriItem | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const categories = ["Semua", ...Array.from(new Set(initialGaleriData.map((g) => g.cat)))];

  const filteredGaleri = initialGaleriData.filter(
    (g) => activeCategory === "Semua" || g.cat === activeCategory
  );

  const handleOpenItem = (item: GaleriItem) => {
    setSelectedItem(item);
    setActiveImgIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setActiveImgIndex(0);
  };

  // Get array of image URLs for selected item
  const selectedImages: string[] = selectedItem
    ? selectedItem.images
      ? selectedItem.images.split(",").map((s) => s.trim()).filter(Boolean)
      : selectedItem.image
      ? [selectedItem.image]
      : []
    : [];

  const handlePrevImage = () => {
    if (selectedImages.length <= 1) return;
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : selectedImages.length - 1));
  };

  const handleNextImage = () => {
    if (selectedImages.length <= 1) return;
    setActiveImgIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : 0));
  };

  // Listen for keyboard left/right arrow keys
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, selectedImages.length]);

  const icZoom = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="20" height="20" className="z-10">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const icClose = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="20" height="20">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const icChevronLeft = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="22" height="22">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );

  const icChevronRight = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="22" height="22">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  return (
    <div className="wrap">
      <div className="gal-filters" id="galFilters">
        {categories.map((c) => (
          <Button
            key={c}
            variant={activeCategory === c ? "default" : "outline"}
            className={`chip ${activeCategory === c ? "active" : ""}`}
            style={{ display: "inline-flex", height: "auto", border: "1px solid var(--line)" }}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="gal-grid mt-6" id="galGrid">
        {filteredGaleri.map((g, idx) => {
          const itemImages = g.images
            ? g.images.split(",").map((s) => s.trim()).filter(Boolean)
            : g.image
            ? [g.image]
            : [];
          const coverImg = itemImages[0] || g.image;

          return (
            <div
              key={idx}
              className="gal-tile relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200 group"
              style={!coverImg ? { background: g.grad } : undefined}
              onClick={() => handleOpenItem(g)}
            >
              {coverImg && (
                <Image
                  src={coverImg}
                  alt={g.label}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              )}

              {/* Badge Multi Photo Indicator */}
              {itemImages.length > 1 && (
                <Badge className="absolute top-3 right-3 z-10 bg-black/70 text-white text-[10px] border-none px-2 py-0.5 shadow-md flex items-center gap-1">
                  <span>📷</span>
                  <span>{itemImages.length} Foto</span>
                </Badge>
              )}

              {icZoom}
              <span className="z-10 relative">{g.label}</span>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX CAROUSEL MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="bg-[color:var(--card)] border border-[color:var(--line)] w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/95 text-[color:var(--forest-deep)] hover:bg-white flex items-center justify-center shadow-lg border-none cursor-pointer transition-colors"
              title="Tutup galeri"
            >
              {icClose}
            </button>

            {/* MAIN CAROUSEL IMAGE CONTAINER */}
            <div className="relative w-full h-[45vh] sm:h-[55vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              {selectedImages.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    key={activeImgIndex}
                    src={selectedImages[activeImgIndex]}
                    alt={`${selectedItem.label} - Foto ${activeImgIndex + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain transition-opacity duration-200"
                    priority
                  />

                  {/* CAROUSEL ARROW BUTTONS (TAMPIL JIKA FOTO > 1) */}
                  {selectedImages.length > 1 && (
                    <>
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="Foto Sebelumnya (Panah Kiri)"
                      >
                        {icChevronLeft}
                      </button>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="Foto Berikutnya (Panah Kanan)"
                      >
                        {icChevronRight}
                      </button>

                      {/* Counter Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-black/70 text-white font-mono text-xs px-3 py-1 rounded-full border border-white/10 shadow-md">
                        Foto {activeImgIndex + 1} / {selectedImages.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-lg font-medium p-4 text-center"
                  style={{ background: selectedItem.grad || "var(--forest-deep)" }}
                >
                  {selectedItem.label}
                </div>
              )}
            </div>

            {/* THUMBNAIL STRIP INDICATOR (JIKA FOTO > 1) */}
            {selectedImages.length > 1 && (
              <div className="flex gap-2 p-3 bg-slate-900 border-t border-slate-800 overflow-x-auto justify-center">
                {selectedImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImgIndex(i)}
                    className={`relative w-14 h-10 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImgIndex === i
                        ? "border-[color:var(--forest)] scale-105 ring-2 ring-[color:var(--forest)]/50"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${i + 1}`} fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* INFO & DESCRIPTION SECTION */}
            <div className="p-5 md:p-6 flex flex-col gap-2.5 overflow-y-auto bg-[color:var(--card)]">
              <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-2.5">
                <Badge className="tag border-none w-fit inline-flex justify-center" variant="default" style={{ height: "auto", margin: 0, background: "var(--forest)" }}>
                  {selectedItem.cat}
                </Badge>
                {selectedImages.length > 1 && (
                  <span className="text-xs font-mono text-[color:var(--ink-soft)]">
                    Gunakan panah &larr; &rarr; untuk berpindah foto
                  </span>
                )}
              </div>

              <h2 className="text-xl font-heading text-[color:var(--forest-deep)] leading-snug">
                {selectedItem.label}
              </h2>

              <p className="text-[color:var(--ink-soft)] text-sm leading-relaxed whitespace-pre-wrap">
                {selectedItem.desc || "Dokumentasi foto kegiatan pembangunan, UMKM unggulan, atau potensi pariwisata Desa Sukoharjo."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
