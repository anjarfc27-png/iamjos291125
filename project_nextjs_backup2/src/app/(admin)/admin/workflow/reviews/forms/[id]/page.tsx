import { getReviewFormDetails } from "@/features/reviews/actions/forms";
import { FormBuilder } from "@/features/reviews/components/form-builder";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ReviewFormDetailPage({ params }: Props) {
    const { id } = await params;
    const form = await getReviewFormDetails(id);

    if (!form) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/admin/workflow/reviews/forms" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[#002C40]">{form.title}</h1>
                    <p className="text-gray-500 text-sm mt-1">{form.description}</p>
                </div>
            </div>

            <FormBuilder formId={form.id} elements={form.elements} />
        </div>
    );
}
