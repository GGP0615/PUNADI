import Image from "next/image";

export function PunadiLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <Image
      src="/logo-3d.png"
      alt="Punadi"
      width={128}
      height={128}
      className={className}
      priority
    />
  );
}
