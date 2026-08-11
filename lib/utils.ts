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

/**
 * Parse a free-form currency string (e.g. "Rp 1.500.000.000", "1500000000")
 * into a plain number. Assumes Indonesian formatting where "." is a
 * thousands separator and "," is a decimal separator.
 */
export function parseCurrencyToNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;

  const cleaned = value.replace(/[^0-9.,-]/g, "");
  if (!cleaned) return 0;

  // Indonesian format: "." = thousands separator, "," = decimal separator
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Compute the realization percentage of an APBDes bidang (realisasi / anggaran),
 * returned as a formatted string with one decimal, e.g. "82.3%".
 */
export function calcRealisasiPct(anggaran: string | number, realisasi: string | number): string {
  const anggaranNum = parseCurrencyToNumber(anggaran);
  const realisasiNum = parseCurrencyToNumber(realisasi);
  if (anggaranNum <= 0) return "0%";
  const pct = (realisasiNum / anggaranNum) * 100;
  return `${pct.toFixed(1)}%`;
}

/**
 * Compute what percentage `count` represents out of the sum of `allCounts`.
 * Used for auto-calculating distribution percentages (e.g. mata pencaharian)
 * instead of requiring manual percentage input.
 */
export function calcSharePct(count: number, allCounts: number[]): number {
  const total = allCounts.reduce((sum, c) => sum + (c || 0), 0);
  if (total <= 0) return 0;
  return Math.round((count / total) * 1000) / 10; // 1 decimal place
}
