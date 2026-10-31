"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";

export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function PasswordInput(props, ref) {
    const [show, setShow] = React.useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={show ? "text" : "password"} className="pr-11" {...props} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-muted hover:text-forest"
        >
          {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
        </button>
      </div>
    );
  },
);
