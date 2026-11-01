import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold tracking-[-0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-canvas shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:bg-night hover:shadow-[0_10px_20px_-10px_rgba(26,28,27,0.8)]",
        teal: "bg-teal text-night hover:bg-[#9cc0c6]",
        outline: "border border-night/20 bg-transparent text-night hover:border-night hover:bg-night hover:text-canvas",
        "outline-light": "border border-canvas/35 bg-transparent text-canvas hover:bg-canvas hover:text-night",
        light: "bg-canvas text-night hover:bg-white",
        ghost: "text-night hover:bg-night/5",
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
