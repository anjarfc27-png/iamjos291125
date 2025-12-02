import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { StatisticsClient } from "./statistics-client";

export const dynamic = "force-dynamic";

async function getStatistics(journalId?: string) {
  const supabase = getSupabaseAdminClient();

  try {
    // Get submission statistics
    let submissionsQuery = supabase
      .from("submissions")
      .select("id, status, current_stage, submitted_at");

    if (journalId) {
      submissionsQuery = submissionsQuery.eq("journal_id", journalId);
    }

    const { data: submissions } = await submissionsQuery;

    // Calculate statistics
    const stats = {
      totalSubmissions: submissions?.length ?? 0,
      byStatus: {
        published: submissions?.filter((s) => s.status === "published").length ?? 0,
        declined: submissions?.filter((s) => s.status === "declined").length ?? 0,
        accepted: submissions?.filter((s) => s.status === "accepted").length ?? 0,
        inReview: submissions?.filter((s) => s.current_stage === "review").length ?? 0,
      },
      byStage: {
        submission: submissions?.filter((s) => s.current_stage === "submission").length ?? 0,
        review: submissions?.filter((s) => s.current_stage === "review").length ?? 0,
        copyediting: submissions?.filter((s) => s.current_stage === "copyediting").length ?? 0,
        production: submissions?.filter((s) => s.current_stage === "production").length ?? 0,
      },
      averageReviewTime: 0, // TODO: Calculate from review rounds
      averagePublicationTime: 0, // TODO: Calculate from submission to publication
    };

    // Get user statistics
    let usersQuery = supabase
      .from("user_roles")
      .select("user_id, role_path", { count: "exact" });

    if (journalId) {
      usersQuery = usersQuery.eq("context_id", journalId);
    }

    const { count: totalUsers } = await usersQuery;

    // Get role distribution
    const { data: roleData } = await usersQuery;
    const roleDistribution: Record<string, number> = {};
    roleData?.forEach((ur) => {
      const role = ur.role_path as string;
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    return {
      ...stats,
      totalUsers: totalUsers ?? 0,
      roleDistribution,
    };
  } catch (error) {
    console.error("Error loading statistics:", error);
    return {
      totalSubmissions: 0,
      byStatus: {
        published: 0,
        declined: 0,
        accepted: 0,
        inReview: 0,
      },
      byStage: {
        submission: 0,
        review: 0,
        copyediting: 0,
        production: 0,
      },
      averageReviewTime: 0,
      averagePublicationTime: 0,
      totalUsers: 0,
      roleDistribution: {},
    };
  }
}

export default async function ManagerStatisticsPage() {
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

  const statistics = await getStatistics();

  return <StatisticsClient statistics={statistics} />;
}
