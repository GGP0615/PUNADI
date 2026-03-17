import Image from "next/image";

export function PunadiLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/logo-3d.png"
      alt="Punadi"
      width={64}
      height={64}
      className={className}
    />
  );
}
