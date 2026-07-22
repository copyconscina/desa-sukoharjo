"use client";

import { useState } from "react";
import { Potensi } from "@/lib/data";
import { updatePotensiAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  initialPotentials: Potensi[];
}

export default function PotensiClientPage({ initialPotentials }: Props) {
  const [potentials, setPotentials] = useState<Potensi[]>(initialPotentials);
  const [editingItem, setEditingItem] = useState<Potensi | null>(null);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEditClick = (item: Potensi) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDesc(item.desc);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditTitle("");
    setEditDesc("");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setError(null);
    setSuccess(null);

    if (!editTitle.trim() || !editDesc.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await updatePotensiAction(editingItem.num, editTitle.trim(), editDesc.trim());
      if (res.success) {
        setPotentials(
          potentials.map((p) =>
            p.num === editingItem.num ? { ...p, title: editTitle.trim(), desc: editDesc.trim() } : p
          )
        );
        setSuccess(`Potensi "${editingItem.num}" berhasil diperbarui!`);
        setEditingItem(null);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui potensi desa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Potensi Desa</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Kelola Potensi Desa
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Perbarui data dan deskripsi 5 pilar potensi utama Desa Sukoharjo untuk ditampilkan di halaman depan dan halaman khusus potensi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Potentials List */}
        <div className={editingItem ? "lg:col-span-6" : "lg:col-span-12"}>
          <Card className="border border-[color:var(--line)] p-6 bg-[color:var(--card)] shadow-sm">
            <h2 className="text-lg font-heading mb-4 text-[color:var(--forest-deep)]">
              Daftar Bidang Potensi
            </h2>

            <div className="flex flex-col gap-4">
              {potentials.map((item) => (
                <div
                  key={item.num}
                  className={`p-5 rounded-xl border transition-all ${
                    editingItem?.num === item.num
                      ? "border-[color:var(--forest)] bg-[color:var(--forest)]/5 shadow-sm"
                      : "border-[color:var(--line)] bg-[color:var(--parchment-2)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-sm font-semibold text-[color:var(--clay)] uppercase block mb-1">
                        Pilar {item.num}
                      </span>
                      <h3 className="font-heading text-base text-[color:var(--ink)] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleEditClick(item)}
                      variant="outline"
                      className="flex-shrink-0 text-xs px-3 py-1.5 h-auto rounded-lg border border-[color:var(--line)] bg-white font-medium hover:bg-[color:var(--parchment)]"
                    >
                      Ubah Data
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        {editingItem && (
          <div className="lg:col-span-6">
            <Card className="border border-[color:var(--forest)] p-6 bg-[color:var(--card)] shadow-md sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading text-[color:var(--forest-deep)]">
                  Ubah Pilar {editingItem.num}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-xs text-[color:var(--ink-soft)] hover:text-[color:var(--clay)] transition-colors border-none bg-transparent cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Judul Potensi
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-1">
                    Deskripsi Potensi
                  </label>
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl text-sm font-sans outline-none focus:border-[color:var(--forest)] resize-none leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="p-3 text-xs bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="w-1/3 h-10 rounded-full border border-[color:var(--line)] text-xs font-medium"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 h-10 rounded-full border-none text-white font-medium bg-[color:var(--forest)]"
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>

      {success && !editingItem && (
        <div
          className="fixed bottom-6 right-6 p-4 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-lg rounded-xl z-50 animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          {success}
        </div>
      )}
    </div>
  );
}
