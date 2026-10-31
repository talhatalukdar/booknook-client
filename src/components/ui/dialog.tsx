"use client";

import { X } from "lucide-react";
import { Dialog as Primitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogTitle = ({ className, ...p }: React.ComponentProps<typeof Primitive.Title>) => (
  <Primitive.Title className={cn("font-serif text-3xl font-semibold text-deep", className)} {...p} />
);
export const DialogDescription = ({ className, ...p }: React.ComponentProps<typeof Primitive.Description>) => (
  <Primitive.Description className={cn("mt-1 text-muted", className)} {...p} />
);

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-deep/60" />
      <Primitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[4px] bg-cream p-6 shadow-2xl sm:p-8",
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          aria-label="Close"
          className="absolute right-3 top-3 grid size-9 cursor-pointer place-items-center rounded-control text-muted hover:bg-forest/10 hover:text-forest"
        >
          <X className="size-5" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
