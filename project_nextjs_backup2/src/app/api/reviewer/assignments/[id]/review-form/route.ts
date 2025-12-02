import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getReviewerAssignment } from "@/features/reviewer/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUserServer();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify assignment belongs to user
    const assignment = await getReviewerAssignment(id, user.id);
    if (!assignment) {
      return NextResponse.json({ ok: false, error: "Assignment not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdminClient();

    // Check if assignment has review_form_id
    const { data: reviewData } = await supabase
      .from("submission_reviews")
      .select("review_form_id, metadata")
      .eq("id", id)
      .single();

    if (!reviewData?.review_form_id) {
      return NextResponse.json({
        ok: true,
        reviewForm: null,
      });
    }

    // Fetch review form and questions
    const { data: reviewForm } = await supabase
      .from("review_forms")
      .select("id, title, description")
      .eq("id", reviewData.review_form_id)
      .single();

    if (!reviewForm) {
      return NextResponse.json({
        ok: true,
        reviewForm: null,
      });
    }

    // Fetch review form elements (questions)
    const { data: elements } = await supabase
      .from("review_form_elements")
      .select("id, element_type, required, included, seq, review_form_element_settings(question, possible_responses)")
      .eq("review_form_id", reviewForm.id)
      .eq("included", true)
      .order("seq", { ascending: true });

    // Map elements to questions
    const questions = (elements || []).map((element: any) => {
      const settings = element.review_form_element_settings || [];
      const question = settings.find((s: any) => s.setting_name === "question")?.setting_value || "";
      const responses = settings.find((s: any) => s.setting_name === "possibleResponses")?.setting_value || [];

      return {
        id: element.id,
        question,
        type: element.element_type === 1 ? "text" : element.element_type === 2 ? "textarea" : element.element_type === 3 ? "radio" : "checkbox",
        required: element.required === 1,
        options: responses ? responses.split("\n").filter(Boolean) : undefined,
        value: null,
      };
    });

    return NextResponse.json({
      ok: true,
      reviewForm: {
        id: reviewForm.id,
        title: reviewForm.title,
        description: reviewForm.description,
        questions,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/reviewer/assignments/[id]/review-form:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch review form",
      },
      { status: 500 }
    );
  }
}


