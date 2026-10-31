import { Loader2 } from "lucide-react";

// Shown by Next.js while a route is loading (spinner, as the assignment brief asks).
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-deep">
        <Loader2 className="size-9 animate-spin text-forest" strokeWidth={1.6} />
        <span className="font-serif text-2xl italic">Opening the shelf</span>
      </div>
    </div>
  );
}
