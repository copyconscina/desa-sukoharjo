"use client";

import { useEffect, useRef, useState } from "react";

type Ratio = "free" | "square" | "portrait";
type Rect = { x: number; y: number; width: number; height: number };
type Handle = "move" | "n" | "e" | "s" | "w" | "nw" | "ne" | "sw" | "se";

const MIN_SIZE = 8;

function fitRatio(ratio: Ratio, rect: Rect, imageAspect: number): Rect {
  if (ratio === "free") return rect;
  const targetAspect = ratio === "square" ? 1 : 3 / 4;
  const percentAspect = targetAspect / imageAspect;
  let width = 80;
  let height = width / percentAspect;
  if (height > 80) { height = 80; width = height * percentAspect; }
  return { x: (100 - width) / 2, y: (100 - height) / 2, width, height };
}

export default function ImageCropDialog({ file, onSave, onCancel }: { file: File; onSave: (file: File) => void; onCancel: () => void }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ handle: Handle; startX: number; startY: number; rect: Rect } | null>(null);
  const [ratio, setRatio] = useState<Ratio>("free");
  const [rect, setRect] = useState<Rect>({ x: 10, y: 10, width: 80, height: 80 });
  const [imageAspect, setImageAspect] = useState(1);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setRect({ x: 10, y: 10, width: 80, height: 80 });
    setRatio("free");
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const updateRatio = (nextRatio: Ratio) => {
    setRatio(nextRatio);
    setRect((current) => fitRatio(nextRatio, current, imageAspect));
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, handle: Handle) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = imageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { handle, startX: event.clientX, startY: event.clientY, rect };
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const bounds = imageRef.current?.getBoundingClientRect();
    if (!drag || !bounds) return;
    const dx = ((event.clientX - drag.startX) / bounds.width) * 100;
    const dy = ((event.clientY - drag.startY) / bounds.height) * 100;
    const start = drag.rect;
    let next = { ...start };

    if (drag.handle === "move") {
      next.x = Math.max(0, Math.min(100 - start.width, start.x + dx));
      next.y = Math.max(0, Math.min(100 - start.height, start.y + dy));
    } else {
      if (drag.handle.includes("e")) next.width = Math.max(MIN_SIZE, Math.min(100 - start.x, start.width + dx));
      if (drag.handle.includes("s")) next.height = Math.max(MIN_SIZE, Math.min(100 - start.y, start.height + dy));
      if (drag.handle.includes("w")) {
        next.x = Math.max(0, Math.min(start.x + start.width - MIN_SIZE, start.x + dx));
        next.width = start.width + (start.x - next.x);
      }
      if (drag.handle.includes("n")) {
        next.y = Math.max(0, Math.min(start.y + start.height - MIN_SIZE, start.y + dy));
        next.height = start.height + (start.y - next.y);
      }
      if (ratio !== "free") {
        const targetAspect = ratio === "square" ? 1 : 3 / 4;
        const percentAspect = targetAspect / imageAspect;
        next.height = next.width / percentAspect;
        if (next.y + next.height > 100) next.height = 100 - next.y;
        next.width = next.height * percentAspect;
        if (next.x + next.width > 100) next.width = 100 - next.x;
        next.height = next.width / percentAspect;
      }
    }
    setRect(next);
  };

  const finishDrag = () => { dragRef.current = null; };

  const saveCrop = async () => {
    const image = imageRef.current;
    if (!image) return;
    setSaving(true);
    try {
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      const sx = Math.round((rect.x / 100) * sourceWidth);
      const sy = Math.round((rect.y / 100) * sourceHeight);
      const sw = Math.round((rect.width / 100) * sourceWidth);
      const sh = Math.round((rect.height / 100) * sourceHeight);
      const scale = Math.min(1, 1920 / Math.max(sw, sh));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sw * scale));
      canvas.height = Math.max(1, Math.round(sh * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Browser tidak mendukung proses crop gambar.");
      context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
      if (!blob) throw new Error("Gagal membuat hasil crop gambar.");
      const name = `${file.name.replace(/\.[^.]+$/, "") || "foto"}.webp`;
      onSave(new File([blob], name, { type: "image/webp" }));
    } finally {
      setSaving(false);
    }
  };

  const handleStyle = "absolute w-4 h-4 rounded-full border-2 border-white bg-[color:var(--forest)] shadow cursor-pointer";
  return (
    <div className="fixed inset-0 z-[200] bg-black/70 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-auto rounded-2xl bg-[color:var(--card)] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div><h2 className="font-heading text-xl">Atur Crop Foto</h2><p className="text-xs text-[color:var(--ink-soft)]">Tarik area di atas foto. Pada rasio bebas, setiap sisi dan sudut dapat diatur terpisah.</p></div>
          <select value={ratio} onChange={(event) => updateRatio(event.target.value as Ratio)} className="h-9 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] px-2 text-sm">
            <option value="free">Bebas</option><option value="square">1:1</option><option value="portrait">3:4</option>
          </select>
        </div>
        <div className="relative mx-auto w-fit max-w-full select-none" onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
          {previewUrl && <img ref={imageRef} src={previewUrl} alt="Atur crop" className="block max-h-[62vh] max-w-full rounded-lg" draggable={false} onLoad={(event) => { const image = event.currentTarget; const aspect = image.naturalWidth / image.naturalHeight; setImageAspect(aspect); setRect((current) => fitRatio(ratio, current, aspect)); }} />}
          {previewUrl && <div className="absolute border-2 border-white bg-black/10 cursor-move" style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }} onPointerDown={(event) => startDrag(event, "move")}>
            <div className={`${handleStyle} left-0 top-0 -translate-x-1/2 -translate-y-1/2`} onPointerDown={(event) => startDrag(event, "nw")} />
            <div className={`${handleStyle} right-0 top-0 translate-x-1/2 -translate-y-1/2`} onPointerDown={(event) => startDrag(event, "ne")} />
            <div className={`${handleStyle} left-0 bottom-0 -translate-x-1/2 translate-y-1/2`} onPointerDown={(event) => startDrag(event, "sw")} />
            <div className={`${handleStyle} right-0 bottom-0 translate-x-1/2 translate-y-1/2`} onPointerDown={(event) => startDrag(event, "se")} />
            {ratio === "free" && <><div className={`${handleStyle} left-1/2 top-0 -translate-x-1/2 -translate-y-1/2`} onPointerDown={(event) => startDrag(event, "n")} /><div className={`${handleStyle} left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2`} onPointerDown={(event) => startDrag(event, "s")} /><div className={`${handleStyle} left-0 top-1/2 -translate-x-1/2 -translate-y-1/2`} onPointerDown={(event) => startDrag(event, "w")} /><div className={`${handleStyle} right-0 top-1/2 translate-x-1/2 -translate-y-1/2`} onPointerDown={(event) => startDrag(event, "e")} /></>}
          </div>}
        </div>
        <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm">Batal</button><button type="button" onClick={saveCrop} disabled={saving} className="rounded-lg bg-[color:var(--forest)] px-4 py-2 text-sm font-semibold text-white">{saving ? "Memproses…" : "Gunakan Crop"}</button></div>
      </div>
    </div>
  );
}
