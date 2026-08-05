"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { parseImagesList } from "@/lib/utils";

interface Props {
  imagesData?: any;
  coverImage?: string;
  title: string;
  badge?: string;
  grad?: string;
  aspectRatio?: string;
}

const icChevronLeft = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const icChevronRight = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default function MediaCarousel({
  imagesData,
  coverImage,
  title,
  badge,
  grad,
  aspectRatio = "h-[320px] sm:h-[400px]",
}: Props) {
  const parsed = parseImagesList(imagesData);
  const images: string[] =
    parsed.length > 0
      ? parsed
      : coverImage
      ? [coverImage]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div
        className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden flex items-center justify-center text-white text-lg font-medium p-4 text-center shadow-sm`}
        style={{ background: grad || "var(--forest-deep)" }}
      >
        {badge && (
          <span className="absolute top-4 left-4 z-10 bg-[#212f1c]/80 text-white font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
        {title}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* MAIN CAROUSEL CONTAINER */}
      <div
        className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden bg-slate-950 shadow-sm border border-[color:var(--line)] group flex items-center justify-center`}
      >
        <Image
          key={activeIndex}
          src={images[activeIndex]}
          alt={`${title} - Foto ${activeIndex + 1}`}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-contain transition-opacity duration-200"
          priority
        />

        {badge && (
          <span className="absolute top-4 left-4 z-20 bg-black/70 text-white font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-md">
            {badge}
          </span>
        )}

        {images.length > 1 && (
          <>
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Foto Sebelumnya"
            >
              {icChevronLeft}
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Foto Berikutnya"
            >
              {icChevronRight}
            </button>

            {/* Counter Badge */}
            <div className="absolute top-4 right-4 z-20 bg-black/70 text-white font-mono text-xs px-3 py-1 rounded-full border border-white/10 shadow-md">
              Foto {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* THUMBNAIL STRIP (JIKA FOTO > 1) */}
      {images.length > 1 && (
        <div className="flex gap-2 p-2 bg-slate-900/90 rounded-xl overflow-x-auto justify-center border border-slate-800">
          {images.map((imgUrl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                activeIndex === i
                  ? "border-[color:var(--forest)] scale-105 ring-2 ring-[color:var(--forest)]/50"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={imgUrl} alt={`Thumbnail ${i + 1}`} fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
