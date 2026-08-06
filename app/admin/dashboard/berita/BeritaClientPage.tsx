"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Berita } from "@/lib/data";
import { addBeritaAction, updateBeritaAction, deleteBeritaAction, uploadImageAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmModal from "@/components/ConfirmModal";
import { parseImagesList } from "@/lib/utils";

interface Props {
  initialNews: Berita[];
}

interface DraftFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function BeritaClientPage({ initialNews }: Props) {
  const router = useRouter();
  const [news, setNews] = useState<Berita[]>(initialNews);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Kegiatan");
  
  // Multi-Image Upload States
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
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

  const formRef = useRef<HTMLDivElement>(null);

  const handleEdit = (item: Berita) => {
    if (!item.id) return;
    setEditingId(item.id);
    setTitle(item.title);
    setDesc(item.desc);
    setTag(item.tag || "Kegiatan");

    const urls = parseImagesList(item.images);
    setExistingUrls(urls);
    setDraftFiles([]);

    setError(null);
    setSuccess(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
    setError(null);
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setTag("Kegiatan");
    setExistingUrls([]);
    setDraftFiles([]);

    const fileInput = document.getElementById("beritaFileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);

    const newDrafts: DraftFileItem[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setDraftFiles((prev) => [...prev, ...newDrafts]);
  };

  const moveExistingUrl = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= existingUrls.length) return;

    const newArr = [...existingUrls];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setExistingUrls(newArr);
  };

  const removeExistingUrl = (index: number) => {
    setExistingUrls(existingUrls.filter((_, i) => i !== index));
  };

  const moveDraftFile = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= draftFiles.length) return;

    const newArr = [...draftFiles];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setDraftFiles(newArr);
  };

  const removeDraftFile = (id: string) => {
    setDraftFiles(draftFiles.filter((df) => df.id !== id));
  };

  const promptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !desc.trim()) {
      setError("Semua field wajib diisi (Judul & Isi Berita).");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: editingId ? "Konfirmasi Perbarui Berita" : "Konfirmasi Publis Berita",
      message: `Apakah Anda yakin ingin menyimpan berita "${title.trim()}"?`,
      onConfirm: executeSubmit,
    });
  };

  const executeSubmit = async () => {
    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const draft of draftFiles) {
        const formData = new FormData();
        formData.append("file", draft.file);

        const uploadRes = await uploadImageAction(formData);
        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || `Gagal mengunggah foto ${draft.file.name}`);
          setLoading(false);
          return;
        }
        uploadedUrls.push(uploadRes.url);
      }

      const allUrls = [...existingUrls, ...uploadedUrls];
      const imageUrlsStr = allUrls.join(",");

      if (editingId) {
        const res = await updateBeritaAction(editingId, tag, title.trim(), desc.trim(), imageUrlsStr);
        if (res.success && res.item) {
          setNews(news.map((n) => (n.id === editingId ? res.item! : n)));
          setSuccess(`Berita "${title.trim()}" berhasil diperbarui!`);
          setEditingId(null);
          resetForm();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          router.refresh();
        }
      } else {
        const res = await addBeritaAction(tag, title.trim(), desc.trim(), imageUrlsStr);
        if (res.success && res.item) {
          setNews([res.item, ...news]);
          setSuccess(`Berita "${title.trim()}" berhasil dipublikasikan!`);
          resetForm();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Gagal menyimpan berita.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: Berita) => {
    if (!item.id) {
      setError("ID berita tidak ditemukan.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Berita",
      message: `Apakah Anda yakin ingin menghapus berita "${item.title}"? Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        setError(null);
        setSuccess(null);
        try {
          const res = await deleteBeritaAction(item.id!);
          if (res.success) {
            setNews(news.filter((b) => b.id !== item.id));
            setSuccess("Berita berhasil dihapus!");
            if (editingId === item.id) handleCancelEdit();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          setError((err as Error).message || "Gagal menghapus berita.");
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Pengelolaan</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Kelola Berita & Pengumuman
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Tambahkan pengumuman resmi desa, agenda rapat, kegiatan pembangunan, atau warta lainnya di balai desa, lengkap dengan galeri foto lampiran kegiatan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Add / Edit News */}
        <div className="lg:col-span-5" ref={formRef}>
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              {editingId ? "Ubah Berita / Pengumuman" : "Tambah Berita Baru"}
            </h2>

            <form onSubmit={promptSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Kategori / Tag
                </label>
                <Select value={tag} onValueChange={(val) => setTag(val)}>
                  <SelectTrigger className="w-full h-10 px-3 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] text-[color:var(--ink)] focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:border-[color:var(--forest)]">
                    <SelectValue placeholder="Pilih Kategori / Tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-[color:var(--card)] border border-[color:var(--line)] text-[color:var(--ink)]">
                    <SelectItem value="Kegiatan" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Kegiatan Desa</SelectItem>
                    <SelectItem value="Pengumuman" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pengumuman Resmi</SelectItem>
                    <SelectItem value="Pembangunan" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pembangunan & Infrastruktur</SelectItem>
                    <SelectItem value="Kesehatan & Bansos" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Kesehatan & Bansos</SelectItem>
                    <SelectItem value="Pendidikan & Kepemudaan" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pendidikan & Kepemudaan</SelectItem>
                    <SelectItem value="Pertanian & Ketahanan Pangan" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pertanian & Ketahanan Pangan</SelectItem>
                    <SelectItem value="Pemerintahan & Hukum" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Pemerintahan & Hukum</SelectItem>
                    <SelectItem value="Keagamaan & Adat" className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">Keagamaan & Adat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Judul Berita *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Kerja Bakti Dusun Ngrancah..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Isi / Ringkasan Berita *
                </label>
                <Textarea
                  placeholder="Tuliskan isi berita di sini..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] resize-none leading-relaxed"
                />
              </div>

              {/* MULTI-FILE INPUT */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Upload Foto Lampiran (Bisa Pilih Beberapa)
                </label>
                <input
                  type="file"
                  id="beritaFileInput"
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
                  Foto pertama otomatis menjadi gambar sampul utama berita.
                </span>
              </div>

              {/* LIST OF PHOTOS & REORDER CONTROLS */}
              {(existingUrls.length > 0 || draftFiles.length > 0) && (
                <div className="flex flex-col gap-2 border border-[color:var(--line)] p-3 rounded-xl bg-[color:var(--parchment-2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-bold">
                      Lampiran Foto Berita ({existingUrls.length + draftFiles.length})
                    </span>
                    <span className="text-[10px] text-[color:var(--ink-soft)]">
                      Gunakan tombol panah untuk mengatur urutan
                    </span>
                  </div>

                  {/* Existing Saved URLs */}
                  {existingUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[color:var(--card)] border border-[color:var(--line)]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded overflow-hidden relative border border-white/20 flex-shrink-0">
                          <Image src={url} alt={`Foto ${idx + 1}`} fill unoptimized className="object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-[color:var(--ink)] truncate">Foto Tersimpan #{idx + 1}</span>
                          {idx === 0 && (
                            <span className="text-[10px] text-amber-700 font-semibold">★ Gambar Cover Utama</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={idx === 0}
                          onClick={() => moveExistingUrl(idx, "left")}
                          className="h-7 w-7 p-0 text-xs text-[color:var(--ink)]"
                          title="Geser Kiri"
                        >
                          ◀
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={idx === existingUrls.length - 1 && draftFiles.length === 0}
                          onClick={() => moveExistingUrl(idx, "right")}
                          className="h-7 w-7 p-0 text-xs text-[color:var(--ink)]"
                          title="Geser Kanan"
                        >
                          ▶
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeExistingUrl(idx)}
                          className="h-7 w-7 p-0 text-xs text-red-600 hover:text-red-700"
                          title="Hapus Foto"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Draft Files to be Uploaded */}
                  {draftFiles.map((df, idx) => {
                    const globalIdx = existingUrls.length + idx;
                    return (
                      <div key={df.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-10 h-10 rounded overflow-hidden relative border border-white/20 flex-shrink-0">
                            <Image src={df.previewUrl} alt={`Foto Baru ${idx + 1}`} fill unoptimized className="object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-[color:var(--ink)] truncate">{df.file.name}</span>
                            {globalIdx === 0 ? (
                              <span className="text-[10px] text-amber-700 font-semibold">★ Gambar Cover Utama (Baru)</span>
                            ) : (
                              <span className="text-[10px] text-emerald-700">Baru (Akan Diunggah)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={idx === 0 && existingUrls.length === 0}
                            onClick={() => moveDraftFile(idx, "left")}
                            className="h-7 w-7 p-0 text-xs text-[color:var(--ink)]"
                            title="Geser Kiri"
                          >
                            ◀
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={idx === draftFiles.length - 1}
                            onClick={() => moveDraftFile(idx, "right")}
                            className="h-7 w-7 p-0 text-xs text-[color:var(--ink)]"
                            title="Geser Kanan"
                          >
                            ▶
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeDraftFile(df.id)}
                            className="h-7 w-7 p-0 text-xs text-red-600 hover:text-red-700"
                            title="Batal Unggah"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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

              <div className="flex gap-3">
                {editingId && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="w-1/3 h-10 rounded-full border border-[color:var(--line)] text-xs font-medium"
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 rounded-full border-none text-white font-medium bg-[color:var(--forest)]"
                >
                  {loading ? "Menyimpan..." : editingId ? "Perbarui Berita" : "Simpan Berita"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* News List */}
        <div className="lg:col-span-7">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Daftar Berita Aktif ({news.length})
            </h2>

            {news.length === 0 ? (
              <div className="text-center py-8 text-sm text-[color:var(--ink-soft)]">
                Belum ada berita yang ditambahkan.
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[850px] overflow-y-auto pr-1">
                {news.map((item, idx) => {
                  const itemImages = parseImagesList(item.images);

                  return (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--parchment-2)] flex items-start justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`tag ${item.cls} border-none w-fit inline-flex justify-center`} variant="default" style={{ height: "auto", fontSize: "10px" }}>
                            {item.tag}
                          </Badge>
                          <span className="text-[11px] font-mono text-[color:var(--ink-soft)]">
                            {item.date}
                          </span>
                        </div>
                        <h3 className="font-heading text-sm text-[color:var(--ink)] truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[color:var(--ink-soft)] line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>

                        {/* Display thumbnail strips */}
                        {itemImages.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                            {itemImages.map((imgUrl, i) => (
                              <div 
                                key={i} 
                                className="w-10 h-10 rounded-lg border border-white/20 bg-cover bg-center flex-shrink-0 shadow-sm relative overflow-hidden"
                              >
                                <Image src={imgUrl} alt={`Thumb ${i + 1}`} fill unoptimized className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="outline"
                          className="p-2 hover:bg-white text-xs h-8 w-8 rounded-lg border border-[color:var(--line)] bg-transparent cursor-pointer flex items-center justify-center"
                          title="Edit Berita"
                        >
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 2 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 hover:bg-[color:var(--clay)]/10 text-[color:var(--clay)] rounded-lg transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center h-8 w-8"
                          title="Hapus berita"
                        >
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
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
