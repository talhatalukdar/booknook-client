"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cover with a soft drop shadow and a faint spine highlight (no frame, like the references).
 * Falls back to a typographic cover if the image URL is missing or dead.
 */
export function BookCover({
  src,
  title,
  author,
  sizes = "160px",
  priority,
  className,
}: {
  src?: string;
  title: string;
  author: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative aspect-[2/3] w-full overflow-hidden rounded-cover bg-forest shadow-cover", className)}>
      {src && !failed ? (
        <Image
          src={src}
          alt={`Cover of ${title}`}
          fill
          unoptimized
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_30%_20%,#23634b,#0e3427)] p-[10%] text-center text-cream">
          <span className="mx-auto h-px w-6 bg-gold" />
          <span className="font-serif text-[1.35em] leading-[1.05] [text-wrap:balance]">{title}</span>
          <span className="text-[0.7em] tracking-wide text-cream/70">{author}</span>
        </div>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 via-white/15 to-transparent" />
    </div>
  );
}
