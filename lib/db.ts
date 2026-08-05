import fs from "fs";
import path from "path";
import { supabase, isPlaceholderSupabase } from "@/utils/supabase/static";
import { supabaseServer } from "@/utils/supabase/admin";
import {
  Umkm,
  Berita,
  GaleriItem,
  Potensi,
  Lembaga,
  ProfilDesa,
  Agenda,
  BukuTamu,
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  StatistikPenduduk,
} from "./data";

const STORE_PATH = path.join(process.cwd(), "lib", "store.json");

declare global {
  var __DESA_STORE__: any;
}

function readStore(): any {
  if (!globalThis.__DESA_STORE__) {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        globalThis.__DESA_STORE__ = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error reading store.json:", err);
    }
    if (!globalThis.__DESA_STORE__) {
      globalThis.__DESA_STORE__ = {};
    }
  }
  return globalThis.__DESA_STORE__;
}

function writeStore(data: any) {
  globalThis.__DESA_STORE__ = data;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Read-only filesystem safe fallback
  }
}

// Helper to filter and merge Supabase list with local edits & deletes
function syncListWithLocal<T extends { id?: number }>(
  supabaseList: T[],
  localList: T[],
  deletedIds: number[] = []
): T[] {
  const deletedSet = new Set(deletedIds || []);
  const result: T[] = [];
  const sbIdSet = new Set((supabaseList || []).map((item) => item.id).filter(Boolean));

  for (const item of supabaseList || []) {
    if (!item.id) continue;
    if (deletedSet.has(item.id)) continue;

    const localMatch = (localList || []).find((l) => l.id === item.id);
    if (localMatch) {
      result.push({ ...localMatch, ...item });
    } else {
      result.push(item);
    }
  }

  for (const localItem of localList || []) {
    if (!localItem.id) continue;
    if (deletedSet.has(localItem.id)) continue;
    if (!sbIdSet.has(localItem.id)) {
      result.push(localItem);
    }
  }

  return result;
}

// ==================== UMKM ====================
export async function getUmkmList(): Promise<Umkm[]> {
  const store = readStore();
  const localList: Umkm[] = store.umkm || [];
  const deletedIds: number[] = store.deletedUmkm || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("umkm").select("*").order("id", { ascending: true });
      if (!error && data) {
        const sbList = data.map((u: any) => ({
          ...u,
          wa: u.wa || undefined,
          phone: u.phone || undefined,
          mapsUrl: u.maps_url || u.mapsUrl || undefined,
          maps_url: u.maps_url || u.mapsUrl || undefined,
        }));
        return syncListWithLocal(sbList as Umkm[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((u) => !deletedIds.includes(u.id));
}

export async function getUmkmById(id: number): Promise<Umkm | undefined> {
  const list = await getUmkmList();
  return list.find((u) => u.id === id) || list[0];
}

export async function saveUmkm(item: Omit<Umkm, "id"> & { id?: number }): Promise<Umkm> {
  const sbPayload = {
    name: item.name,
    owner: item.owner,
    category: item.category,
    year: item.year,
    product: item.product,
    tagline: item.tagline || null,
    desc: item.desc,
    address: item.address,
    wa: item.wa || null,
    phone: item.phone || null,
    maps_url: item.mapsUrl || item.maps_url || null,
    social: item.social || null,
    grad: item.grad || "",
    image: item.image || null,
  };

  const store = readStore();
  const list: Umkm[] = store.umkm || [];
  let resultItem: Umkm;

  if (item.id) {
    resultItem = {
      ...sbPayload,
      tagline: sbPayload.tagline || undefined,
      wa: sbPayload.wa || undefined,
      phone: sbPayload.phone || undefined,
      mapsUrl: sbPayload.maps_url || undefined,
      maps_url: sbPayload.maps_url || undefined,
      social: sbPayload.social || undefined,
      image: sbPayload.image || undefined,
      id: item.id,
    } as Umkm;
    store.umkm = list.map((u) => (u.id === item.id ? resultItem : u));
    store.deletedUmkm = (store.deletedUmkm || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((u) => u.id || 0)) + 1 : 1;
    resultItem = {
      ...sbPayload,
      tagline: sbPayload.tagline || undefined,
      wa: sbPayload.wa || undefined,
      phone: sbPayload.phone || undefined,
      mapsUrl: sbPayload.maps_url || undefined,
      maps_url: sbPayload.maps_url || undefined,
      social: sbPayload.social || undefined,
      image: sbPayload.image || undefined,
      id: newId,
    } as Umkm;
    store.umkm = [...list, resultItem];
  }

  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { error } = await supabaseServer.from("umkm").update(sbPayload).eq("id", item.id);
        if (error) {
          console.error("Supabase update umkm error:", error);
          await supabase.from("umkm").update(sbPayload).eq("id", item.id);
        }
      } else {
        const { error } = await supabaseServer.from("umkm").insert(sbPayload);
        if (error) {
          console.error("Supabase insert umkm error:", error);
          await supabase.from("umkm").insert(sbPayload);
        }
      }
    } catch (e) {
      console.error("Supabase umkm exception:", e);
    }
  }

  return resultItem;
}

export async function deleteUmkm(id: number): Promise<boolean> {
  const store = readStore();
  store.umkm = (store.umkm || []).filter((u: Umkm) => u.id !== id);
  store.deletedUmkm = [...(store.deletedUmkm || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("umkm").delete().eq("id", id);
      await supabase.from("umkm").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== BERITA ====================
export async function getBeritaList(): Promise<Berita[]> {
  const store = readStore();
  const localList: Berita[] = store.berita || [];
  const deletedIds: number[] = store.deletedBerita || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("berita").select("*").order("published_at", { ascending: false });
      if (!error && data) {
        const sbList = data.map((b: any) => {
          let dateStr = "";
          try {
            if (b.published_at) {
              const d = new Date(b.published_at);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
              }
            }
          } catch (e) {}

          if (!dateStr) {
            dateStr = b.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
          }

          return {
            id: b.id,
            tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "Umum",
            cls: b.cls || "",
            title: b.title || "",
            desc: b.desc || "",
            date: dateStr,
            images: b.images || null,
          };
        }) as Berita[];
        return syncListWithLocal(sbList, localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id || 0));
}

export async function getBeritaById(id: number): Promise<Berita | undefined> {
  if (isNaN(id)) return undefined;
  const list = await getBeritaList();
  return list.find((b) => b.id === id);
}

export async function addBerita(item: Omit<Berita, "date"> & { date?: string }): Promise<Berita> {
  const store = readStore();
  const list: Berita[] = store.berita || [];
  const newId = list.length > 0 ? Math.max(...list.map((b) => b.id || 0)) + 1 : 1;
  const newItem: Berita = {
    id: newId,
    tag: item.tag,
    cls: item.cls || "",
    title: item.title,
    desc: item.desc,
    date: item.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    images: item.images,
  };

  store.berita = [newItem, ...list];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("berita").insert({
        tag: item.tag.toLowerCase(),
        cls: item.cls || "",
        title: item.title,
        desc: item.desc,
        published_at: new Date().toISOString(),
        images: item.images || null,
      });
    } catch (e) {}
  }

  // Otomatis masukkan foto lampiran berita ke Galeri Desa
  if (item.images && item.images.trim().length > 0) {
    const imageUrls = item.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const imgUrl of imageUrls) {
      try {
        const existingGaleri: GaleriItem[] = store.galeri || [];
        const alreadyInGaleri = existingGaleri.some((g: GaleriItem) => g.image === imgUrl);
        if (!alreadyInGaleri) {
          await addGaleri({
            label: item.title,
            cat: item.tag || "Kegiatan Desa",
            grad: "g1",
            image: imgUrl,
            desc: `Foto Dokumentasi Berita: ${item.title}`,
          });
        }
      } catch (err) {
        console.error("Gagal menyalin foto berita ke galeri:", err);
      }
    }
  }

  return newItem;
}

export async function deleteBeritaById(id: number): Promise<boolean> {
  const store = readStore();
  store.berita = (store.berita || []).filter((b: Berita) => b.id !== id);
  store.deletedBerita = [...(store.deletedBerita || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("berita").delete().eq("id", id);
      await supabase.from("berita").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

export async function deleteBerita(id: number): Promise<boolean> {
  return deleteBeritaById(id);
}

// ==================== GALERI ====================
export async function getGaleriList(): Promise<GaleriItem[]> {
  const store = readStore();
  const localList: GaleriItem[] = store.galeri || [];
  const deletedIds: number[] = store.deletedGaleri || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("galeri").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        const sbList = data.map((g: any) => ({
          ...g,
          image: g.images ? g.images.split(",")[0] : g.image,
          images: g.images || g.image || undefined,
        })) as GaleriItem[];
        return syncListWithLocal(sbList, localList, deletedIds);
      }
    } catch (e) {}
  }

  return localList
    .filter((g) => !deletedIds.includes(g.id || 0))
    .map((g) => ({
      ...g,
      image: g.images ? g.images.split(",")[0] : g.image,
      images: g.images || g.image || undefined,
    }));
}

export async function addGaleri(item: GaleriItem): Promise<GaleriItem> {
  const store = readStore();
  const list: GaleriItem[] = store.galeri || [];
  const newId = list.length > 0 ? Math.max(...list.map((g) => g.id || 0)) + 1 : 1;

  const primaryImage = item.images ? item.images.split(",")[0].trim() : item.image;
  const newItem: GaleriItem = {
    ...item,
    id: newId,
    image: primaryImage,
    images: item.images || item.image || undefined,
  };

  store.galeri = [newItem, ...list];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const fullPayload = {
        label: item.label,
        cat: item.cat,
        grad: item.grad || "",
        image: primaryImage || null,
        images: item.images || item.image || null,
        desc: item.desc || null,
      };
      const { data, error } = await supabaseServer.from("galeri").insert(fullPayload).select();
      if (error) {
        // Fallback without `images` column if column is not yet added in Supabase table
        const fallbackPayload = {
          label: item.label,
          cat: item.cat,
          grad: item.grad || "",
          image: primaryImage || null,
          desc: item.desc || null,
        };
        const { data: fbData } = await supabaseServer.from("galeri").insert(fallbackPayload).select();
        if (fbData && fbData[0]) {
          newItem.id = fbData[0].id;
        }
      } else if (data && data[0]) {
        newItem.id = data[0].id;
      }
    } catch (e) {
      try {
        await supabase.from("galeri").insert({
          label: item.label,
          cat: item.cat,
          grad: item.grad || "",
          image: primaryImage || null,
          desc: item.desc || null,
        });
      } catch (err2) {}
    }
  }

  return newItem;
}

export async function deleteGaleriById(id: number): Promise<boolean> {
  const store = readStore();
  store.galeri = (store.galeri || []).filter((g: GaleriItem) => g.id !== id);
  store.deletedGaleri = [...(store.deletedGaleri || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("galeri").delete().eq("id", id);
      await supabase.from("galeri").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

export async function deleteGaleri(id: number): Promise<boolean> {
  return deleteGaleriById(id);
}

// ==================== POTENSI ====================
export async function getPotensiList(): Promise<Potensi[]> {
  const store = readStore();
  const localList: Potensi[] = store.potensi || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("potensi").select("*").order("num", { ascending: true });
      if (!error && data && data.length > 0) return data as Potensi[];
    } catch (e) {}
  }
  return localList;
}

export async function updatePotensi(num: string, title: string, desc: string): Promise<boolean> {
  const store = readStore();
  store.potensi = (store.potensi || []).map((p: Potensi) => (p.num === num ? { ...p, title, desc } : p));
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("potensi").update({ title, desc, updated_at: new Date().toISOString() }).eq("num", num);
    } catch (e) {}
  }
  return true;
}

// ==================== LEMBAGA ====================
export async function getLembagaList(): Promise<Lembaga[]> {
  const store = readStore();
  const localList: Lembaga[] = store.lembaga || [];
  const deletedIds: number[] = store.deletedLembaga || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("lembaga").select("*").order("id", { ascending: true });
      if (!error && data) {
        return syncListWithLocal(data as Lembaga[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((l) => !deletedIds.includes(l.id));
}

export async function saveLembaga(item: Omit<Lembaga, "id"> & { id?: number }): Promise<Lembaga> {
  const store = readStore();
  const list: Lembaga[] = store.lembaga || [];
  let resultItem: Lembaga;

  if (item.id) {
    resultItem = { ...item, id: item.id } as Lembaga;
    store.lembaga = list.map((l) => (l.id === item.id ? resultItem : l));
    store.deletedLembaga = (store.deletedLembaga || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((l) => l.id || 0)) + 1 : 1;
    resultItem = { ...item, id: newId } as Lembaga;
    store.lembaga = [...list, resultItem];
  }
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const { id: itemId, ...payload } = item;
      if (itemId) {
        const { error } = await supabaseServer.from("lembaga").update(payload).eq("id", itemId);
        if (error) await supabase.from("lembaga").update(payload).eq("id", itemId);
      } else {
        const { error } = await supabaseServer.from("lembaga").insert(payload);
        if (error) await supabase.from("lembaga").insert(payload);
      }
    } catch (e) {}
  }

  return resultItem;
}

export async function deleteLembaga(id: number): Promise<boolean> {
  const store = readStore();
  store.lembaga = (store.lembaga || []).filter((l: Lembaga) => l.id !== id);
  store.deletedLembaga = [...(store.deletedLembaga || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("lembaga").delete().eq("id", id);
      await supabase.from("lembaga").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== PROFIL DESA ====================
export async function getProfilDesa(): Promise<ProfilDesa> {
  const store = readStore();
  if (store.profil && store.profil.visi) {
    return store.profil;
  }
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("profil").select("*").single();
      if (!error && data) return { visi: data.visi, misi: data.misi };
    } catch (e) {}
  }
  return store.profil || { visi: "", misi: [] };
}

export async function saveProfilDesa(profil: ProfilDesa): Promise<boolean> {
  const store = readStore();
  store.profil = profil;
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("profil").upsert({ id: 1, visi: profil.visi, misi: profil.misi });
    } catch (e) {}
  }
  return true;
}

export const getProfilData = getProfilDesa;
export const updateProfilVisiMisi = saveProfilDesa;

// ==================== AGENDA ====================
export async function getAgendaList(): Promise<Agenda[]> {
  const store = readStore();
  const localList: Agenda[] = store.agenda || [];
  const deletedIds: number[] = store.deletedAgenda || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("agenda").select("*").order("id", { ascending: false });
      if (!error && data) {
        return syncListWithLocal(data as Agenda[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((a) => !deletedIds.includes(a.id));
}

export async function saveAgenda(item: Omit<Agenda, "id"> & { id?: number }): Promise<Agenda> {
  const store = readStore();
  const list: Agenda[] = store.agenda || [];
  let resultItem: Agenda;

  if (item.id) {
    resultItem = { ...item, id: item.id } as Agenda;
    store.agenda = list.map((a) => (a.id === item.id ? resultItem : a));
    store.deletedAgenda = (store.deletedAgenda || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((a) => a.id || 0)) + 1 : 1;
    resultItem = { ...item, id: newId } as Agenda;
    store.agenda = [resultItem, ...list];
  }
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const { id: itemId, ...payload } = item;
      if (itemId) {
        const { error } = await supabaseServer.from("agenda").update(payload).eq("id", itemId);
        if (error) await supabase.from("agenda").update(payload).eq("id", itemId);
      } else {
        const { error } = await supabaseServer.from("agenda").insert(payload);
        if (error) await supabase.from("agenda").insert(payload);
      }
    } catch (e) {}
  }

  return resultItem;
}

export async function deleteAgenda(id: number): Promise<boolean> {
  const store = readStore();
  store.agenda = (store.agenda || []).filter((a: Agenda) => a.id !== id);
  store.deletedAgenda = [...(store.deletedAgenda || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("agenda").delete().eq("id", id);
      await supabase.from("agenda").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== BUKU TAMU ====================
export async function getBukuTamuList(): Promise<BukuTamu[]> {
  const store = readStore();
  const localList: BukuTamu[] = store.buku_tamu || [];
  const deletedIds: number[] = store.deletedBukuTamu || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("buku_tamu").select("*").order("id", { ascending: false });
      if (!error && data) {
        return syncListWithLocal(data as BukuTamu[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id));
}

export async function addBukuTamu(item: Omit<BukuTamu, "id">): Promise<BukuTamu> {
  const store = readStore();
  const list: BukuTamu[] = store.buku_tamu || [];
  const newId = list.length > 0 ? Math.max(...list.map((b) => b.id || 0)) + 1 : 1;
  const newItem = { ...item, id: newId };
  store.buku_tamu = [newItem, ...list];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const { error } = await supabaseServer.from("buku_tamu").insert(item);
      if (error) await supabase.from("buku_tamu").insert(item);
    } catch (e) {
      try {
        await supabase.from("buku_tamu").insert(item);
      } catch (err2) {}
    }
  }

  return newItem;
}

export async function deleteBukuTamu(id: number): Promise<boolean> {
  const store = readStore();
  store.buku_tamu = (store.buku_tamu || []).filter((b: BukuTamu) => b.id !== id);
  store.deletedBukuTamu = [...(store.deletedBukuTamu || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("buku_tamu").delete().eq("id", id);
      await supabase.from("buku_tamu").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== PENGADUAN ====================
export async function getPengaduanList(): Promise<Pengaduan[]> {
  const store = readStore();
  const localList: Pengaduan[] = store.pengaduan || [];
  const deletedIds: number[] = store.deletedPengaduan || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("pengaduan").select("*").order("id", { ascending: false });
      if (!error && data) {
        return syncListWithLocal(data as Pengaduan[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((p) => !deletedIds.includes(p.id));
}

export async function addPengaduan(item: Omit<Pengaduan, "id" | "status" | "tanggapan">): Promise<Pengaduan> {
  const sbPayload = {
    nama: item.nama,
    dusun: item.dusun,
    judul: item.judul,
    isi: item.isi,
    tanggal: item.tanggal,
    foto: item.foto || item.image || null,
    image: item.foto || item.image || null,
    status: "Baru" as const,
    tanggapan: "",
  };
  const store = readStore();
  const list: Pengaduan[] = store.pengaduan || [];
  const newId = list.length > 0 ? Math.max(...list.map((p) => p.id || 0)) + 1 : 1;
  const newItem: Pengaduan = {
    id: newId,
    nama: item.nama,
    dusun: item.dusun,
    judul: item.judul,
    isi: item.isi,
    tanggal: item.tanggal,
    foto: item.foto || item.image || undefined,
    image: item.foto || item.image || undefined,
    status: "Baru",
    tanggapan: "",
  };
  store.pengaduan = [newItem, ...list];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const { error } = await supabaseServer.from("pengaduan").insert(sbPayload);
      if (error) await supabase.from("pengaduan").insert(sbPayload);
    } catch (e) {
      try {
        await supabase.from("pengaduan").insert(sbPayload);
      } catch (err2) {}
    }
  }

  return newItem;
}

export async function updateStatusPengaduan(id: number, status: Pengaduan["status"], tanggapan?: string): Promise<boolean> {
  const store = readStore();
  store.pengaduan = (store.pengaduan || []).map((p: Pengaduan) => (p.id === id ? { ...p, status, tanggapan } : p));
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("pengaduan").update({ status, tanggapan }).eq("id", id);
    } catch (e) {}
  }
  return true;
}

export async function deletePengaduan(id: number): Promise<boolean> {
  const store = readStore();
  store.pengaduan = (store.pengaduan || []).filter((p: Pengaduan) => p.id !== id);
  store.deletedPengaduan = [...(store.deletedPengaduan || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("pengaduan").delete().eq("id", id);
      await supabase.from("pengaduan").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== APBDES ====================
export async function getApbdesRingkasan(): Promise<ApbdesRingkasan> {
  const store = readStore();
  if (store.apbdes_ringkasan && store.apbdes_ringkasan.pendapatan) {
    return store.apbdes_ringkasan;
  }

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("apbdes_ringkasan").select("*").single();
      if (!error && data) return data as ApbdesRingkasan;
    } catch (e) {}
  }
  return store.apbdes_ringkasan || { pendapatan: "0", belanja: "0", pembiayaan: "0", tahun: 2026 };
}

export async function updateApbdesRingkasan(ringkasan: ApbdesRingkasan): Promise<boolean> {
  const store = readStore();
  store.apbdes_ringkasan = ringkasan;
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("apbdes_ringkasan").upsert({ id: 1, ...ringkasan });
    } catch (e) {}
  }
  return true;
}

export async function getApbdesBidangList(): Promise<ApbdesBidang[]> {
  const store = readStore();
  const localList: ApbdesBidang[] = store.apbdes_bidang || [];
  const deletedIds: number[] = store.deletedApbdesBidang || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("apbdes_bidang").select("*").order("id", { ascending: true });
      if (!error && data) {
        return syncListWithLocal(data as ApbdesBidang[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id));
}

export async function saveApbdesBidang(item: Omit<ApbdesBidang, "id"> & { id?: number }): Promise<ApbdesBidang> {
  const store = readStore();
  const list: ApbdesBidang[] = store.apbdes_bidang || [];
  let resultItem: ApbdesBidang;

  if (item.id) {
    resultItem = { ...item, id: item.id } as ApbdesBidang;
    store.apbdes_bidang = list.map((b) => (b.id === item.id ? resultItem : b));
    store.deletedApbdesBidang = (store.deletedApbdesBidang || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((b) => b.id || 0)) + 1 : 1;
    resultItem = { ...item, id: newId } as ApbdesBidang;
    store.apbdes_bidang = [...list, resultItem];
  }
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const { id: itemId, ...payload } = item;
      if (itemId) {
        const { error } = await supabaseServer.from("apbdes_bidang").update(payload).eq("id", itemId);
        if (error) await supabase.from("apbdes_bidang").update(payload).eq("id", itemId);
      } else {
        const { error } = await supabaseServer.from("apbdes_bidang").insert(payload);
        if (error) await supabase.from("apbdes_bidang").insert(payload);
      }
    } catch (e) {}
  }

  return resultItem;
}

export async function deleteApbdesBidang(id: number): Promise<boolean> {
  const store = readStore();
  store.apbdes_bidang = (store.apbdes_bidang || []).filter((b: ApbdesBidang) => b.id !== id);
  store.deletedApbdesBidang = [...(store.deletedApbdesBidang || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("apbdes_bidang").delete().eq("id", id);
      await supabase.from("apbdes_bidang").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== PRODUK HUKUM ====================
export async function getProdukHukumList(): Promise<ProdukHukum[]> {
  const store = readStore();
  const localList: ProdukHukum[] = store.produk_hukum || [];
  const deletedIds: number[] = store.deletedProdukHukum || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("produk_hukum").select("*").order("id", { ascending: false });
      if (!error && data) {
        return syncListWithLocal(data as ProdukHukum[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((p) => !deletedIds.includes(p.id));
}

export async function saveProdukHukum(item: Omit<ProdukHukum, "id"> & { id?: number }): Promise<ProdukHukum> {
  const store = readStore();
  const list: ProdukHukum[] = store.produk_hukum || [];
  let resultItem: ProdukHukum;

  if (item.id) {
    resultItem = { ...item, id: item.id } as ProdukHukum;
    store.produk_hukum = list.map((p) => (p.id === item.id ? resultItem : p));
    store.deletedProdukHukum = (store.deletedProdukHukum || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id || 0)) + 1 : 1;
    resultItem = { ...item, id: newId } as ProdukHukum;
    store.produk_hukum = [resultItem, ...list];
  }
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      const { id: itemId, ...payload } = item;
      if (itemId) {
        const { error } = await supabaseServer.from("produk_hukum").update(payload).eq("id", itemId);
        if (error) await supabase.from("produk_hukum").update(payload).eq("id", itemId);
      } else {
        const { error } = await supabaseServer.from("produk_hukum").insert(payload);
        if (error) await supabase.from("produk_hukum").insert(payload);
      }
    } catch (e) {}
  }

  return resultItem;
}

export async function deleteProdukHukum(id: number): Promise<boolean> {
  const store = readStore();
  store.produk_hukum = (store.produk_hukum || []).filter((p: ProdukHukum) => p.id !== id);
  store.deletedProdukHukum = [...(store.deletedProdukHukum || []), id];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("produk_hukum").delete().eq("id", id);
      await supabase.from("produk_hukum").delete().eq("id", id);
    } catch (e) {}
  }
  return true;
}

// ==================== STATISTIK KEPENDUDUKAN ====================
export async function getStatistikPenduduk(): Promise<StatistikPenduduk> {
  const store = readStore();
  const defaultStatistik: StatistikPenduduk = {
    totalPenduduk: 4815,
    totalKk: 1753,
    lakiLaki: 2532,
    perempuan: 2383,
    dusunList: [
      { nama: "Dusun Blaraksari", rt: 2, rw: 1, jiwa: 168 },
      { nama: "Dusun Sukoharjo", rt: 4, rw: 1, jiwa: 351 },
      { nama: "Dusun Tulakan", rt: 2, rw: 1, jiwa: 410 },
      { nama: "Dusun Jati", rt: 2, rw: 1, jiwa: 210 },
      { nama: "Dusun Pule", rt: 2, rw: 1, jiwa: 364 },
      { nama: "Dusun Dadapan", rt: 6, rw: 1, jiwa: 901 },
      { nama: "Dusun Bonagung", rt: 2, rw: 1, jiwa: 279 },
      { nama: "Dusun Dalan Gede", rt: 2, rw: 1, jiwa: 358 },
      { nama: "Dusun Sendangsari", rt: 2, rw: 1, jiwa: 420 },
      { nama: "Dusun Ngroto", rt: 4, rw: 1, jiwa: 739 },
      { nama: "Dusun Ngandong", rt: 4, rw: 1, jiwa: 717 },
    ],
    pendidikanList: [
      { name: "Tidak / Belum Sekolah", count: 575 },
      { name: "SD / Sederajat", count: 351 },
      { name: "Tamat SD / Sederajat", count: 2248 },
      { name: "SLTP / Sederajat", count: 956 },
      { name: "SLTA / SMK / Sederajat", count: 679 },
      { name: "Diploma / Sarjana (D3/S1/S2)", count: 106 },
    ],
    pekerjaanList: [
      { name: "Pelajar / Mahasiswa", count: 248, pct: 25.5 },
      { name: "Petani / Pekebun", count: 206, pct: 21.2 },
      { name: "Wiraswasta / UMKM", count: 187, pct: 19.2 },
      { name: "Karyawan Swasta", count: 62, pct: 6.4 },
      { name: "Lainnya", count: 57, pct: 5.9 },
      { name: "PNS", count: 27, pct: 2.8 },
      { name: "Belum / Tidak Bekerja", count: 89, pct: 9.2 },
    ],
  };

  if (!isPlaceholderSupabase) {
    try {
      // 1. Coba baca dari 4 tabel terpisah Supabase (gunakan limit(1) agar tidak crash PGRST116 saat tabel kosong)
      const { data: ringkasanRows } = await supabase.from("statistik_ringkasan").select("*").limit(1);
      const ringkasan = ringkasanRows && ringkasanRows.length > 0 ? ringkasanRows[0] : null;

      const { data: dusun } = await supabase.from("statistik_dusun").select("*").order("id", { ascending: true });
      const { data: pendidikan } = await supabase.from("statistik_pendidikan").select("*").order("id", { ascending: true });
      const { data: pekerjaan } = await supabase.from("statistik_pekerjaan").select("*").order("id", { ascending: true });

      // Jika ada data di ringkasan ATAU salah satu dari 3 tabel terpisah:
      if (ringkasan || (dusun && dusun.length > 0) || (pendidikan && pendidikan.length > 0) || (pekerjaan && pekerjaan.length > 0)) {
        return {
          totalPenduduk: ringkasan?.total_penduduk ?? ringkasan?.totalPenduduk ?? defaultStatistik.totalPenduduk,
          totalKk: ringkasan?.total_kk ?? ringkasan?.totalKk ?? defaultStatistik.totalKk,
          lakiLaki: ringkasan?.laki_laki ?? ringkasan?.lakiLaki ?? defaultStatistik.lakiLaki,
          perempuan: ringkasan?.perempuan ?? ringkasan?.perempuan ?? defaultStatistik.perempuan,
          dusunList: dusun && dusun.length > 0 
            ? dusun.map((d: any) => ({ nama: d.nama, rt: d.rt, rw: d.rw, jiwa: d.jiwa, ...(d.kk !== undefined ? { kk: d.kk } : {}) })) 
            : defaultStatistik.dusunList,
          pendidikanList: pendidikan && pendidikan.length > 0 
            ? pendidikan.map((p: any) => ({ name: p.name, count: p.count })) 
            : defaultStatistik.pendidikanList,
          pekerjaanList: pekerjaan && pekerjaan.length > 0 
            ? pekerjaan.map((p: any) => ({ name: p.name, count: p.count, pct: p.pct })) 
            : defaultStatistik.pekerjaanList,
        };
      }

      // 2. Fallback ke tabel tunggal lama jika 4 tabel terpisah belum diisi sama sekali
      const { data: lamaRows } = await supabase.from("statistik_penduduk").select("*").limit(1);
      if (lamaRows && lamaRows.length > 0) {
        const data = lamaRows[0];
        return {
          ...defaultStatistik,
          ...data,
          dusunList: data.dusunList?.length ? data.dusunList : defaultStatistik.dusunList,
          pendidikanList: data.pendidikanList?.length ? data.pendidikanList : defaultStatistik.pendidikanList,
          pekerjaanList: data.pekerjaanList?.length ? data.pekerjaanList : defaultStatistik.pekerjaanList,
        } as StatistikPenduduk;
      }
    } catch (e) {
      console.error("Error reading statistik from Supabase:", e);
    }
  }

  // Jika Supabase tidak aktif atau kosong, gunakan local store jika valid, jika tidak gunakan defaultStatistik
  if (store.statistik_penduduk && store.statistik_penduduk.totalPenduduk) {
    return {
      ...defaultStatistik,
      ...store.statistik_penduduk,
      dusunList: store.statistik_penduduk.dusunList?.length ? store.statistik_penduduk.dusunList : defaultStatistik.dusunList,
      pendidikanList: store.statistik_penduduk.pendidikanList?.length ? store.statistik_penduduk.pendidikanList : defaultStatistik.pendidikanList,
      pekerjaanList: store.statistik_penduduk.pekerjaanList?.length ? store.statistik_penduduk.pekerjaanList : defaultStatistik.pekerjaanList,
    };
  }

  return defaultStatistik;
}

export async function updateStatistikPenduduk(dataInput: StatistikPenduduk): Promise<boolean> {
  const store = readStore();
  store.statistik_penduduk = dataInput;
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      // 1. Update ke statistik_ringkasan (tanpa id di payload untuk mencegah error PostgreSQL 428C9)
      const { data: existingRingkasan } = await supabaseServer.from("statistik_ringkasan").select("id").limit(1);
      const ringkasanPayload = {
        total_penduduk: Number(dataInput.totalPenduduk || 0),
        total_kk: Number(dataInput.totalKk || 0),
        laki_laki: Number(dataInput.lakiLaki || 0),
        perempuan: Number(dataInput.perempuan || 0),
      };

      if (existingRingkasan && existingRingkasan.length > 0) {
        const { error: errUpdate } = await supabaseServer
          .from("statistik_ringkasan")
          .update(ringkasanPayload)
          .eq("id", existingRingkasan[0].id);
        if (errUpdate) console.error("Error update statistik_ringkasan:", errUpdate);
      } else {
        const { error: errInsert } = await supabaseServer
          .from("statistik_ringkasan")
          .insert(ringkasanPayload);
        if (errInsert) console.error("Error insert statistik_ringkasan:", errInsert);
      }

      // 2. Update statistik_dusun
      if (dataInput.dusunList && dataInput.dusunList.length > 0) {
        await supabaseServer.from("statistik_dusun").delete().gt("id", -1);
        const { error: errDusun } = await supabaseServer.from("statistik_dusun").insert(
          dataInput.dusunList.map((d) => ({
            nama: String(d.nama || ""),
            rt: Number(d.rt || 0),
            rw: Number(d.rw || 0),
            jiwa: Number(d.jiwa || 0),
            ...(d.kk !== undefined ? { kk: Number(d.kk) } : {}),
          }))
        );
        if (errDusun) console.error("Error insert statistik_dusun:", errDusun);
      }

      // 3. Update statistik_pendidikan
      if (dataInput.pendidikanList && dataInput.pendidikanList.length > 0) {
        await supabaseServer.from("statistik_pendidikan").delete().gt("id", -1);
        const { error: errPendidikan } = await supabaseServer.from("statistik_pendidikan").insert(
          dataInput.pendidikanList.map((p) => ({
            name: String(p.name || ""),
            count: Number(p.count || 0),
          }))
        );
        if (errPendidikan) console.error("Error insert statistik_pendidikan:", errPendidikan);
      }

      // 4. Update statistik_pekerjaan
      if (dataInput.pekerjaanList && dataInput.pekerjaanList.length > 0) {
        await supabaseServer.from("statistik_pekerjaan").delete().gt("id", -1);
        const { error: errPekerjaan } = await supabaseServer.from("statistik_pekerjaan").insert(
          dataInput.pekerjaanList.map((p) => ({
            name: String(p.name || ""),
            count: Number(p.count || 0),
            pct: Number(p.pct || 0),
          }))
        );
        if (errPekerjaan) console.error("Error insert statistik_pekerjaan:", errPekerjaan);
      }

      // 5. Backup ke tabel tunggal lama
      const { data: existingLama } = await supabaseServer.from("statistik_penduduk").select("id").limit(1);
      if (existingLama && existingLama.length > 0) {
        await supabaseServer.from("statistik_penduduk").update(dataInput).eq("id", existingLama[0].id);
      } else {
        await supabaseServer.from("statistik_penduduk").insert(dataInput);
      }
    } catch (e) {
      console.error("Error updating statistik in Supabase:", e);
    }
  }

  return true;
}
