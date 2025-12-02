"use client";

import { DialogHTMLAttributes, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  widthClassName?: string;
  withCloseButton?: boolean;
  footer?: ReactNode;
  children: ReactNode;
} & DialogHTMLAttributes<HTMLDivElement>;

export function Modal({
  open,
  onClose,
  title,
  description,
  widthClassName = "max-w-3xl",
  withCloseButton = true,
  footer,
  children,
  className,
  ...rest
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (typeof document === "undefined" || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10"
      role="dialog"
      aria-modal="true"
      {...rest}
    >
      <div
        className={cn(
          "flex max-h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl",
          widthClassName,
          className,
        )}
      >
        <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
            )}
          </div>
          {withCloseButton && onClose ? (
            <button
              onClick={onClose}
              className="rounded p-1 text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              aria-label="Tutup modal"
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4">
            <div className="flex justify-end gap-3">{footer}</div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

