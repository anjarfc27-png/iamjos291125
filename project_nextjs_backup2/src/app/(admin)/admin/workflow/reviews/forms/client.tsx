"use client";

import { useState } from "react";
import { createReviewForm, deleteReviewForm } from "@/features/reviews/actions/forms";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

type Form = {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
};

type Props = {
    forms: Form[];
};

export function ReviewFormsClient({ forms }: Props) {
    const [isCreating, setIsCreating] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this form?")) return;
        await deleteReviewForm(id);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#006798] text-white rounded hover:bg-[#005a87]"
                >
                    <Plus className="h-4 w-4" />
                    Create Review Form
                </button>
            </div>

            {isCreating && (
                <form action={async (formData) => {
                    const result = await createReviewForm(formData);
                    if (result.success) {
                        setIsCreating(false);
                    } else {
                        alert(result.message);
                    }
                }} className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
                    <h3 className="text-lg font-bold mb-4">New Review Form</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-[#006798] text-white rounded">Create</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {forms.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No review forms found.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Title</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Description</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {forms.map((form) => (
                                <tr key={form.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <Link href={`/admin/workflow/reviews/forms/${form.id}`} className="hover:text-[#006798] hover:underline">
                                            {form.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{form.description}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <Link href={`/admin/workflow/reviews/forms/${form.id}`} className="text-gray-400 hover:text-[#006798]">
                                            <Edit2 className="h-4 w-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(form.id)} className="text-gray-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
