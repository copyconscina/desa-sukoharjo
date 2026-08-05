"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Berita } from "@/lib/data";
import { addBeritaAction, deleteBeritaAction, uploadImageAction } from "@/app/admin/actions";
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
import ImageCropperModal from "@/components/ImageCropperModal";
import ConfirmModal from "@/components/ConfirmModal";
import { parseImagesList } from "@/lib/utils";

interface Props {
  initialNews: Berita[];
}

export default function BeritaClientPage({ initialNews }: Props) {
  const router = useRouter();
  const [news, setNews] = useState<Berita[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Kegiatan");
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(-1);

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

    if (!title.trim() || !desc.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Publis Berita",
      message: `Apakah Anda yakin ingin mempublikasikan berita "${title.trim()}"?`,
      onConfirm: executeSubmit,
    });
  };

  const executeSubmit = async () => {
    setLoading(true);
    try {
      let uploadedUrlsString = "";

      if (croppedFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (const fileToUpload of croppedFiles) {
          const formData = new FormData();
          formData.append("file", fileToUpload);

          const uploadRes = await uploadImageAction(formData);
          if (!uploadRes.success || !uploadRes.url) {
            setError(uploadRes.error || "Gagal mengunggah salah satu foto berita.");
            setLoading(false);
            return;
          }
          uploadedUrls.push(uploadRes.url);
        }
        uploadedUrlsString = uploadedUrls.join(",");
      }

      const res = await addBeritaAction(tag, title.trim(), desc.trim(), uploadedUrlsString);
      if (res.success) {
        const newArticle: Berita = {
          ...res.item,
          title: title.trim(),
          desc: desc.trim(),
          images: uploadedUrlsString || undefined,
        };

        setNews([newArticle, ...news]);
        setTitle("");
        setDesc("");
        setCroppedFiles([]);
        setRawFiles([]);

        const fileInput = document.getElementById("beritaFileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        setSuccess("Berita berhasil ditambahkan dan disimpan!");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menambahkan berita.");
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
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          setError("Gagal menghapus berita.");
        }
      },
    });
  };

  // Convert cropped files to preview URLs
  const previewUrls = croppedFiles.map((f) => URL.createObjectURL(f));

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
        {/* Form Add News */}
        <div className="lg:col-span-5">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Tambah Berita Baru
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

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Upload Foto Lampiran (Bisa Pilih Beberapa)
                </label>
                <input
                  type="file"
                  id="beritaFileInput"
                  multiple
                  accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.avif,.heic,.gif"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    if (selected.length > 0) {
                      setRawFiles(selected);
                      setCroppedFiles([]);
                      setCurrentCropIndex(0);
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

              {/* Multiple Live Previews */}
              {previewUrls.length > 0 && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                    Foto yang Dipilih ({previewUrls.length})
                  </label>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {previewUrls.map((url, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-xl border border-[color:var(--line)] bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${url})` }}
                      />
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
                className="btn btn-primary w-full border-none text-white font-medium"
                style={{
                  height: "40px",
                  background: "var(--forest)",
                  borderRadius: "20px"
                }}
              >
                {loading ? "Menyimpan & Mengunggah..." : "Simpan Berita"}
              </Button>
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
              <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-1">
                {news.map((item, idx) => (
                  <div
                    key={idx}
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
                      {parseImagesList(item.images).length > 0 && (
                        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                          {parseImagesList(item.images).map((imgUrl, i) => (
                            <div 
                              key={i} 
                              className="w-10 h-10 rounded-lg border border-white/20 bg-cover bg-center flex-shrink-0 shadow-sm"
                              style={{ backgroundImage: `url(${imgUrl})` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 hover:bg-[color:var(--clay)]/10 text-[color:var(--clay)] rounded-lg transition-colors border-none bg-transparent cursor-pointer flex-shrink-0"
                      title="Hapus berita"
                    >
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      {currentCropIndex >= 0 && currentCropIndex < rawFiles.length && (
        <ImageCropperModal
          key={currentCropIndex}
          file={rawFiles[currentCropIndex]}
          isOpen={true}
          onClose={() => setCurrentCropIndex(-1)}
          defaultAspectRatio="16:9"
          onCrop={(cropped) => {
            setCroppedFiles((prev) => [...prev, cropped]);
            if (currentCropIndex + 1 < rawFiles.length) {
              setCurrentCropIndex(currentCropIndex + 1);
            } else {
              setCurrentCropIndex(-1);
            }
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
