"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * PKP Checkbox Component
 * Matches OJS 3.3 checkbox styling exactly
 */
export const PkpCheckbox = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, style, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn("pkpCheckbox", className)}
      style={{
        width: "1rem",
        height: "1rem",
        borderRadius: "0.25rem",
        border: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#006798";
        e.currentTarget.style.outline = "none";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e5e5e5";
      }}
      {...props}
    />
  );
});

PkpCheckbox.displayName = "PkpCheckbox";


