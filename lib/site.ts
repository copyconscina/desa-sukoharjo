const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
const fallbackSiteUrl = process.env.NODE_ENV === "production" ? "https://desa-sukoharjo.vercel.app" : "http://localhost:3000";

/** The public canonical URL. Set NEXT_PUBLIC_SITE_URL to the production domain in Vercel. */
export const siteUrl = configuredSiteUrl ?? (vercelUrl ? `https://${vercelUrl}` : fallbackSiteUrl);
export const siteName = "Desa Sukoharjo";
export const defaultOgImage = "/sukoharjo-senja.png";
