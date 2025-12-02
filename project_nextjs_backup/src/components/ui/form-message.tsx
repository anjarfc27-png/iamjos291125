"use client";

import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLParagraphElement> & {
  tone?: "default" | "error" | "success" | "muted";
};

export function FormMessage({
  className,
  children,
  tone = "default",
  ...props
}: Props) {
  const toneStyles: Record<typeof tone, string> = {
    default: "text-[var(--foreground)]",
    error: "text-[#b91c1c]",
    success: "text-[#0f766e]",
    muted: "text-[var(--muted)]",
  };

  return (
    <p
      className={cn("text-sm leading-relaxed", toneStyles[tone], className)}
      {...props}
    >
      {children}
    </p>
  );
}

