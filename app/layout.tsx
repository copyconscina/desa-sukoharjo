import { Fraunces, Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { defaultOgImage, siteName, siteUrl } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Desa Sukoharjo | Tirtomoyo, Wonogiri" },
  description: "Website resmi Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri. Informasi layanan, berita, potensi desa, dan UMKM warga.",
  applicationName: siteName,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName,
    title: "Desa Sukoharjo | Tirtomoyo, Wonogiri",
    description: "Informasi layanan, berita, potensi desa, dan UMKM warga Desa Sukoharjo.",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "Pemandangan Desa Sukoharjo" }],
  },
  twitter: { card: "summary_large_image", title: "Desa Sukoharjo | Tirtomoyo, Wonogiri", description: "Informasi layanan, berita, potensi desa, dan UMKM warga Desa Sukoharjo.", images: [defaultOgImage] },
  robots: { index: true, follow: true },
};

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-next",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body-next",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-next",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        fraunces.variable,
        publicSans.variable,
        jetbrainsMono.variable
      )}
    >
      <body>{children}</body>
    </html>
  );
}
