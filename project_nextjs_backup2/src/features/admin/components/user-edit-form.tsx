"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "../actions/users";

type User = {
    id: string;
    username: string;
    email: string;
    fullName: string;
};

type Props = {
    user: User;
    onCancel: () => void;
    onSuccess: (message: string) => void;
};

export function UserEditForm({ user, onCancel, onSuccess }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await updateUserProfile(formData);
            if (result.success) {
                onSuccess(result.message);
            } else {
                setError(result.message);
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="userId" value={user.id} />

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    defaultValue={user.fullName}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                    type="text"
                    name="username"
                    defaultValue={user.username}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                <input
                    type="password"
                    name="password"
                    placeholder="Leave blank to keep current"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                />
                <p className="mt-1 text-xs text-gray-500">Min 8 characters if changing.</p>
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
