"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GaleriItem } from "@/lib/data";
import { addGaleriAction, deleteGaleriAction, uploadImageAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
  initialGallery: GaleriItem[];
}

interface DraftFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function GaleriClientPage({ initialGallery }: Props) {
  const router = useRouter();
  const [gallery, setGallery] = useState<GaleriItem[]>(initialGallery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState("");
  const [cat, setCat] = useState("Kegiatan Desa");
  const [desc, setDesc] = useState("");
  const [draftFiles, setDraftFiles] = useState<DraftFileItem[]>([]);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newItems: DraftFileItem[] = [];
    Array.from(e.target.files).forEach((selectedFile) => {
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file: selectedFile,
        previewUrl: URL.createObjectURL(selectedFile),
      });
    });

    setDraftFiles((prev) => [...prev, ...newItems]);
    setError(null);

    // reset input value so re-selecting same files works
    e.target.value = "";
  };

  const moveDraftItem = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draftFiles.length) return;

    const updated = [...draftFiles];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setDraftFiles(updated);
  };

  const removeDraftItem = (index: number) => {
    const updated = [...draftFiles];
    const [removed] = updated.splice(index, 1);
    URL.revokeObjectURL(removed.previewUrl);
    setDraftFiles(updated);
  };

  const promptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!label.trim()) {
      setError("Nama Kegiatan / Judul Post Galeri wajib diisi.");
      return;
    }

    if (draftFiles.length === 0) {
      setError("Mohon unggah minimal 1 foto untuk post galeri ini.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Tambah Post Galeri",
      message: `Apakah Anda yakin ingin menyimpan post galeri "${label.trim()}" dengan ${draftFiles.length} foto? Foto urutan ke-1 akan dijadikan thumbnail cover.`,
      onConfirm: executeSubmit,
    });
  };

  const executeSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      // Upload all draft files
      for (const item of draftFiles) {
        const formData = new FormData();
        formData.append("file", item.file);

        const uploadRes = await uploadImageAction(formData);
        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || `Gagal mengunggah foto "${item.file.name}".`);
          setLoading(false);
          return;
        }
        uploadedUrls.push(uploadRes.url);
      }

      const imagesStr = uploadedUrls.join(",");
      const firstUrl = uploadedUrls[0];

      const res = await addGaleriAction(label.trim(), cat, "", firstUrl, desc.trim(), imagesStr);
      if (res.success) {
        const newItem: GaleriItem = {
          id: (res as any).item?.id || Date.now(),
          label: label.trim(),
          cat,
          grad: "",
          image: firstUrl,
          images: imagesStr,
          desc: desc.trim(),
        };

        setGallery([newItem, ...gallery]);
        setLabel("");
        setDesc("");
        // Clean up object URLs
        draftFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setDraftFiles([]);

        setSuccess(`Post galeri "${label.trim()}" berhasil disimpan dengan ${uploadedUrls.length} foto!`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        router.refresh();
      } else {
        setError("Gagal menyimpan post galeri.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengunggah post galeri.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: GaleriItem) => {
    if (!item.id) {
      setError("ID galeri tidak ditemukan.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Post Galeri",
      message: `Apakah Anda yakin ingin menghapus post galeri "${item.label}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setError(null);
        setSuccess(null);
        try {
          const res = await deleteGaleriAction(item.id!);
          if (res.success) {
            setGallery(gallery.filter((g) => g.id !== item.id));
            setSuccess("Post galeri berhasil dihapus!");
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          setError("Gagal menghapus post galeri.");
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Galeri Desa</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Kelola Galeri & Album Foto
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Tambahkan post dokumentasi kegiatan desa dengan satu atau beberapa foto sekaligus. Gambar urutan pertama akan otomatis dijadikan thumbnail cover album.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add Form */}
        <div className="lg:col-span-6">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Buat Post Galeri Baru
            </h2>

            <form onSubmit={promptSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Nama Kegiatan / Judul Post Galeri *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Panen Raya Bersama Warga Dusun Ngrancah..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Deskripsi / Keterangan Singkat
                </label>
                <Textarea
                  placeholder="Masukkan keterangan cerita singkat atau rincian kegiatan..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Kategori *
                </label>
                <Select value={cat} onValueChange={(val) => setCat(val)}>
                  <SelectTrigger className="w-full h-10 px-3 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] text-[color:var(--ink)] focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:border-[color:var(--forest)]">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-[color:var(--card)] border border-[color:var(--line)] text-[color:var(--ink)]">
                    <SelectItem value="Kegiatan Desa">Kegiatan Desa</SelectItem>
                    <SelectItem value="Pembangunan">Pembangunan & Infrastruktur</SelectItem>
                    <SelectItem value="Kesenian & Budaya">Kesenian & Budaya</SelectItem>
                    <SelectItem value="Potensi & Alam">Potensi & Alam</SelectItem>
                    <SelectItem value="UMKM & Ekonomi">UMKM & Ekonomi</SelectItem>
                    <SelectItem value="Sosial & Bansos">Sosial & Keanggotaan</SelectItem>
                    <SelectItem value="Pemuda & Olahraga">Pemuda & Olahraga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* UPLOAD MULTIPLE IMAGES */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Pilih & Unggah Foto (Bisa Lebih Dari 1) *
                </label>
                <input
                  type="file"
                  id="galleryMultipleFileInput"
                  multiple
                  accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.avif,.heic,.gif"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-[color:var(--ink-soft)]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border file:border-[color:var(--line)]
                    file:text-xs file:font-semibold
                    file:bg-[color:var(--parchment)] file:text-[color:var(--forest)]
                    hover:file:bg-[color:var(--line)] cursor-pointer"
                />
                <span className="text-[10px] text-[color:var(--ink-soft)] mt-1 block">
                  Anda dapat memilih beberapa foto sekaligus. Gambar di urutan pertama akan dipakai sebagai Thumbnail Cover.
                </span>
              </div>

              {/* REORDERABLE DRAFT IMAGES LIST */}
              {draftFiles.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--forest-deep)] font-semibold">
                      Urutan Foto Post ({draftFiles.length} Foto Terpilih)
                    </label>
                    <span className="text-[10px] font-mono text-[color:var(--ink-soft)]">
                      Gunakan tombol panah untuk mengatur urutan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto p-2 bg-[color:var(--parchment)] border border-[color:var(--line)] rounded-xl">
                    {draftFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`relative rounded-lg overflow-hidden border ${
                          idx === 0
                            ? "border-[color:var(--forest)] ring-2 ring-[color:var(--forest)]/30"
                            : "border-[color:var(--line)]"
                        } bg-white flex flex-col group`}
                      >
                        <div className="relative w-full h-24 bg-slate-900/10">
                          <Image src={item.previewUrl} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                          <Badge
                            className={`absolute top-1 left-1 text-[9px] px-1.5 py-0.5 border-none ${
                              idx === 0 ? "bg-[color:var(--forest)] text-white" : "bg-black/70 text-white"
                            }`}
                          >
                            {idx === 0 ? "★ Thumbnail Cover" : `#${idx + 1}`}
                          </Badge>
                        </div>

                        <div className="p-1.5 flex justify-between items-center bg-white border-t border-[color:var(--line)]">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveDraftItem(idx, "left")}
                              disabled={idx === 0}
                              className="px-1.5 py-0.5 text-[10px] bg-[color:var(--parchment)] hover:bg-[color:var(--line)] disabled:opacity-30 rounded border border-[color:var(--line)] cursor-pointer"
                              title="Geser ke kiri / sebelumnya"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDraftItem(idx, "right")}
                              disabled={idx === draftFiles.length - 1}
                              className="px-1.5 py-0.5 text-[10px] bg-[color:var(--parchment)] hover:bg-[color:var(--line)] disabled:opacity-30 rounded border border-[color:var(--line)] cursor-pointer"
                              title="Geser ke kanan / berikutnya"
                            >
                              ▶
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDraftItem(idx)}
                            className="px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                            title="Hapus foto ini dari draft"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 text-xs bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-full border-none text-white font-medium bg-[color:var(--forest)] cursor-pointer mt-1"
              >
                {loading ? "Menyimpan Post & Uploading Foto..." : "Simpan Post Galeri"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Gallery List */}
        <div className="lg:col-span-6">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Daftar Post Galeri ({gallery.length})
            </h2>

            {gallery.length === 0 ? (
              <div className="text-center py-8 text-sm text-[color:var(--ink-soft)]">
                Belum ada post galeri yang ditambahkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-1">
                {gallery.map((item) => {
                  const imageList = item.images
                    ? item.images.split(",").map((s) => s.trim()).filter(Boolean)
                    : item.image
                    ? [item.image]
                    : [];
                  const coverImage = imageList[0] || item.image;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[color:var(--line)] overflow-hidden bg-[color:var(--parchment-2)] flex flex-col justify-between"
                    >
                      {/* Cover block */}
                      <div
                        className="h-32 flex items-center justify-center p-3 relative overflow-hidden"
                        style={
                          coverImage
                            ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                            : { background: item.grad }
                        }
                      >
                        <div className="absolute inset-0 bg-black/40 z-0" />
                        
                        {imageList.length > 1 && (
                          <Badge className="absolute top-2 right-2 bg-black/70 text-white text-[10px] border-none px-2 py-0.5 z-10">
                            📷 {imageList.length} Foto (Carousel)
                          </Badge>
                        )}

                        <span className="text-white text-xs font-semibold text-center z-10 leading-snug drop-shadow-md">
                          {item.label}
                        </span>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="p-3 flex flex-col gap-2 bg-white border-t border-[color:var(--line)]">
                        {item.desc ? (
                          <p className="text-xs text-[color:var(--ink-soft)] line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Tidak ada deskripsi</p>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                          <span className="text-[10px] font-mono text-[color:var(--ink-soft)] uppercase tracking-wider bg-[color:var(--parchment)] border border-[color:var(--line)] px-2 py-0.5 rounded-full">
                            {item.cat}
                          </span>

                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 hover:bg-[color:var(--clay)]/10 text-[color:var(--clay)] rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            title="Hapus post galeri"
                          >
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="14" height="14">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isLoading={loading}
      />
    </div>
  );
}
