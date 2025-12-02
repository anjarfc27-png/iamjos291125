import { notFound } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getReviewerAssignment } from "@/features/reviewer/data";
import { ReviewDetailClient } from "./review-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUserServer();

  if (!user) {
    notFound();
  }

  // Check if user has reviewer role
  const hasReviewerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "reviewer";
  });

  if (!hasReviewerRole) {
    notFound();
  }

  // Get assignment
  const assignment = await getReviewerAssignment(id, user.id);

  if (!assignment) {
    notFound();
  }

  return <ReviewDetailClient assignment={assignment} userId={user.id} />;
}


