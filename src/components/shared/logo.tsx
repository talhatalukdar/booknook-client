import { BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="BookNook home">
      <span className="grid size-9 place-items-center rounded-[4px] bg-gold text-deep">
        <BookOpen className="size-5" strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          "font-serif text-[1.75rem] font-semibold leading-none tracking-tight",
          tone === "light" ? "text-cream" : "text-deep",
        )}
      >
        BookNook
      </span>
    </Link>
  );
}
