import { cn } from "@/lib/utils";

/** Real availability from MongoDB: available (>1), limited (exactly 1) or unavailable (0). */
export function availabilityState(available: number) {
  if (available <= 0) return { key: "none", label: "Not Available", dot: "bg-danger", text: "text-danger" } as const;
  if (available === 1) return { key: "low", label: "Limited: 1 copy", dot: "bg-teal", text: "text-brand" } as const;
  return { key: "ok", label: `${available} copies available`, dot: "bg-success", text: "text-success" } as const;
}

export function AvailabilityBadge({ available, total, className }: { available: number; total?: number; className?: string }) {
  const s = availabilityState(available);
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-semibold", s.text, className)}>
      <span aria-hidden className={cn("size-2 rounded-full", s.dot)} />
      {s.label}
      {total !== undefined && <span className="font-normal text-muted">of {total}</span>}
    </span>
  );
}
