import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-field border border-line bg-paper px-3.5 text-sm text-ink placeholder:text-muted/70 focus-visible:border-night focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/30 disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-sm font-semibold text-night", className)} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-field border border-line bg-paper px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus-visible:border-night focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/30 aria-invalid:border-danger aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-field border border-line bg-paper px-3 text-sm text-ink focus-visible:border-night focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/30 aria-invalid:border-danger aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}
