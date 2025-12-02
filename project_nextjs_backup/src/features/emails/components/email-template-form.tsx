"use client";

import { useState, useTransition } from "react";
import { updateEmailTemplate } from "../actions";

type Template = {
    id: string;
    key: string;
    subject: string;
    body: string;
    description: string;
};

type Props = {
    template: Template;
    onCancel: () => void;
    onSuccess: (message: string) => void;
};

export function EmailTemplateForm({ template, onCancel, onSuccess }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await updateEmailTemplate(formData);
            if (result.success) {
                onSuccess(result.message);
            } else {
                setError(result.message);
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="templateId" value={template.id} />

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4">
                <strong>Key:</strong> {template.key}<br />
                <span className="text-xs">{template.description}</span>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                    type="text"
                    name="subject"
                    defaultValue={template.subject}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Body</label>
                <textarea
                    name="body"
                    defaultValue={template.body}
                    required
                    rows={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Available variables: {'{$authorName}'}, {'{$submissionTitle}'}, {'{$contextName}'}, etc.
                </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#006798] rounded-md hover:bg-[#005a87] disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
