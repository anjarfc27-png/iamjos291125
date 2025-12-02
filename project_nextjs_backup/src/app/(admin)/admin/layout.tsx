"use client";

import type { ReactNode } from "react";

// This layout is just a pass-through since the parent layout already handles the sidebar
type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return <>{children}</>;
}
export const dynamic = "force-dynamic";

