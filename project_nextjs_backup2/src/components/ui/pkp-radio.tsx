"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

type PkpRadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

/**
 * PKP Radio Component
 * Matches OJS 3.3 radio button styling exactly
 */
export const PkpRadio = forwardRef<HTMLInputElement, PkpRadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = useId();
    const uniqueId = id ?? autoId;
    return (
      <div className="flex items-center gap-2">
        <input
          id={uniqueId}
          type="radio"
          ref={ref}
          className={cn(
            "h-4 w-4 border-[#e5e5e5] text-[#006798] focus:ring-[#006798]",
            className,
          )}
          style={{
            width: "1rem",
            height: "1rem",
            borderRadius: "50%",
            border: "1px solid #e5e5e5",
            cursor: "pointer",
            accentColor: "#006798",
          }}
          {...props}
        />
        {label && (
          <label
            htmlFor={uniqueId}
            className="text-sm font-medium text-[#002C40] cursor-pointer"
            style={{ fontSize: "0.875rem", color: "#002C40" }}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

PkpRadio.displayName = "PkpRadio";
