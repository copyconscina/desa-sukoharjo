import { supabase, isPlaceholderSupabase } from "./supabase";
import { supabaseServer } from "./supabase-server";
import { Umkm, Berita, GaleriItem, Potensi } from "./data";
import dbJson from "./db.json";

// UMKM DB Operations
export async function getUmkmList(): Promise<Umkm[]> {
  if (isPlaceholderSupabase) {
    return dbJson.umkmData as Umkm[];
  }
  const { data, error } = await supabase
    .from("umkm")
    .select("*")
    .order("id", { ascending: true });
    
  if (error) {
    console.warn("Using fallback UMKM list due to connection error:", error.message);
    return dbJson.umkmData as Umkm[];
  }
  return data as Umkm[];
}

export async function getUmkmById(id: number): Promise<Umkm | undefined> {
  if (isPlaceholderSupabase) {
    return (dbJson.umkmData.find((u) => u.id === id) || dbJson.umkmData[0]) as Umkm;
  }
  const { data, error } = await supabase
    .from("umkm")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.warn(`Using fallback UMKM for id ${id}`);
    return dbJson.umkmData.find((u) => u.id === id) as Umkm | undefined;
  }
  return data as Umkm;
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

  if (item.id) {
    const { data, error } = await supabaseServer
      .from("umkm")
      .update(payload)
      .eq("id", item.id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Umkm;
  } else {
    const { data, error } = await supabaseServer
      .from("umkm")
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data as Umkm;
  }
}

export async function deleteUmkm(id: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from("umkm")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting UMKM ${id}:`, error);
    return false;
  }
  return true;
}

// Berita DB Operations
export async function getBeritaList(): Promise<Berita[]> {
  if (isPlaceholderSupabase) {
    return dbJson.beritaData.map((b, idx) => ({
      id: idx + 1,
      tag: b.tag,
      cls: b.cls || "",
      title: b.title,
      desc: b.desc || "",
      date: b.date,
      images: undefined,
    })) as Berita[];
  }

  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("Using fallback Berita list due to connection error:", error.message);
    return dbJson.beritaData.map((b, idx) => ({
      id: idx + 1,
      tag: b.tag,
      cls: b.cls || "",
      title: b.title,
      desc: b.desc || "",
      date: b.date,
      images: undefined,
    })) as Berita[];
  }

  return data.map((b) => ({
    id: b.id,
    tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "",
    cls: b.cls || "",
    title: b.title,
    desc: b.desc || "",
    date: new Date(b.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    images: b.images || null,
  })) as Berita[];
}

export async function getBeritaById(id: number): Promise<Berita | undefined> {
  if (isPlaceholderSupabase) {
    const list = dbJson.beritaData.map((b, idx) => ({
      id: idx + 1,
      tag: b.tag,
      cls: b.cls || "",
      title: b.title,
      desc: b.desc || "",
      date: b.date,
      images: undefined,
    }));
    return list.find((b) => b.id === id) || list[0];
  }

  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.warn(`Using fallback Berita for id ${id}`);
    return undefined;
  }

  return {
    id: data.id,
    tag: data.tag ? data.tag.charAt(0).toUpperCase() + data.tag.slice(1) : "",
    cls: data.cls || "",
    title: data.title,
    desc: data.desc || "",
    date: new Date(data.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    images: data.images || undefined,
  } as Berita;
}

export async function addBerita(item: Omit<Berita, "date"> & { date?: string }): Promise<Berita> {
  const { data, error } = await supabaseServer
    .from("berita")
    .insert({
      tag: item.tag.toLowerCase(),
      cls: item.cls || "",
      title: item.title,
      desc: item.desc,
      published_at: new Date().toISOString(),
      images: item.images || null,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    tag: data.tag ? data.tag.charAt(0).toUpperCase() + data.tag.slice(1) : "",
    cls: data.cls || "",
    title: data.title,
    desc: data.desc || "",
    date: new Date(data.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    images: data.images || undefined,
  };
}

export async function deleteBeritaById(id: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from("berita")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting Berita with id ${id}:`, error);
    return false;
  }
  return true;
}

export async function deleteBerita(id: number): Promise<boolean> {
  return deleteBeritaById(id);
}


// Galeri DB Operations
export async function getGaleriList(): Promise<GaleriItem[]> {
  if (isPlaceholderSupabase) {
    return dbJson.galeriData.map((g, idx) => ({
      id: idx + 1,
      label: g.label,
      cat: g.cat,
      grad: g.grad || "",
      image: undefined,
      desc: "",
    })) as GaleriItem[];
  }

  const { data, error } = await supabase
    .from("galeri")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Using fallback Galeri list due to connection error:", error.message);
    return dbJson.galeriData.map((g, idx) => ({
      id: idx + 1,
      label: g.label,
      cat: g.cat,
      grad: g.grad || "",
      image: undefined,
      desc: "",
    })) as GaleriItem[];
  }

  return data.map((g) => ({
    id: g.id,
    label: g.label,
    cat: g.cat,
    grad: g.grad || "",
    image: g.image || null,
    desc: g.desc || "",
  })) as GaleriItem[];
}

export async function addGaleri(item: GaleriItem): Promise<GaleriItem> {
  const { data, error } = await supabaseServer
    .from("galeri")
    .insert({
      label: item.label,
      cat: item.cat,
      grad: item.grad || "",
      image: item.image || null,
      desc: item.desc || null,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    label: data.label,
    cat: data.cat,
    grad: data.grad || "",
    image: data.image || null,
    desc: data.desc || "",
  } as GaleriItem;
}

export async function deleteGaleriById(id: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from("galeri")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting Galeri with id ${id}:`, error);
    return false;
  }
  return true;
}

export async function deleteGaleri(id: number): Promise<boolean> {
  return deleteGaleriById(id);
}

// Potensi DB Operations
export async function getPotensiList(): Promise<Potensi[]> {
  if (isPlaceholderSupabase) {
    return dbJson.potensiData as Potensi[];
  }

  const { data, error } = await supabase
    .from("potensi")
    .select("*")
    .order("num", { ascending: true });

  if (error) {
    console.warn("Using fallback Potensi list due to connection error:", error.message);
    return dbJson.potensiData as Potensi[];
  }
  return data as Potensi[];
}

export async function updatePotensi(num: string, title: string, desc: string): Promise<boolean> {
  const { error } = await supabaseServer
    .from("potensi")
    .update({ title, desc, updated_at: new Date().toISOString() })
    .eq("num", num);

  if (error) {
    console.error(`Error updating Potensi ${num}:`, error);
    return false;
  }
  return true;
}

