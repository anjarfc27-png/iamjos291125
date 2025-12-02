"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
}

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function TabsList({ children, className, style }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-[var(--surface-muted)] p-1 text-[var(--muted)]",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function TabsTrigger({ value, children, className, style }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "pkp_tab_trigger inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "pkp_tab_active",
        className,
      )}
      style={style}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function TabsContent({ value, children, className, style }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  if (selectedValue !== value) return null;

  return (
    <div
      className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2", className)}
      style={style}
    >
      {children}
    </div>
  );
}
