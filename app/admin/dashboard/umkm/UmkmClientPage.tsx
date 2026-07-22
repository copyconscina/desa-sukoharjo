"use client";

import { useState, useRef } from "react";
import { Umkm } from "@/lib/data";
import { saveUmkmAction, deleteUmkmAction, uploadImageAction } from "@/app/admin/actions";
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

interface Props {
  initialUmkm: Umkm[];
}

const CATEGORIES = ["Kuliner", "Fashion & Batik", "Kerajinan", "Pertanian", "Peternakan", "Jasa", "Lainnya"];

export default function UmkmClientPage({ initialUmkm }: Props) {
  const [umkmList, setUmkmList] = useState<Umkm[]>(initialUmkm);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [product, setProduct] = useState("");
  const [desc, setDesc] = useState("");
  const [address, setAddress] = useState("");
  const [wa, setWa] = useState("");
  const [social, setSocial] = useState("");
  
  // Image Upload State
  const [file, setFile] = useState<File | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [currentGrad, setCurrentGrad] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setDesc(item.desc);
    setAddress(item.address);
    setWa(item.wa);
    setSocial(item.social || "");
    setFile(null);
    setCurrentImageUrl(item.image);
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
    setDesc("");
    setAddress("");
    setWa("");
    setSocial("");
    setFile(null);
    setCurrentImageUrl(undefined);
    setCurrentGrad(undefined);

    // Reset file input element manually
    const fileInput = document.getElementById("umkmFileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      !address.trim() ||
      !wa.trim()
    ) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    // Clean WA format: remove leading +, spaces, dashes, etc.
    let cleanWa = wa.trim().replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }
    if (!cleanWa.startsWith("62")) {
      setError("Nomor WhatsApp harus menyertakan kode negara (cth: 6281xxx atau 081xxx).");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = currentImageUrl;
      let finalGrad = currentGrad || "linear-gradient(135deg,#8b4226,#b0623d)"; // fallback gradient

      // 1. Upload new cover image if file is selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await uploadImageAction(formData);
        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || "Gagal mengunggah foto cover.");
          setLoading(false);
          return;
        }
        imageUrl = uploadRes.url;
        finalGrad = ""; // Clear default gradient if we use image cover
      }

      const payload = {
        name: name.trim(),
        owner: owner.trim(),
        category: activeCategory,
        year: Number(year),
        product: product.trim(),
        desc: desc.trim(),
        address: address.trim(),
        wa: cleanWa,
        social: social.trim() || undefined,
        grad: finalGrad,
        image: imageUrl,
      };

      // 2. Save UMKM data
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
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data UMKM.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, targetName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus profil UMKM "${targetName}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await deleteUmkmAction(id);
      if (res.success) {
        setUmkmList(umkmList.filter((u) => u.id !== id));
        setSuccess("Profil UMKM berhasil dihapus dari database!");
        if (editingId === id) {
          handleCancelEdit();
        }
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus profil UMKM.");
    }
  };

  const previewUrl = file ? URL.createObjectURL(file) : currentImageUrl;

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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  No. WhatsApp (Kontak) *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                  style={{ height: "40px" }}
                />
                <span className="text-[10px] text-[color:var(--ink-soft)] mt-1 block">
                  Akan otomatis diarahkan ke chat WhatsApp saat diklik pembeli.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                  Username Instagram/Sosial Media (Opsional)
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

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                  Upload Foto Cover Usaha {editingId ? "(Opsional)" : ""}
                </label>
                 <input
                  type="file"
                  id="umkmFileInput"
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

              {/* Cover Preview */}
              {previewUrl && (
                <div className="mt-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2">
                    Preview Tampilan Cover
                  </label>
                  <div
                    className="h-28 rounded-xl border border-[color:var(--line)] overflow-hidden bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${previewUrl})` }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
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
                {umkmList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--parchment-2)] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Cover Thumbnail Preview */}
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0 border border-white/20"
                        style={
                          item.image
                            ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                            : { background: item.grad }
                        }
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-[color:var(--clay)] bg-[color:var(--clay)]/5 border border-[color:var(--clay)]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {item.category}
                        </span>
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
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
          defaultAspectRatio="1:1"
          onCrop={(cropped) => {
            setFile(cropped);
          }}
        />
      )}
    </div>
  );
}
