import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold tracking-[-0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-forest text-cream hover:bg-deep hover:shadow-[0_8px_18px_-8px_rgba(14,52,39,0.7)]",
        gold: "bg-gold text-deep hover:bg-[#d6b676]",
        outline: "border border-deep/25 bg-transparent text-deep hover:border-deep hover:bg-deep hover:text-cream",
        "outline-light": "border border-cream/40 bg-transparent text-cream hover:bg-cream hover:text-deep",
        light: "bg-cream text-deep hover:bg-white",
        ghost: "text-forest hover:bg-forest/5",
        destructive: "bg-danger text-white hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
