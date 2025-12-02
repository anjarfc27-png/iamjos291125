"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Checkbox = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 cursor-pointer rounded border border-[var(--border)] text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-muted)]",
        className,
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";

