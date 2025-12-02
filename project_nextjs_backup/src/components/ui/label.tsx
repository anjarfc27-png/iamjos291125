"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "mb-2 block text-sm font-semibold text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
});

Label.displayName = "Label";

