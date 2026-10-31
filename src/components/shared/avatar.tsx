"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "B";

  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gold font-semibold text-deep ring-2 ring-gold/60",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={`${name} profile photo`}
          fill
          unoptimized
          sizes="48px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
