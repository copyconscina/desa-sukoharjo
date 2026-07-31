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

function readStore(): any {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading store.json:", err);
  }
  return {};
}

function writeStore(data: any) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing store.json:", err);
  }
}

// ==================== UMKM ====================
export async function getUmkmList(): Promise<Umkm[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("umkm").select("*").order("id", { ascending: true });
      if (!error && data) return data as Umkm[];
    } catch (e) {
      console.warn("Supabase fetch failed for UMKM, using local store.");
    }
  }
  const store = readStore();
  return store.umkm || [];
}

export async function getUmkmById(id: number): Promise<Umkm | undefined> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("umkm").select("*").eq("id", id).single();
      if (!error && data) return data as Umkm;
    } catch (e) {}
  }
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

  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { data, error } = await supabaseServer.from("umkm").update(payload).eq("id", item.id).select().single();
        if (!error && data) return data as Umkm;
      } else {
        const { data, error } = await supabaseServer.from("umkm").insert(payload).select().single();
        if (!error && data) return data as Umkm;
      }
    } catch (e) {
      console.warn("Supabase save failed for UMKM, saving to local store.");
    }
  }

  const store = readStore();
  const list: Umkm[] = store.umkm || [];
  let resultItem: Umkm;

  if (item.id) {
    resultItem = { ...payload, id: item.id } as Umkm;
    store.umkm = list.map((u) => (u.id === item.id ? resultItem : u));
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((u) => u.id)) + 1 : 1;
    resultItem = { ...payload, id: newId } as Umkm;
    store.umkm = [...list, resultItem];
  }

  writeStore(store);
  return resultItem;
}

export async function deleteUmkm(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("umkm").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.umkm = (store.umkm || []).filter((u: Umkm) => u.id !== id);
  writeStore(store);
  return true;
}

// ==================== BERITA ====================
export async function getBeritaList(): Promise<Berita[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("berita").select("*").order("published_at", { ascending: false });
      if (!error && data) {
        return data.map((b: any) => ({
          id: b.id,
          tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "",
          cls: b.cls || "",
          title: b.title,
          desc: b.desc || "",
          date: new Date(b.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          images: b.images || null,
        })) as Berita[];
      }
    } catch (e) {}
  }
  const store = readStore();
  return store.berita || [];
}

export async function getBeritaById(id: number): Promise<Berita | undefined> {
  const list = await getBeritaList();
  return list.find((b) => b.id === id) || list[0];
}

export async function addBerita(item: Omit<Berita, "date"> & { date?: string }): Promise<Berita> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabaseServer.from("berita").insert({
        tag: item.tag.toLowerCase(),
        cls: item.cls || "",
        title: item.title,
        desc: item.desc,
        published_at: new Date().toISOString(),
        images: item.images || null,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          tag: data.tag ? data.tag.charAt(0).toUpperCase() + data.tag.slice(1) : "",
          cls: data.cls || "",
          title: data.title,
          desc: data.desc || "",
          date: new Date(data.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          images: data.images || undefined,
        };
      }
    } catch (e) {}
  }

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
  return newItem;
}

export async function deleteBeritaById(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("berita").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.berita = (store.berita || []).filter((b: Berita) => b.id !== id);
  writeStore(store);
  return true;
}

export async function deleteBerita(id: number): Promise<boolean> {
  return deleteBeritaById(id);
}

// ==================== GALERI ====================
export async function getGaleriList(): Promise<GaleriItem[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("galeri").select("*").order("created_at", { ascending: false });
      if (!error && data) return data as GaleriItem[];
    } catch (e) {}
  }
  const store = readStore();
  return store.galeri || [];
}

export async function addGaleri(item: GaleriItem): Promise<GaleriItem> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabaseServer.from("galeri").insert({
        label: item.label,
        cat: item.cat,
        grad: item.grad || "",
        image: item.image || null,
        desc: item.desc || null,
      }).select().single();
      if (!error && data) return data as GaleriItem;
    } catch (e) {}
  }

  const store = readStore();
  const list: GaleriItem[] = store.galeri || [];
  const newId = list.length > 0 ? Math.max(...list.map((g) => g.id || 0)) + 1 : 1;
  const newItem = { ...item, id: newId };
  store.galeri = [newItem, ...list];
  writeStore(store);
  return newItem;
}

export async function deleteGaleriById(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("galeri").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.galeri = (store.galeri || []).filter((g: GaleriItem) => g.id !== id);
  writeStore(store);
  return true;
}

export async function deleteGaleri(id: number): Promise<boolean> {
  return deleteGaleriById(id);
}

// ==================== POTENSI ====================
export async function getPotensiList(): Promise<Potensi[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("potensi").select("*").order("num", { ascending: true });
      if (!error && data) return data as Potensi[];
    } catch (e) {}
  }
  const store = readStore();
  return store.potensi || [];
}

export async function updatePotensi(num: string, title: string, desc: string): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("potensi").update({ title, desc, updated_at: new Date().toISOString() }).eq("num", num);
    } catch (e) {}
  }
  const store = readStore();
  store.potensi = (store.potensi || []).map((p: Potensi) => (p.num === num ? { ...p, title, desc } : p));
  writeStore(store);
  return true;
}

// ==================== LEMBAGA ====================
export async function getLembagaList(): Promise<Lembaga[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("lembaga").select("*").order("id", { ascending: true });
      if (!error && data) return data as Lembaga[];
    } catch (e) {}
  }
  const store = readStore();
  return store.lembaga || [];
}

export async function saveLembaga(item: Omit<Lembaga, "id"> & { id?: number }): Promise<Lembaga> {
  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { data, error } = await supabaseServer.from("lembaga").update(item).eq("id", item.id).select().single();
        if (!error && data) return data as Lembaga;
      } else {
        const { data, error } = await supabaseServer.from("lembaga").insert(item).select().single();
        if (!error && data) return data as Lembaga;
      }
    } catch (e) {}
  }
  const store = readStore();
  const list: Lembaga[] = store.lembaga || [];
  let resultItem: Lembaga;

  if (item.id) {
    resultItem = { ...item, id: item.id } as Lembaga;
    store.lembaga = list.map((l) => (l.id === item.id ? resultItem : l));
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((l) => l.id)) + 1 : 1;
    resultItem = { ...item, id: newId } as Lembaga;
    store.lembaga = [...list, resultItem];
  }
  writeStore(store);
  return resultItem;
}

export async function deleteLembaga(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("lembaga").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.lembaga = (store.lembaga || []).filter((l: Lembaga) => l.id !== id);
  writeStore(store);
  return true;
}

// ==================== PROFIL DESA ====================
export async function getProfilDesa(): Promise<ProfilDesa> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("profil").select("*").single();
      if (!error && data) return { visi: data.visi, misi: data.misi };
    } catch (e) {}
  }
  const store = readStore();
  return store.profil || { visi: "", misi: [] };
}

export async function saveProfilDesa(profil: ProfilDesa): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("profil").upsert({ id: 1, visi: profil.visi, misi: profil.misi });
    } catch (e) {}
  }
  const store = readStore();
  store.profil = profil;
  writeStore(store);
  return true;
}

export const getProfilData = getProfilDesa;
export const updateProfilVisiMisi = saveProfilDesa;

// ==================== AGENDA ====================
export async function getAgendaList(): Promise<Agenda[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("agenda").select("*").order("id", { ascending: false });
      if (!error && data) return data as Agenda[];
    } catch (e) {}
  }
  const store = readStore();
  return store.agenda || [];
}

export async function saveAgenda(item: Omit<Agenda, "id"> & { id?: number }): Promise<Agenda> {
  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { data, error } = await supabaseServer.from("agenda").update(item).eq("id", item.id).select().single();
        if (!error && data) return data as Agenda;
      } else {
        const { data, error } = await supabaseServer.from("agenda").insert(item).select().single();
        if (!error && data) return data as Agenda;
      }
    } catch (e) {}
  }
  const store = readStore();
  const list: Agenda[] = store.agenda || [];
  let resultItem: Agenda;

  if (item.id) {
    resultItem = { ...item, id: item.id } as Agenda;
    store.agenda = list.map((a) => (a.id === item.id ? resultItem : a));
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
    resultItem = { ...item, id: newId } as Agenda;
    store.agenda = [resultItem, ...list];
  }
  writeStore(store);
  return resultItem;
}

export async function deleteAgenda(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("agenda").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.agenda = (store.agenda || []).filter((a: Agenda) => a.id !== id);
  writeStore(store);
  return true;
}

// ==================== BUKU TAMU ====================
export async function getBukuTamuList(): Promise<BukuTamu[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("buku_tamu").select("*").order("id", { ascending: false });
      if (!error && data) return data as BukuTamu[];
    } catch (e) {}
  }
  const store = readStore();
  return store.buku_tamu || [];
}

export async function addBukuTamu(item: Omit<BukuTamu, "id">): Promise<BukuTamu> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabaseServer.from("buku_tamu").insert(item).select().single();
      if (!error && data) return data as BukuTamu;
    } catch (e) {}
  }
  const store = readStore();
  const list: BukuTamu[] = store.buku_tamu || [];
  const newId = list.length > 0 ? Math.max(...list.map((b) => b.id)) + 1 : 1;
  const newItem = { ...item, id: newId };
  store.buku_tamu = [newItem, ...list];
  writeStore(store);
  return newItem;
}

export async function deleteBukuTamu(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("buku_tamu").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.buku_tamu = (store.buku_tamu || []).filter((b: BukuTamu) => b.id !== id);
  writeStore(store);
  return true;
}

// ==================== PENGADUAN ====================
export async function getPengaduanList(): Promise<Pengaduan[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("pengaduan").select("*").order("id", { ascending: false });
      if (!error && data) return data as Pengaduan[];
    } catch (e) {}
  }
  const store = readStore();
  return store.pengaduan || [];
}

export async function addPengaduan(item: Omit<Pengaduan, "id" | "status" | "tanggapan">): Promise<Pengaduan> {
  const payload = { ...item, status: "Baru" as const, tanggapan: "" };
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabaseServer.from("pengaduan").insert(payload).select().single();
      if (!error && data) return data as Pengaduan;
    } catch (e) {}
  }
  const store = readStore();
  const list: Pengaduan[] = store.pengaduan || [];
  const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
  const newItem = { ...payload, id: newId };
  store.pengaduan = [newItem, ...list];
  writeStore(store);
  return newItem;
}

export async function updateStatusPengaduan(id: number, status: Pengaduan["status"], tanggapan?: string): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("pengaduan").update({ status, tanggapan }).eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.pengaduan = (store.pengaduan || []).map((p: Pengaduan) => (p.id === id ? { ...p, status, tanggapan } : p));
  writeStore(store);
  return true;
}

export async function deletePengaduan(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("pengaduan").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.pengaduan = (store.pengaduan || []).filter((p: Pengaduan) => p.id !== id);
  writeStore(store);
  return true;
}

// ==================== APBDES ====================
export async function getApbdesRingkasan(): Promise<ApbdesRingkasan> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("apbdes_ringkasan").select("*").single();
      if (!error && data) return data as ApbdesRingkasan;
    } catch (e) {}
  }
  const store = readStore();
  return store.apbdes_ringkasan || { pendapatan: "0", belanja: "0", pembiayaan: "0", tahun: 2026 };
}

export async function updateApbdesRingkasan(ringkasan: ApbdesRingkasan): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("apbdes_ringkasan").upsert({ id: 1, ...ringkasan });
    } catch (e) {}
  }
  const store = readStore();
  store.apbdes_ringkasan = ringkasan;
  writeStore(store);
  return true;
}

export async function getApbdesBidangList(): Promise<ApbdesBidang[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("apbdes_bidang").select("*").order("id", { ascending: true });
      if (!error && data) return data as ApbdesBidang[];
    } catch (e) {}
  }
  const store = readStore();
  return store.apbdes_bidang || [];
}

export async function saveApbdesBidang(item: Omit<ApbdesBidang, "id"> & { id?: number }): Promise<ApbdesBidang> {
  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { data, error } = await supabaseServer.from("apbdes_bidang").update(item).eq("id", item.id).select().single();
        if (!error && data) return data as ApbdesBidang;
      } else {
        const { data, error } = await supabaseServer.from("apbdes_bidang").insert(item).select().single();
        if (!error && data) return data as ApbdesBidang;
      }
    } catch (e) {}
  }
  const store = readStore();
  const list: ApbdesBidang[] = store.apbdes_bidang || [];
  let resultItem: ApbdesBidang;

  if (item.id) {
    resultItem = { ...item, id: item.id } as ApbdesBidang;
    store.apbdes_bidang = list.map((b) => (b.id === item.id ? resultItem : b));
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((b) => b.id)) + 1 : 1;
    resultItem = { ...item, id: newId } as ApbdesBidang;
    store.apbdes_bidang = [...list, resultItem];
  }
  writeStore(store);
  return resultItem;
}

export async function deleteApbdesBidang(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("apbdes_bidang").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.apbdes_bidang = (store.apbdes_bidang || []).filter((b: ApbdesBidang) => b.id !== id);
  writeStore(store);
  return true;
}

// ==================== PRODUK HUKUM ====================
export async function getProdukHukumList(): Promise<ProdukHukum[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("produk_hukum").select("*").order("id", { ascending: false });
      if (!error && data) return data as ProdukHukum[];
    } catch (e) {}
  }
  const store = readStore();
  return store.produk_hukum || [];
}

export async function saveProdukHukum(item: Omit<ProdukHukum, "id"> & { id?: number }): Promise<ProdukHukum> {
  if (!isPlaceholderSupabase) {
    try {
      if (item.id) {
        const { data, error } = await supabaseServer.from("produk_hukum").update(item).eq("id", item.id).select().single();
        if (!error && data) return data as ProdukHukum;
      } else {
        const { data, error } = await supabaseServer.from("produk_hukum").insert(item).select().single();
        if (!error && data) return data as ProdukHukum;
      }
    } catch (e) {}
  }
  const store = readStore();
  const list: ProdukHukum[] = store.produk_hukum || [];
  let resultItem: ProdukHukum;

  if (item.id) {
    resultItem = { ...item, id: item.id } as ProdukHukum;
    store.produk_hukum = list.map((p) => (p.id === item.id ? resultItem : p));
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
    resultItem = { ...item, id: newId } as ProdukHukum;
    store.produk_hukum = [resultItem, ...list];
  }
  writeStore(store);
  return resultItem;
}

export async function deleteProdukHukum(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("produk_hukum").delete().eq("id", id);
    } catch (e) {}
  }
  const store = readStore();
  store.produk_hukum = (store.produk_hukum || []).filter((p: ProdukHukum) => p.id !== id);
  writeStore(store);
  return true;
}

// ==================== STATISTIK KEPENDUDUKAN ====================
export async function getStatistikPenduduk(): Promise<StatistikPenduduk> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("statistik_penduduk").select("*").single();
      if (!error && data) return data as StatistikPenduduk;
    } catch (e) {}
  }
  const store = readStore();
  return store.statistik_penduduk || {
    totalPenduduk: 0,
    totalKk: 0,
    lakiLaki: 0,
    perempuan: 0,
    dusunList: [],
    pekerjaanList: [],
    pendidikanList: [],
  };
}

export async function updateStatistikPenduduk(dataInput: StatistikPenduduk): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      await supabaseServer.from("statistik_penduduk").upsert({ id: 1, ...dataInput });
    } catch (e) {}
  }
  const store = readStore();
  store.statistik_penduduk = dataInput;
  writeStore(store);
  return true;
}
