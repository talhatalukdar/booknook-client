import { cn } from "@/lib/utils";

/** Real availability from MongoDB: available > 1, limited (exactly 1) or not available (0). */
export function AvailabilityBadge({ available, total, className }: { available: number; total?: number; className?: string }) {
  const state =
    available <= 0
      ? { label: "Not Available", dot: "bg-danger", text: "text-danger" }
      : available === 1
        ? { label: "Limited availability: 1 copy", dot: "bg-gold", text: "text-[#7a5d1d]" }
        : { label: `Available: ${available} copies`, dot: "bg-success", text: "text-success" };
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-semibold", state.text, className)}>
      <span aria-hidden className={cn("size-2 rounded-full", state.dot)} />
      {state.label}
      {total !== undefined && <span className="font-normal text-muted">of {total}</span>}
    </span>
  );
}
