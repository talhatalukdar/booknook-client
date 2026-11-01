import { Loader2 } from "lucide-react";

// Shown by Next.js while a route is loading (spinner, as the assignment brief asks).
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-night">
        <Loader2 className="size-9 animate-spin text-primary" strokeWidth={1.6} />
        <span className="font-display text-2xl ">Opening the shelf</span>
      </div>
    </div>
  );
}
