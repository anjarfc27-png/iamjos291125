"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PkpTabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const PkpTabsContext = React.createContext<PkpTabsContextValue | undefined>(undefined);

type PkpTabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * PKP Tabs Component
 * Matches OJS 3.3 tabs styling exactly
 */
export function PkpTabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  style,
}: PkpTabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return (
    <PkpTabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("pkpTabs", className)} style={style}>
        {children}
      </div>
    </PkpTabsContext.Provider>
  );
}

function usePkpTabsContext() {
  const context = React.useContext(PkpTabsContext);
  if (!context) {
    throw new Error("PkpTabs components must be used within PkpTabs");
  }
  return context;
}

type PkpTabsListProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTabsList({ children, className, style }: PkpTabsListProps) {
  return (
    <div
      className={cn("pkpTabsList", className)}
      style={{
        borderBottom: "2px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "0 1.5rem",
        display: "flex",
        listStyle: "none",
        margin: 0,
        background: "transparent",
        alignItems: "flex-end",
        gap: "0.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type PkpTabsTriggerProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTabsTrigger({ value, children, className, style }: PkpTabsTriggerProps) {
  const { value: selectedValue, onValueChange } = usePkpTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "pkp_tab_trigger",
        isActive && "pkp_tab_active",
        className
      )}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 1rem",
        lineHeight: "3rem",
        height: "3rem",
        fontSize: "0.875rem",
        fontWeight: 700,
        textDecoration: "none",
        color: isActive ? "rgba(0, 0, 0, 0.84)" : "#006798",
        backgroundColor: isActive ? "#ffffff" : "transparent",
        border: "none",
        borderTop: "none",
        borderRight: "none",
        borderBottom: isActive ? "2px solid #006798" : "2px solid transparent",
        borderLeft: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        whiteSpace: "nowrap",
        ...style,
      }}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
    >
      {children}
    </button>
  );
}

type PkpTabsContentProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTabsContent({ value, children, className, style }: PkpTabsContentProps) {
  const { value: selectedValue } = usePkpTabsContext();
  if (selectedValue !== value) return null;

  return (
    <div
      className={cn("pkpTabsContent", className)}
      style={{
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}


