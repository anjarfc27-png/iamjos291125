"use server";

import { revalidatePath } from "next/cache";
import { requireSiteAdmin } from "@/lib/permissions";

type Result = { ok: true };

export async function clearDataCachesAction(): Promise<Result> {
  await requireSiteAdmin();
  const paths = [
    "/admin/dashboard",
    "/admin/site-management",
    "/admin/site-management/hosted-journals",
    "/admin/site-settings/site-setup",
    "/admin/system/system-information",
    "/admin/system/expire-sessions",
    "/admin/system/clear-data-caches",
    "/admin/system/clear-template-cache",
    "/admin/system/clear-scheduled-tasks",
  ];
  for (const p of paths) revalidatePath(p);
  return { ok: true };
}