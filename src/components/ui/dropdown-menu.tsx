"use client";

import { DropdownMenu as Primitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 10,
  ...props
}: React.ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        align="end"
        className={cn(
          "z-50 min-w-60 overflow-hidden rounded-lg border border-line bg-paper p-1 text-ink shadow-[0_16px_36px_-14px_rgba(26,28,27,0.28),0_2px_6px_rgba(26,28,27,0.06)]",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium outline-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof Primitive.Label>) {
  return <Primitive.Label className={cn("px-3 pb-2.5 pt-2", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn("my-1 h-px bg-line", className)} {...props} />;
}
