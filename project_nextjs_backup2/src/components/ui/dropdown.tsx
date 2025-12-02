"use client";
import { type ReactNode, useState, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

type DropdownProps = {
  button: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
};

export function Dropdown({ button, children, align = "left", className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {button}
      </button>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-md border border-[var(--border)] bg-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

type DropdownSectionProps = {
  children: ReactNode;
  className?: string;
};

export function DropdownSection({ children, className }: DropdownSectionProps) {
  return <div className={cn("border-b border-[var(--border)] last:border-b-0", className)}>{children}</div>;
}

type DropdownItemProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
};

export function DropdownItem({ children, href, onClick, className, icon }: DropdownItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] cursor-pointer",
        className,
      )}
    >
      {icon}
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}



