"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { TopBar } from "@/components/admin/top-bar";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectPathByRole } from "@/lib/auth-redirect";

type Props = {
  children: ReactNode;
};

// Layout khusus untuk submission detail - full screen tanpa sidebar
export default function SubmissionDetailLayout({ children }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const canEdit = useMemo(
    () => user?.roles?.some(r => r.role_path === "editor" || r.role_path === "admin") ?? false,
    [user]
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?source=/editor");
      return;
    }
    if (!canEdit) {
      const redirectPath = getRedirectPathByRole(user);
      router.replace(redirectPath);
    }
  }, [user, canEdit, loading, router]);

  if (loading) {
    return <div className="min-h-screen bg-[var(--surface-muted)]" />;
  }

  if (!user || !canEdit) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[var(--surface-muted)]">
      <TopBar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export const dynamic = "force-dynamic";

