"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * PKP Modal Component
 * Matches OJS 3.3 modal styling exactly
 */
type PkpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "default" | "large";
};

export function PkpModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  size = "default",
}: PkpModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn("pkpModalOverlay")}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        className={cn("pkpModal", className)}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.25rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: size === "large" ? "800px" : "600px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className="pkpModal__header"
            style={{
              background: "#f8f9fa",
              borderBottom: "1px solid #e5e5e5",
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#002C40",
            }}
          >
            {title}
          </div>
        )}
        <div
          className="pkpModal__body"
          style={{
            padding: "1.5rem",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="pkpModal__footer"
            style={{
              background: "#ffffff",
              borderTop: "1px solid #e5e5e5",
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
