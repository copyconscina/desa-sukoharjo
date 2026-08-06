"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  file: File;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedFile: File) => void;
  defaultAspectRatio?: "1:1" | "16:9" | "4:3" | "3:2" | "free";
}

export default function ImageCropperModal({
  file,
  isOpen,
  onClose,
  onCrop,
  defaultAspectRatio = "16:9",
}: Props) {
  const [aspectRatio, setAspectRatio] = useState<string>(defaultAspectRatio);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [workingFile, setWorkingFile] = useState<File>(file);
  const [isConverting, setIsConverting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Crop values in percentage (0 - 100)
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropWidth, setCropWidth] = useState(80);
  const [cropHeight, setCropHeight] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load file as object URL with dynamic HEIC conversion
  useEffect(() => {
    let active = true;
    let currentUrl = "";

    async function processFile() {
      setIsConverting(true);
      setLoadError(null);

      try {
        const isHeic =
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif") ||
          file.type.toLowerCase().includes("heic") ||
          file.type.toLowerCase().includes("heif");

        if (isHeic) {
          const heic2anyModule = (await import("heic2any")).default;
          const convertedBlob = await heic2anyModule({
            blob: file,
            toType: "image/jpeg",
            quality: 0.85,
          });

          if (!active) return;

          const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          const newFileName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
          const convertedFile = new File([singleBlob], newFileName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          setWorkingFile(convertedFile);
          currentUrl = URL.createObjectURL(convertedFile);
          setImageUrl(currentUrl);
        } else {
          setWorkingFile(file);
          currentUrl = URL.createObjectURL(file);
          setImageUrl(currentUrl);
        }
      } catch (err: any) {
        console.warn("Konversi HEIC gagal, mencoba menggunakan file asli:", err);
        if (active) {
          setWorkingFile(file);
          currentUrl = URL.createObjectURL(file);
          setImageUrl(currentUrl);
        }
      } finally {
        if (active) {
          setIsConverting(false);
        }
      }
    }

    if (file) {
      processFile();
    }

    return () => {
      active = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [file]);

  // Recalculate cropHeight strictly locking to aspect ratio taking DOM element dimensions into account
  const syncCropHeight = (wPercent: number) => {
    if (aspectRatio === "free") return;

    const [wRatio, hRatio] = aspectRatio.split(":").map(Number);
    const targetAspect = wRatio / hRatio;

    if (imgRef.current) {
      const renderW = imgRef.current.clientWidth || 1;
      const renderH = imgRef.current.clientHeight || 1;
      const containerAspect = renderW / renderH;

      const targetHPercent = wPercent * (containerAspect / targetAspect);
      if (targetHPercent + cropY <= 100) {
        setCropHeight(targetHPercent);
      } else {
        const maxH = Math.max(10, 100 - cropY);
        setCropHeight(maxH);
        setCropWidth(maxH * (targetAspect / containerAspect));
      }
    } else {
      setCropHeight(wPercent * (hRatio / wRatio));
    }
  };

  useEffect(() => {
    syncCropHeight(cropWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio, imageUrl]);

  const handleWidthChange = (val: number) => {
    setCropWidth(val);
    syncCropHeight(val);
  };

  const handleHeightChange = (val: number) => {
    if (aspectRatio === "free") {
      setCropHeight(val);
    }
  };

  // Click & Drag to reposition the crop box
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const updatePosition = (clientX: number, clientY: number) => {
      const currentX = ((clientX - rect.left) / rect.width) * 100;
      const currentY = ((clientY - rect.top) / rect.height) * 100;

      let newX = currentX - cropWidth / 2;
      let newY = currentY - cropHeight / 2;

      newX = Math.max(0, Math.min(100 - cropWidth, newX));
      newY = Math.max(0, Math.min(100 - cropHeight, newY));

      setCropX(newX);
      setCropY(newY);
    };

    updatePosition(e.clientX, e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();

    const updatePosition = (clientX: number, clientY: number) => {
      const currentX = ((clientX - rect.left) / rect.width) * 100;
      const currentY = ((clientY - rect.top) / rect.height) * 100;

      let newX = currentX - cropWidth / 2;
      let newY = currentY - cropHeight / 2;

      newX = Math.max(0, Math.min(100 - cropWidth, newX));
      newY = Math.max(0, Math.min(100 - cropHeight, newY));

      setCropX(newX);
      setCropY(newY);
    };

    updatePosition(e.touches[0].clientX, e.touches[0].clientY);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      updatePosition(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  const executeCrop = () => {
    if (!imageUrl || isConverting) return;
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      // Source rectangle in natural image pixels
      const srcX = (cropX / 100) * naturalW;
      const srcY = (cropY / 100) * naturalH;
      const srcW = (cropWidth / 100) * naturalW;
      const srcH = (cropHeight / 100) * naturalH;

      // Fixed target resolution for perfect aspect ratios
      let outW = Math.max(1, Math.round(srcW));
      let outH = Math.max(1, Math.round(srcH));

      if (aspectRatio === "16:9") {
        outW = 1280;
        outH = 720;
      } else if (aspectRatio === "1:1") {
        outW = 800;
        outH = 800;
      } else if (aspectRatio === "4:3") {
        outW = 1024;
        outH = 768;
      } else if (aspectRatio === "3:2") {
        outW = 1200;
        outH = 800;
      }

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], workingFile.name, {
                type: workingFile.type || "image/jpeg",
                lastModified: Date.now(),
              });
              onCrop(croppedFile);
            }
            setIsProcessing(false);
            onClose();
          },
          workingFile.type || "image/jpeg",
          0.92
        );
      } else {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setLoadError("Gagal memproses gambar untuk dicrop.");
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[color:var(--card)] border border-[color:var(--line)] rounded-2xl p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="p-4 border-b border-[color:var(--line)] bg-[color:var(--parchment)] flex flex-col justify-start">
          <DialogTitle className="font-heading text-base text-[color:var(--forest-deep)] text-left">
            Potong & Atur Gambar
          </DialogTitle>
          <DialogDescription className="text-xs text-[color:var(--ink-soft)] font-mono uppercase tracking-wider text-left mt-0.5">
            Atur Letak & Rasio Pemotongan Foto
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Canvas / Image Preview Container */}
          <div className="flex items-center justify-center bg-slate-900/95 rounded-xl border border-[color:var(--line)] min-h-[220px] p-3 overflow-hidden relative">
            {isConverting ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-white">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-xs font-sans text-gray-300 font-medium">
                  Mengonversi foto iPhone (HEIC) ke JPEG...
                </p>
              </div>
            ) : loadError ? (
              <div className="text-center p-6 text-red-400 text-xs font-sans">
                {loadError}
              </div>
            ) : (
              <div
                ref={containerRef}
                className="relative overflow-hidden cursor-move select-none touch-none w-fit h-fit max-w-full max-h-[280px] rounded-lg flex items-center justify-center"
                style={{ clipPath: "inset(0)", isolation: "isolate" }}
                onMouseDown={handleDragStart}
                onTouchStart={handleTouchStart}
              >
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Crop preview source"
                    onLoad={() => syncCropHeight(cropWidth)}
                    onError={() => setLoadError("Browser tidak dapat menampilkan format foto ini. Silakan gunakan format JPG, PNG, atau WebP.")}
                    className="max-w-full h-auto max-h-[280px] block pointer-events-none rounded-lg object-contain"
                  />
                )}

                {/* Dark semi-transparent overlay with clear cutout */}
                <div
                  style={{
                    position: "absolute",
                    left: `${cropX}%`,
                    top: `${cropY}%`,
                    width: `${cropWidth}%`,
                    height: `${cropHeight}%`,
                    border: "2px dashed #ffffff",
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
                    pointerEvents: "none",
                  }}
                >
                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-4 h-[1px] bg-white" />
                    <div className="h-4 w-[1px] bg-white absolute" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
              Pilihan Rasio Aspek
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "16:9 (Banner)", val: "16:9" },
                { name: "1:1 (Persegi)", val: "1:1" },
                { name: "4:3 (Foto)", val: "4:3" },
                { name: "3:2 (Klasik)", val: "3:2" },
                { name: "Bebas", val: "free" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setAspectRatio(item.val)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer font-medium
                    ${
                      aspectRatio === item.val
                        ? "bg-[color:var(--forest)] text-white border-[color:var(--forest)]"
                        : "bg-[color:var(--parchment)] text-[color:var(--ink-soft)] border-[color:var(--line)] hover:bg-[color:var(--line)]"
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Position & Size Adjustment Sliders */}
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-[color:var(--ink-soft)] mb-1">
                <span>LEBAR BINGKAI POTONG</span>
                <span>{Math.round(cropWidth)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={cropWidth}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full h-1 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-[color:var(--forest)]"
              />
            </div>

            {aspectRatio === "free" && (
              <div>
                <div className="flex justify-between text-[11px] font-mono text-[color:var(--ink-soft)] mb-1">
                  <span>TINGGI BINGKAI POTONG</span>
                  <span>{Math.round(cropHeight)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cropHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full h-1 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-[color:var(--forest)]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-[color:var(--ink-soft)] mb-1">
                  <span>GESER HORISONTAL (X)</span>
                  <span>{Math.round(cropX)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, 100 - cropWidth)}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full h-1 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-[color:var(--forest)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-[color:var(--ink-soft)] mb-1">
                  <span>GESER VERTIKAL (Y)</span>
                  <span>{Math.round(cropY)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, 100 - cropHeight)}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full h-1 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-[color:var(--forest)]"
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 italic text-center mt-1">
              * Tips: Anda juga dapat mengeklik atau mengusap (drag) gambar di atas untuk memindahkan bingkai potong.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 border-t border-[color:var(--line)] bg-[color:var(--parchment)] flex flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing || isConverting}
            className="h-9 px-4 rounded-full border border-[color:var(--line)] bg-white text-xs font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={executeCrop}
            disabled={isProcessing || isConverting || !!loadError}
            className="h-9 px-4 rounded-full border-none bg-[color:var(--forest)] text-white text-xs font-semibold cursor-pointer"
          >
            {isConverting
              ? "Mengonversi HEIC..."
              : isProcessing
              ? "Memotong..."
              : "Potong & Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
