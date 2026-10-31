import { BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="BookNook home">
      <span className={cn("grid size-9 place-items-center rounded-full", tone === "light" ? "bg-gold text-deep" : "bg-forest text-cream")}>
        <BookOpen className="size-[1.15rem]" strokeWidth={2} />
      </span>
      <span className={cn("font-serif text-[2rem] leading-none tracking-[-0.02em]", tone === "light" ? "text-cream" : "text-deep")}>
        Book<em className={cn("pr-0.5", tone === "light" ? "!text-gold" : "!text-forest")}>Nook</em>
      </span>
    </Link>
  );
}
