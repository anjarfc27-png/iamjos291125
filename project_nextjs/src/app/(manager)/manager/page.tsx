import { redirect } from "next/navigation";

import { getCurrentUserServer } from "@/lib/auth-server";
import { ManagerDashboardSubmissionsClient } from "./dashboard-submissions-client";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage({
  searchParams,
}: {
  searchParams: { journal?: string };
}) {
  const user = await getCurrentUserServer();
  const journalId = searchParams.journal;

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  // Parity dengan OJS 3.3 dashboard/index.tpl: halaman utama Manager menampilkan
  // tab Submissions (My Queue, Unassigned, Active, Archives) dengan tema IAMJOS
  // yang sudah disediakan layout manager.
  return <ManagerDashboardSubmissionsClient journalId={journalId} />;
}
