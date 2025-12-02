import { notFound, redirect } from "next/navigation";
import { getSubmissionDetail } from "@/features/editor/data";
import { getCurrentUserServer } from "@/lib/auth-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthorSubmissionDetailClient } from "./author-submission-detail-client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AuthorSubmissionDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolved = await searchParams;
  const tabParam = resolved.tab as string | undefined;
  const stageParam = resolved.stage as string | undefined;

  // Get current user
  const user = await getCurrentUserServer();
  if (!user) {
    redirect('/login');
  }

  // Fetch submission detail
  const detail = await getSubmissionDetail(id);

  if (!detail) {
    notFound();
  }

  // Check if user is the author of this submission
  const supabase = await createSupabaseServerClient();

  // Check if user is a participant with role 'author'
  const { data: participant } = await supabase
    .from('submission_participants')
    .select('user_id')
    .eq('submission_id', id)
    .eq('user_id', user.id)
    .eq('role', 'author')
    .maybeSingle();

  if (!participant) {
    // Fallback: Check if user is the one who created the submission (if we can track that)
    // Or check if they are an admin/editor who can view it (but this is author page)
    // For now, strict check on participant role 'author'
    notFound();
  }

  // Extract author name from metadata
  const authorName =
    (detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]
      ? `${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.givenName ?? ""} ${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.familyName ?? ""}`.trim() || "—"
      : "—";

  return (
    <AuthorSubmissionDetailClient
      submissionId={id}
      submission={detail.summary}
      detail={detail}
      authorName={authorName}
      initialTab={tabParam || undefined}
      initialStage={stageParam || undefined}
    />
  );
}

