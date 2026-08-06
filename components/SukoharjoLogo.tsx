import Image from "next/image";

type SukoharjoLogoProps = {
  className?: string;
};

export default function SukoharjoLogo({ className }: SukoharjoLogoProps) {
  return (
    <Image
      className={className}
      src="/logo-sukoharjo.webp"
      alt="Logo Kabupaten Wonogiri"
      width={474}
      height={591}
      priority={false}
    />
  );
}