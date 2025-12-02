"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * PKP Input Component
 * Matches OJS 3.3 input field styling exactly
 */
export const PkpInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, style, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn("pkpInput", className)}
      style={{
        width: "100%",
        height: "2.5rem",
        borderRadius: "0.25rem",
        border: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
        color: "rgba(0, 0, 0, 0.84)",
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

PkpInput.displayName = "PkpInput";


