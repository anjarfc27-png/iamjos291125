"use client";

import { forwardRef } from "react";
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "onclick" | "warnable" | "link";
type Size = "default" | "sm";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
  disabled?: boolean;
};

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AnchorProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type PkpButtonProps = ButtonProps | AnchorProps;

type CloneableChildProps = {
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
};

/**
 * PKP Button Component
 * Matches OJS 3.3 button styling exactly
 * Variants:
 * - primary: pkpButton--isPrimary (Blue button #006798)
 * - onclick: pkpButton--isOnclick (Outline button)
 * - warnable: pkpButton--isWarnable (Warning button)
 * - link: pkpButton--isLink (Link style button)
 */
export const PkpButton = forwardRef<HTMLButtonElement, PkpButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      asChild = false,
      href,
      ...props
    },
    ref,
  ) => {
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.25rem",
      height: size === "sm" ? "1.875rem" : "2.25rem",
      paddingLeft: size === "sm" ? "0.75rem" : "1rem",
      paddingRight: size === "sm" ? "0.75rem" : "1rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      border: "1px solid",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textDecoration: "none",
    };

    const variantStyles: Record<Variant, React.CSSProperties> = {
      primary: {
        borderColor: "#006798",
        backgroundColor: "#006798",
        color: "#ffffff",
      },
      onclick: {
        borderColor: "#e5e5e5",
        backgroundColor: "transparent",
        color: "#002C40",
      },
      warnable: {
        borderColor: "#dc3545",
        backgroundColor: "#dc3545",
        color: "#ffffff",
      },
      link: {
        borderColor: "transparent",
        backgroundColor: "transparent",
        color: "#006798",
        textDecoration: "underline",
      },
    };

    const hoverStyles: Record<Variant, Partial<React.CSSProperties>> = {
      primary: {
        backgroundColor: "#005a82",
        borderColor: "#005a82",
      },
      onclick: {
        backgroundColor: "#f8f9fa",
        borderColor: "#d0d0d0",
      },
      warnable: {
        backgroundColor: "#c82333",
        borderColor: "#c82333",
      },
      link: {
        color: "#005a82",
        textDecoration: "underline",
      },
    };

    const buttonStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...(disabled || loading
        ? {
            opacity: 0.6,
            cursor: "not-allowed",
          }
        : {}),
    };

    const handleMouseEnter: React.MouseEventHandler<HTMLElement> = (e) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, hoverStyles[variant]);
      }
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLElement> = (e) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, variantStyles[variant]);
      }
    };

    const spinner = (
      <span
        style={{
          marginRight: "0.5rem",
          width: "0.875rem",
          height: "0.875rem",
          border: "2px solid rgba(255, 255, 255, 0.6)",
          borderTopColor: "currentColor",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.6s linear infinite",
        }}
      />
    );

    if (asChild) {
      if (React.isValidElement(children)) {
        const child = children as React.ReactElement<CloneableChildProps>;
        return React.cloneElement(child, {
          className: cn(
            "pkpButton",
            `pkpButton--is${
              variant === "primary"
                ? "Primary"
                : variant === "onclick"
                ? "Onclick"
                : variant === "warnable"
                ? "Warnable"
                : "Link"
            }`,
            className,
          ),
          style: { ...buttonStyles, ...(child.props?.style || {}) },
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        });
      }
      return null;
    }

    if ("href" in props && props.href) {
      const {
        href,
        className: _ignoredClassName,
        children: _ignoredChildren,
        variant: _ignoredVariant,
        size: _ignoredSize,
        loading: _ignoredLoading,
        disabled: _ignoredDisabled,
        asChild: _ignoredAsChild,
        ...linkProps
      } = props as AnchorProps;
      return (
        <Link
          href={href}
          className={cn("pkpButton", `pkpButton--is${variant === "primary" ? "Primary" : variant === "onclick" ? "Onclick" : variant === "warnable" ? "Warnable" : "Link"}`, className)}
          style={buttonStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...linkProps}
        >
          {loading && spinner}
          {children}
        </Link>
      );
    }

    const {
      className: _ignoredClassName,
      children: _ignoredChildren,
      variant: _ignoredVariant,
      size: _ignoredSize,
      loading: _ignoredLoading,
      disabled: _ignoredDisabled,
      asChild: _ignoredAsChild,
      ...buttonProps
    } = props as ButtonProps;

    return (
      <button
        ref={ref}
        className={cn("pkpButton", `pkpButton--is${variant === "primary" ? "Primary" : variant === "onclick" ? "Onclick" : variant === "warnable" ? "Warnable" : "Link"}`, className)}
        style={buttonStyles}
        disabled={disabled ?? loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...buttonProps}
      >
        {loading && spinner}
        {children}
      </button>
    );
  },
);

PkpButton.displayName = "PkpButton";

