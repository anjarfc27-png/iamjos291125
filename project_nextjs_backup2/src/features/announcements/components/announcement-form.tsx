"use client";

import { useState, useTransition } from "react";
import { createAnnouncement } from "../actions";

type Props = {
    onCancel: () => void;
    onSuccess: (message: string) => void;
};

export function AnnouncementForm({ onCancel, onSuccess }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await createAnnouncement(formData);
            if (result.success) {
                onSuccess(result.message);
            } else {
                setError(result.message);
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea
                    name="shortDescription"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Full Description</label>
                <textarea
                    name="description"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                <input
                    type="date"
                    name="dateExpire"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
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
                    {isPending ? "Saving..." : "Create Announcement"}
                </button>
            </div>
        </form>
    );
}
