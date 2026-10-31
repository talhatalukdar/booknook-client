"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Cover image with a typographic fallback, so a dead image URL never shows a broken icon. */
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
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-cover bg-forest shadow-[0_10px_24px_-10px_rgba(16,55,43,0.55)]",
        className,
      )}
    >
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
        <div className="flex h-full flex-col justify-between border-[6px] border-double border-gold/50 p-3 text-center text-cream">
          <span className="font-serif text-lg font-semibold leading-tight">{title}</span>
          <span className="text-xs text-cream/75">{author}</span>
        </div>
      )}
    </div>
  );
}
