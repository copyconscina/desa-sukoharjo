import { Berita } from "./data";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "http://localhost:3000";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

const buildApiUrl = (path: string) => {
  const base = getApiBaseUrl();
  return base ? `${base}${path}` : path;
};

const parseJsonResponse = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export async function fetchBeritaList(): Promise<Berita[]> {
  const res = await fetch(buildApiUrl("/api/berita"), {
    cache: "no-store",
    credentials: "include",
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data?.error || `Failed to fetch berita list (${res.status})`);
  }

  return data as Berita[];
}

export async function addBeritaApi(tag: string, title: string, desc: string, images?: string) {
  const res = await fetch(buildApiUrl("/api/berita"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ tag, title, desc, images }),
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data?.error || `Failed to add berita (${res.status})`);
  }

  return data as { success: true; item: Berita };
}

export async function deleteBeritaApi(id: number) {
  const url = buildApiUrl(`/api/berita?id=${id}`);
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data?.error || `Failed to delete berita (${res.status})`);
  }

  return data as { success: true };
}
