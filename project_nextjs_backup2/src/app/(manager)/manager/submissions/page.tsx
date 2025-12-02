import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import { listSubmissions } from "@/features/editor/data";
import { SubmissionsClient } from "./submissions-client";

export const dynamic = "force-dynamic";

async function getSubmissions() {
  try {
    const submissions = await listSubmissions({
      queue: "all",
      limit: 50,
      offset: 0,
    });

    return submissions;
  } catch (error) {
    console.error("Error loading submissions:", error);
    return [];
  }
}

export default async function ManagerSubmissionsPage() {
  const user = await getCurrentUserServer();

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

  const submissions = await getSubmissions();

  return <SubmissionsClient submissions={submissions} />;
}


