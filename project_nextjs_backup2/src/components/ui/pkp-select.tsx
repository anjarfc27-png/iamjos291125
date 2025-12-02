"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * PKP Select Component
 * Matches OJS 3.3 select dropdown styling exactly
 */
export const PkpSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, style, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn("pkpSelect", className)}
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
        cursor: "pointer",
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
    >
      {children}
    </select>
  );
});

PkpSelect.displayName = "PkpSelect";
