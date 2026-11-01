import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Official BookNook mark (traced from the supplied logo) plus the Khand wordmark. */
export function LogoMark({ tone = "dark", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Image
      src={tone === "light" ? "/brand/logo-light.svg" : "/brand/logo.svg"}
      alt=""
      width={964}
      height={798}
      unoptimized
      className={cn("h-8 w-auto", className)}
    />
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="BookNook home">
      <LogoMark tone={tone} />
      <span className={cn("font-display text-[1.9rem] font-semibold leading-none tracking-[0.01em]", tone === "light" ? "text-canvas" : "text-night")}>
        BookNook
      </span>
    </Link>
  );
}
