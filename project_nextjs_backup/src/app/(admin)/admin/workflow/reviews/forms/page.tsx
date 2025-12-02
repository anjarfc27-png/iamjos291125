import { getReviewForms, createReviewForm, deleteReviewForm } from "@/features/reviews/actions/forms";
import { ReviewFormsClient } from "./client";

export default async function ReviewFormsPage() {
    const forms = await getReviewForms();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#002C40]">Review Forms</h1>
                    <p className="text-gray-500 text-sm mt-1">Create custom review forms for reviewers.</p>
                </div>
            </div>

            <ReviewFormsClient forms={forms} />
        </div>
    );
}
