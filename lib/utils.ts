import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseImagesList(imagesData: any): string[] {
  if (!imagesData) return [];
  if (Array.isArray(imagesData)) {
    return imagesData.map((img) => String(img).trim()).filter(Boolean);
  }
  if (typeof imagesData === "string") {
    const trimmed = imagesData.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((img) => String(img).trim()).filter(Boolean);
        }
      } catch (e) {}
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
