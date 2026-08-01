"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GaleriItem } from "@/lib/data";
import { addGaleriAction, deleteGaleriAction, uploadImageAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageCropperModal from "@/components/ImageCropperModal";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
  initialGallery: GaleriItem[];
}

export default function GaleriClientPage({ initialGallery }: Props) {
  const router = useRouter();
  const [gallery, setGallery] = useState<GaleriItem[]>(initialGallery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState("");
  const [cat, setCat] = useState("Kegiatan");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

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

  const promptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!label.trim()) {
      setError("Nama/Label wajib diisi.");
      return;
    }

    if (!file) {
      setError("Mohon upload foto terlebih dahulu.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Tambah Galeri",
      message: `Apakah Anda yakin ingin menyimpan foto galeri "${label.trim()}"?`,
      onConfirm: executeSubmit,
    });
  };

  const executeSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file!);
      
      const uploadRes = await uploadImageAction(formData);
      if (!uploadRes.success || !uploadRes.url) {
        setError(uploadRes.error || "Gagal mengunggah foto.");
        setLoading(false);
        return;
      }

      const res = await addGaleriAction(label.trim(), cat, "", uploadRes.url, desc.trim());
      if (res.success) {
        const newItem: GaleriItem = {
          label: label.trim(),
          cat,
          grad: "",
          image: uploadRes.url,
          desc: desc.trim(),
        };
        setGallery([newItem, ...gallery]);
        setLabel("");
        setDesc("");
        setFile(null);
        const fileInput = document.getElementById("galleryFileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        setSuccess("Item galeri berhasil ditambahkan dan disimpan!");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menambahkan item galeri.");
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
      title: "Konfirmasi Hapus Galeri",
      message: `Apakah Anda yakin ingin menghapus item galeri "${item.label}"? Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        setError(null);
        setSuccess(null);
        try {
          const res = await deleteGaleriAction(item.id!);
          if (res.success) {
            setGallery(gallery.filter((g) => g.id !== item.id));
            setSuccess("Item galeri berhasil dihapus!");
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          setError("Gagal menghapus item galeri.");
        }
      },
    });
  };

  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Galeri Desa</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Kelola Galeri Foto
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Tambahkan foto dokumentasi kegiatan warga, profil usaha UMKM baru, atau pemandangan panorama potensi alam desa beserta keterangan singkat kegiatannya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add Form */}
        <div className="lg:col-span-5">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Tambah Foto Baru
            </h2>

            <form onSubmit={promptSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Nama Kegiatan / Judul Foto *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Kerja Bakti Dusun Ngrancah..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Deskripsi Kegiatan Singkat
                </label>
                <Textarea
                  placeholder="Masukkan keterangan atau cerita singkat mengenai foto/kegiatan ini..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
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
                    <SelectItem value="Kegiatan Desa" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Kegiatan Desa</SelectItem>
                    <SelectItem value="Pembangunan" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pembangunan & Infrastruktur</SelectItem>
                    <SelectItem value="Kesenian & Budaya" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Kesenian & Budaya</SelectItem>
                    <SelectItem value="Potensi & Alam" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Potensi & Alam</SelectItem>
                    <SelectItem value="UMKM & Ekonomi" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">UMKM & Ekonomi</SelectItem>
                    <SelectItem value="Sosial & Bansos" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Sosial & Keanggotaan</SelectItem>
                    <SelectItem value="Pemuda & Olahraga" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pemuda & Olahraga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Upload Foto *
                </label>
                <input
                  type="file"
                  id="galleryFileInput"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRawFile(e.target.files[0]);
                      setIsCropOpen(true);
                    }
                  }}
                  className="w-full text-xs text-[color:var(--ink-soft)]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border file:border-[color:var(--line)]
                    file:text-xs file:font-semibold
                    file:bg-[color:var(--parchment)] file:text-[color:var(--forest)]
                    hover:file:bg-[color:var(--line)] cursor-pointer"
                />
              </div>

              {/* Live Preview */}
              <div className="mt-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Preview Tampilan Tile
                </label>
                <div
                  className="h-32 rounded-xl flex items-center justify-center text-white font-medium text-sm p-4 relative overflow-hidden transition-all duration-300 border border-[color:var(--line)] bg-[color:var(--parchment-2)]"
                  style={
                    previewUrl
                      ? { backgroundImage: `url(${previewUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : {}
                  }
                >
                  {previewUrl && (
                    <div className="absolute inset-0 bg-black/30 z-0" />
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="20" height="20" className="absolute top-4 right-4 opacity-70 z-10">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="z-10 text-center select-none">{label || "Judul Foto Tampil di Sini"}</span>
                </div>
              </div>

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
                className="w-full h-10 rounded-full border-none text-white font-medium bg-[color:var(--forest)]"
              >
                {loading ? "Mengunggah..." : "Simpan Item"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Gallery List */}
        <div className="lg:col-span-7">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Daftar Foto Galeri ({gallery.length})
            </h2>

            {gallery.length === 0 ? (
              <div className="text-center py-8 text-sm text-[color:var(--ink-soft)]">
                Belum ada foto galeri yang ditambahkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-1">
                {gallery.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[color:var(--line)] overflow-hidden bg-[color:var(--parchment-2)] flex flex-col justify-between"
                  >
                    {/* Cover block */}
                    <div
                      className="h-28 flex items-center justify-center p-3 relative"
                      style={
                        item.image
                          ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : { background: item.grad }
                      }
                    >
                      <div className="absolute inset-0 bg-black/30 z-0" />
                      <span className="text-white text-xs font-semibold text-center z-10 leading-snug">
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
                          title="Hapus galeri"
                        >
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="14" height="14">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      {rawFile && (
        <ImageCropperModal
          file={rawFile}
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          defaultAspectRatio="16:9"
          onCrop={(cropped) => {
            setFile(cropped);
          }}
        />
      )}
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
