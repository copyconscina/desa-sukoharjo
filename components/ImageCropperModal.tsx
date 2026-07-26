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
  
  // Crop values in percentage (0 - 100)
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropWidth, setCropWidth] = useState(80);
  const [cropHeight, setCropHeight] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load file as object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Adjust crop box when aspect ratio changes
  useEffect(() => {
    if (aspectRatio === "free") {
      setCropHeight(cropWidth);
      return;
    }

    const [wRatio, hRatio] = aspectRatio.split(":").map(Number);
    const targetHeight = cropWidth * (hRatio / wRatio);

    if (targetHeight + cropY <= 100) {
      setCropHeight(targetHeight);
    } else {
      // Scale down width to fit screen height bounds
      const maxPossibleHeight = 100 - cropY;
      const adjustedWidth = maxPossibleHeight * (wRatio / hRatio);
      setCropWidth(adjustedWidth);
      setCropHeight(maxPossibleHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio]);

  // Re-calculate locked aspect ratio heights when width is changed manually
  const handleWidthChange = (val: number) => {
    setCropWidth(val);

    if (aspectRatio !== "free") {
      const [wRatio, hRatio] = aspectRatio.split(":").map(Number);
      const targetHeight = val * (hRatio / wRatio);
      
      // If exceeds boundary, lock X/Y positions
      if (targetHeight + cropY <= 100) {
        setCropHeight(targetHeight);
      } else {
        const overflow = (targetHeight + cropY) - 100;
        const newY = Math.max(0, cropY - overflow);
        setCropY(newY);
        if (targetHeight + newY <= 100) {
          setCropHeight(targetHeight);
        } else {
          // Hard cap width
          const maxH = 100 - newY;
          setCropHeight(maxH);
          setCropWidth(maxH * (wRatio / hRatio));
        }
      }
    }
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
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      
      // Map percentages to actual image dimensions
      const x = (cropX / 100) * img.naturalWidth;
      const y = (cropY / 100) * img.naturalHeight;
      const w = (cropWidth / 100) * img.naturalWidth;
      const h = (cropHeight / 100) * img.naturalHeight;

      canvas.width = Math.max(1, w);
      canvas.height = Math.max(1, h);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type || "image/jpeg",
              lastModified: Date.now(),
            });
            onCrop(croppedFile);
          }
          setIsProcessing(false);
          onClose();
        }, file.type || "image/jpeg");
      } else {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      alert("Gagal memproses gambar untuk dicrop.");
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
          
          {/* Canvas / Image Preview Container (Strictly Clipped Container) */}
          <div className="flex items-center justify-center bg-slate-900/95 rounded-xl border border-[color:var(--line)] min-h-[220px] p-3 overflow-hidden relative">
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
                  src={imageUrl} 
                  alt="Crop preview source" 
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
                    ${aspectRatio === item.val
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
            disabled={isProcessing}
            className="h-9 px-4 rounded-full border border-[color:var(--line)] bg-white text-xs font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={executeCrop}
            disabled={isProcessing}
            className="h-9 px-4 rounded-full border-none bg-[color:var(--forest)] text-white text-xs font-semibold cursor-pointer"
          >
            {isProcessing ? "Memotong..." : "Potong & Simpan"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
