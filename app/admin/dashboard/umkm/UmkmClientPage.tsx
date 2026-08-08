"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Umkm } from "@/lib/data";
import { saveUmkmAction, deleteUmkmAction } from "@/app/admin/actions";
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
import ConfirmModal from "@/components/ConfirmModal";
import { parseImagesList } from "@/lib/utils";
import { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_FILE_LABEL } from "@/lib/upload-limits";
import { uploadImageDirect } from "@/lib/direct-image-upload";

interface Props {
  initialUmkm: Umkm[];
}

interface DraftFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

const CATEGORIES = ["Kuliner", "Fashion & Batik", "Kerajinan", "Pertanian", "Peternakan", "Jasa", "Lainnya"];

export default function UmkmClientPage({ initialUmkm }: Props) {
  const router = useRouter();
  const [umkmList, setUmkmList] = useState<Umkm[]>(initialUmkm);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [product, setProduct] = useState("");
  const [tagline, setTagline] = useState("");
  const [desc, setDesc] = useState("");
  const [address, setAddress] = useState("");
  const [wa, setWa] = useState("");
  const [phone, setPhone] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [social, setSocial] = useState("");
  
  // Multi-Image Upload State
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [draftFiles, setDraftFiles] = useState<DraftFileItem[]>([]);
  const [currentGrad, setCurrentGrad] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleEdit = (item: Umkm) => {
    setEditingId(item.id);
    setName(item.name);
    setOwner(item.owner);
    
    if (CATEGORIES.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory("");
    } else {
      setCategory("Lainnya");
      setCustomCategory(item.category);
    }
    
    setYear(item.year);
    setProduct(item.product);
    setTagline(item.tagline || "");
    setDesc(item.desc);
    setAddress(item.address);
    setWa(item.wa || "");
    setPhone(item.phone || "");
    setMapsUrl(item.mapsUrl || item.maps_url || "");
    setSocial(item.social || "");
    
    const parsedImages = parseImagesList(item.images);
    const urls = parsedImages.length > 0 ? parsedImages : item.image ? [item.image] : [];
    setExistingUrls(urls);
    setDraftFiles([]);
    setCurrentGrad(item.grad);

    setError(null);
    setSuccess(null);

    // Scroll smoothly to form
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
    setError(null);
  };

  const resetForm = () => {
    setName("");
    setOwner("");
    setCategory(CATEGORIES[0]);
    setCustomCategory("");
    setYear(new Date().getFullYear());
    setProduct("");
    setTagline("");
    setDesc("");
    setAddress("");
    setWa("");
    setPhone("");
    setMapsUrl("");
    setSocial("");
    setExistingUrls([]);
    setDraftFiles([]);
    setCurrentGrad(undefined);

    const fileInput = document.getElementById("umkmMultipleFileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    const oversizedFile = selectedFiles.find((file) => file.size > MAX_UPLOAD_FILE_BYTES);
    if (oversizedFile) {
      setError(`Foto "${oversizedFile.name}" melebihi batas ${MAX_UPLOAD_FILE_LABEL}.`);
      e.target.value = "";
      return;
    }
    
    const newDrafts: DraftFileItem[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setDraftFiles((prev) => [...prev, ...newDrafts]);
    setError(null);
    e.target.value = "";
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

    const activeCategory = category === "Lainnya" ? customCategory.trim() : category;

    if (
      !name.trim() ||
      !owner.trim() ||
      !activeCategory ||
      !product.trim() ||
      !desc.trim() ||
      !address.trim()
    ) {
      setError("Mohon lengkapi semua field yang wajib diisi (Nama, Pemilik, Kategori, Produk, Alamat, & Deskripsi).");
      return;
    }

    let cleanWa = wa.trim().replace(/[^0-9]/g, "");
    if (cleanWa) {
      if (cleanWa.startsWith("0")) {
        cleanWa = "62" + cleanWa.slice(1);
      }
      if (!cleanWa.startsWith("62")) {
        setError("Nomor WhatsApp harus menyertakan kode negara (cth: 081xxx atau 6281xxx).");
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      title: editingId ? "Konfirmasi Perbarui UMKM" : "Konfirmasi UMKM Baru",
      message: `Apakah Anda yakin ingin menyimpan data UMKM "${name.trim()}"?`,
      onConfirm: executeSubmit,
    });
  };

  const executeSubmit = async () => {
    const activeCategory = category === "Lainnya" ? customCategory.trim() : category;
    let cleanWa = wa.trim().replace(/[^0-9]/g, "");
    if (cleanWa && cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const draft of draftFiles) {
        const uploadRes = await uploadImageDirect(draft.file);
        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || `Gagal mengunggah foto ${draft.file.name}`);
          return;
        }
        uploadedUrls.push(uploadRes.url);
      }

      const allUrls = [...existingUrls, ...uploadedUrls];
      const imageUrlsStr = allUrls.join(",");
      const coverUrl = allUrls[0] || null;
      let finalGrad = currentGrad || "linear-gradient(135deg,#8b4226,#b0623d)";
      if (coverUrl) finalGrad = "";

      const payload = {
        name: name.trim(),
        owner: owner.trim(),
        category: activeCategory,
        year: Number(year),
        product: product.trim(),
        tagline: tagline.trim() || undefined,
        desc: desc.trim(),
        address: address.trim(),
        wa: cleanWa || undefined,
        phone: phone.trim() || undefined,
        mapsUrl: mapsUrl.trim() || undefined,
        maps_url: mapsUrl.trim() || undefined,
        social: social.trim() || undefined,
        grad: finalGrad,
        image: coverUrl || undefined,
        images: imageUrlsStr || undefined,
      };

      const res = await saveUmkmAction(editingId ? { ...payload, id: editingId } : payload);
      if (res.success && res.item) {
        if (editingId) {
          setUmkmList(umkmList.map((u) => (u.id === editingId ? res.item! : u)));
          setSuccess(`Profil UMKM "${name.trim()}" berhasil diperbarui!`);
          setEditingId(null);
        } else {
          setUmkmList([...umkmList, res.item]);
          setSuccess(`Pelaku UMKM "${name.trim()}" berhasil didaftarkan!`);
        }
        resetForm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Gagal menyimpan data UMKM.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, targetName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus UMKM",
      message: `Apakah Anda yakin ingin menghapus profil UMKM "${targetName}"? Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        setError(null);
        setSuccess(null);
        try {
          const res = await deleteUmkmAction(id);
          if (res.success) {
            setUmkmList(umkmList.filter((u) => u.id !== id));
            setSuccess("Profil UMKM berhasil dihapus!");
            if (editingId === id) handleCancelEdit();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          setError((err as Error).message || "Gagal menghapus profil UMKM.");
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Database UMKM</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Kelola Database UMKM
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Daftarkan pelaku usaha baru, perbarui data kontak dan alamat, serta kelola profil visual etalase digital UMKM warga.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CRUD Form */}
        <div className="lg:col-span-5" ref={formRef}>
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              {editingId ? "Ubah Profil UMKM" : "Daftarkan UMKM Baru"}
            </h2>

            <form onSubmit={promptSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Nama Usaha *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Kripik Tempe Renyah..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Pemilik Usaha *
                  </label>
                  <Input
                    type="text"
                    placeholder="Nama pemilik"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                    style={{ height: "40px" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Tahun Berdiri *
                  </label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                    style={{ height: "40px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Kategori Usaha *
                  </label>
                  <Select value={category} onValueChange={(val) => setCategory(val)}>
                    <SelectTrigger className="w-full h-10 px-3 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] text-[color:var(--ink)] focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:border-[color:var(--forest)]">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-[color:var(--card)] border border-[color:var(--line)] text-[color:var(--ink)]">
                      {CATEGORIES.map((catName) => (
                        <SelectItem key={catName} value={catName} className="focus:bg-[color:var(--parchment)] focus:text-[color:var(--forest-deep)]">
                          {catName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {category === "Lainnya" && (
                  <div className="mt-1">
                    <Input
                      type="text"
                      placeholder="Masukkan kategori kustom"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                      style={{ height: "40px" }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Produk Utama *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Kain batik tulis, kerajinan rotan..."
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Tagline / Judul Slogan Usaha (Opsional)
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Cita Rasa Tradisional Warisan Leluhur"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                />
                <span className="text-[10px] text-[color:var(--ink-soft)] mt-1 block">
                  Menggantikan judul 'Deskripsi Usaha' pada halaman profil publik UMKM.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    No. WhatsApp (Opsional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                    style={{ height: "40px" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    No. Telepon Seluler/Biasa (Opsional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                    style={{ height: "40px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Link Google Maps Lokasi (Opsional)
                  </label>
                  <Input
                    type="text"
                    placeholder="https://maps.google.com/?q=..."
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                    style={{ height: "40px" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Instagram/Sosmed (Opsional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: @batiktulissukoharjo"
                    value={social}
                    onChange={(e) => setSocial(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                    style={{ height: "40px" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Alamat Lengkap Usaha *
                </label>
                <Textarea
                  placeholder="Contoh: Dusun Ngrancah RT 01/RW 02, Desa Sukoharjo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Deskripsi Singkat Usaha *
                </label>
                <Textarea
                  placeholder="Ceritakan sejarah singkat, keunggulan produk, atau bahan baku usaha..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] resize-none leading-relaxed"
                />
              </div>

              {/* MULTI-FILE UPLOAD INPUT */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Pilih & Unggah Foto Usaha (Bisa Lebih Dari 1)
                </label>
                <input
                  type="file"
                  id="umkmMultipleFileInput"
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
                  Dapat memilih beberapa foto sekaligus. Foto urutan pertama otomatis menjadi thumbnail cover.
                </span>
              </div>

              {/* LIST OF PHOTOS & REORDER CONTROLS */}
              {(existingUrls.length > 0 || draftFiles.length > 0) && (
                <div className="flex flex-col gap-2 border border-[color:var(--line)] p-3 rounded-xl bg-[color:var(--parchment-2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[color:var(--forest-deep)] font-bold">
                      Daftar Foto UMKM ({existingUrls.length + draftFiles.length})
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
                            <span className="text-[10px] text-amber-700 font-semibold">★ Thumbnail Cover</span>
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
                          title="Geser Kiri / Ke Atas"
                        >
                          ◀
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={idx === existingUrls.length - 1 && draftFiles.length === 0}
                          onClick={() => moveExistingUrl(idx, "right")}
                          className="h-7 w-7 p-0 text-xs text-[color:var(--ink)]"
                          title="Geser Kanan / Ke Bawah"
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
                              <span className="text-[10px] text-amber-700 font-semibold">★ Thumbnail Cover (Baru)</span>
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
                  {loading ? "Menyimpan..." : editingId ? "Perbarui UMKM" : "Daftarkan UMKM"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Database List */}
        <div className="lg:col-span-7">
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Pelaku Usaha Terdaftar ({umkmList.length})
            </h2>

            {umkmList.length === 0 ? (
              <div className="text-center py-8 text-sm text-[color:var(--ink-soft)]">
                Belum ada UMKM yang ditambahkan ke database.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[900px] overflow-y-auto pr-1">
                {umkmList.map((item) => {
                  const itemImages = parseImagesList(item.images);
                  const coverImage = itemImages[0] || item.image;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--parchment-2)] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Cover Thumbnail Preview */}
                        <div
                          className="w-12 h-12 rounded-lg flex-shrink-0 border border-white/20 relative overflow-hidden"
                          style={
                            coverImage
                              ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                              : { background: item.grad }
                          }
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[color:var(--clay)] bg-[color:var(--clay)]/5 border border-[color:var(--clay)]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {item.category}
                            </span>
                            {itemImages.length > 1 && (
                              <span className="text-[10px] font-mono text-[color:var(--ink-soft)]">
                                📷 {itemImages.length} foto
                              </span>
                            )}
                          </div>
                          <h3 className="font-heading text-sm text-[color:var(--ink)] mt-1 truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[color:var(--ink-soft)] mt-0.5 truncate">
                            Pemilik: {item.owner} · Produk: {item.product}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="outline"
                          className="p-2 hover:bg-white text-xs h-8 w-8 rounded-lg border border-[color:var(--line)] bg-transparent cursor-pointer flex items-center justify-center"
                          title="Edit Profil"
                        >
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 2 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-2 hover:bg-[color:var(--clay)]/10 text-[color:var(--clay)] rounded-lg transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center h-8 w-8"
                          title="Hapus Profil"
                        >
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="14" height="14">
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
