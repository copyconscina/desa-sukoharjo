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

  for (const item of supabaseList || []) {
    if (!item.id) continue;
    if (deletedSet.has(item.id)) continue;
    result.push(item);
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
        return syncListWithLocal(data as Umkm[], localList, deletedIds);
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
  const payload = {
    name: item.name,
    owner: item.owner,
    category: item.category,
    year: item.year,
    product: item.product,
    desc: item.desc,
    address: item.address,
    wa: item.wa,
    social: item.social || null,
    grad: item.grad || "",
    image: item.image || null,
  };

  const store = readStore();
  const list: Umkm[] = store.umkm || [];
  let resultItem: Umkm;

  if (item.id) {
    resultItem = { ...payload, id: item.id } as Umkm;
    store.umkm = list.map((u) => (u.id === item.id ? resultItem : u));
    store.deletedUmkm = (store.deletedUmkm || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((u) => u.id || 0)) + 1 : 1;
    resultItem = { ...payload, id: newId } as Umkm;
    store.umkm = [...list, resultItem];
  }

  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { error } = await supabaseServer.from("umkm").update(payload).eq("id", item.id);
        if (error) await supabase.from("umkm").update(payload).eq("id", item.id);
      } else {
        const { error } = await supabaseServer.from("umkm").insert(payload);
        if (error) await supabase.from("umkm").insert(payload);
      }
    } catch (e) {}
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
        const sbList = data.map((b: any) => ({
          id: b.id,
          tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "",
          cls: b.cls || "",
          title: b.title,
          desc: b.desc || "",
          date: new Date(b.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          images: b.images || null,
        })) as Berita[];
        return syncListWithLocal(sbList, localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id || 0));
}

export async function getBeritaById(id: number): Promise<Berita | undefined> {
  const list = await getBeritaList();
  return list.find((b) => b.id === id) || list[0];
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
        return syncListWithLocal(data as GaleriItem[], localList, deletedIds);
      }
    } catch (e) {}
  }
  return localList.filter((g) => !deletedIds.includes(g.id || 0));
}

export async function addGaleri(item: GaleriItem): Promise<GaleriItem> {
  const store = readStore();
  const list: GaleriItem[] = store.galeri || [];
  const newId = list.length > 0 ? Math.max(...list.map((g) => g.id || 0)) + 1 : 1;
  const newItem = { ...item, id: newId };
  store.galeri = [newItem, ...list];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("galeri").insert({
        label: item.label,
        cat: item.cat,
        grad: item.grad || "",
        image: item.image || null,
        desc: item.desc || null,
      });
    } catch (e) {}
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
      await supabaseServer.from("buku_tamu").insert(item);
    } catch (e) {}
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
  const payload = { ...item, status: "Baru" as const, tanggapan: "" };
  const store = readStore();
  const list: Pengaduan[] = store.pengaduan || [];
  const newId = list.length > 0 ? Math.max(...list.map((p) => p.id || 0)) + 1 : 1;
  const newItem = { ...payload, id: newId };
  store.pengaduan = [newItem, ...list];
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("pengaduan").insert(payload);
    } catch (e) {}
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
    totalPenduduk: 4915,
    totalKk: 1420,
    lakiLaki: 2430,
    perempuan: 2485,
    dusunList: [
      { nama: "Dusun Blaraksari", rt: 4, rw: 2, jiwa: 168 },
      { nama: "Dusun Sukoharjo", rt: 6, rw: 2, jiwa: 351 },
      { nama: "Dusun Tulakan", rt: 7, rw: 2, jiwa: 410 },
      { nama: "Dusun Jati", rt: 5, rw: 2, jiwa: 210 },
      { nama: "Dusun Pule", rt: 6, rw: 2, jiwa: 364 },
      { nama: "Dusun Dadapan", rt: 12, rw: 4, jiwa: 901 },
      { nama: "Dusun Bonagung", rt: 5, rw: 2, jiwa: 279 },
      { nama: "Dusun Dalan Gede", rt: 6, rw: 2, jiwa: 358 },
      { nama: "Dusun Sendangsari", rt: 7, rw: 2, jiwa: 420 },
      { nama: "Dusun Ngroto", rt: 10, rw: 3, jiwa: 739 },
      { nama: "Dusun Ngandong", rt: 10, rw: 3, jiwa: 717 },
    ],
    pendidikanList: [
      { name: "SD / Sederajat", count: 1150 },
      { name: "SMP / Sederajat", count: 980 },
      { name: "SMA / SMK / Sederajat", count: 1240 },
      { name: "Diploma / Sarjana (D3/S1/S2)", count: 472 },
    ],
    pekerjaanList: [
      { name: "Petani & Pekebun", count: 1728, pct: 45 },
      { name: "Buruh Tani / Harian", count: 845, pct: 22 },
      { name: "Wiraswasta / UMKM", count: 576, pct: 15 },
      { name: "Karyawan Swasta", count: 384, pct: 10 },
      { name: "PNS / TNI / POLRI", count: 309, pct: 8 },
    ],
  };

  if (store.statistik_penduduk && store.statistik_penduduk.totalPenduduk) {
    return {
      ...defaultStatistik,
      ...store.statistik_penduduk,
      dusunList: store.statistik_penduduk.dusunList?.length ? store.statistik_penduduk.dusunList : defaultStatistik.dusunList,
      pendidikanList: store.statistik_penduduk.pendidikanList?.length ? store.statistik_penduduk.pendidikanList : defaultStatistik.pendidikanList,
      pekerjaanList: store.statistik_penduduk.pekerjaanList?.length ? store.statistik_penduduk.pekerjaanList : defaultStatistik.pekerjaanList,
    };
  }

  if (!isPlaceholderSupabase) {
    try {
      // 1. Coba baca dari 4 tabel terpisah terlebih dahulu
      const { data: ringkasan } = await supabase.from("statistik_ringkasan").select("*").single();
      const { data: dusun } = await supabase.from("statistik_dusun").select("*").order("id", { ascending: true });
      const { data: pendidikan } = await supabase.from("statistik_pendidikan").select("*").order("id", { ascending: true });
      const { data: pekerjaan } = await supabase.from("statistik_pekerjaan").select("*").order("id", { ascending: true });

      if (ringkasan || (dusun && dusun.length > 0)) {
        return {
          totalPenduduk: ringkasan?.total_penduduk ?? ringkasan?.totalPenduduk ?? defaultStatistik.totalPenduduk,
          totalKk: ringkasan?.total_kk ?? ringkasan?.totalKk ?? defaultStatistik.totalKk,
          lakiLaki: ringkasan?.laki_laki ?? ringkasan?.lakiLaki ?? defaultStatistik.lakiLaki,
          perempuan: ringkasan?.perempuan ?? ringkasan?.perempuan ?? defaultStatistik.perempuan,
          dusunList: dusun && dusun.length > 0 ? dusun.map((d: any) => ({ nama: d.nama, rt: d.rt, rw: d.rw, jiwa: d.jiwa })) : defaultStatistik.dusunList,
          pendidikanList: pendidikan && pendidikan.length > 0 ? pendidikan.map((p: any) => ({ name: p.name, count: p.count })) : defaultStatistik.pendidikanList,
          pekerjaanList: pekerjaan && pekerjaan.length > 0 ? pekerjaan.map((p: any) => ({ name: p.name, count: p.count, pct: p.pct })) : defaultStatistik.pekerjaanList,
        };
      }

      // 2. Fallback ke tabel tunggal lama
      const { data, error } = await supabase.from("statistik_penduduk").select("*").single();
      if (!error && data) {
        return {
          ...defaultStatistik,
          ...data,
          dusunList: data.dusunList?.length ? data.dusunList : defaultStatistik.dusunList,
          pendidikanList: data.pendidikanList?.length ? data.pendidikanList : defaultStatistik.pendidikanList,
          pekerjaanList: data.pekerjaanList?.length ? data.pekerjaanList : defaultStatistik.pekerjaanList,
        } as StatistikPenduduk;
      }
    } catch (e) {}
  }

  return store.statistik_penduduk || defaultStatistik;
}

export async function updateStatistikPenduduk(dataInput: StatistikPenduduk): Promise<boolean> {
  const store = readStore();
  store.statistik_penduduk = dataInput;
  writeStore(store);

  if (!isPlaceholderSupabase) {
    try {
      // 1. Update ke 4 tabel terpisah di Supabase
      await supabaseServer.from("statistik_ringkasan").upsert({
        id: 1,
        total_penduduk: dataInput.totalPenduduk,
        total_kk: dataInput.totalKk,
        laki_laki: dataInput.lakiLaki,
        perempuan: dataInput.perempuan,
      });

      if (dataInput.dusunList && dataInput.dusunList.length > 0) {
        await supabaseServer.from("statistik_dusun").delete().neq("id", 0);
        await supabaseServer.from("statistik_dusun").insert(
          dataInput.dusunList.map((d) => ({ nama: d.nama, rt: d.rt, rw: d.rw, jiwa: d.jiwa }))
        );
      }

      if (dataInput.pendidikanList && dataInput.pendidikanList.length > 0) {
        await supabaseServer.from("statistik_pendidikan").delete().neq("id", 0);
        await supabaseServer.from("statistik_pendidikan").insert(
          dataInput.pendidikanList.map((p) => ({ name: p.name, count: p.count }))
        );
      }

      if (dataInput.pekerjaanList && dataInput.pekerjaanList.length > 0) {
        await supabaseServer.from("statistik_pekerjaan").delete().neq("id", 0);
        await supabaseServer.from("statistik_pekerjaan").insert(
          dataInput.pekerjaanList.map((p) => ({ name: p.name, count: p.count, pct: p.pct }))
        );
      }

      // 2. Backup ke tabel tunggal lama
      await supabaseServer.from("statistik_penduduk").upsert({ id: 1, ...dataInput });
    } catch (e) {
      console.error("Error updating statistik in Supabase:", e);
    }
  }
  return true;
}
