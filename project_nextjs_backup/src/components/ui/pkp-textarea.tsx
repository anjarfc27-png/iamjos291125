"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * PKP Textarea Component
 * Matches OJS 3.3 textarea styling exactly
 */
export const PkpTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, style, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn("pkpTextarea", className)}
      style={{
        width: "100%",
        minHeight: "6rem",
        borderRadius: "0.25rem",
        border: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
        color: "rgba(0, 0, 0, 0.84)",
        fontFamily: "inherit",
        lineHeight: "1.5",
        resize: "vertical",
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

PkpTextarea.displayName = "PkpTextarea";


