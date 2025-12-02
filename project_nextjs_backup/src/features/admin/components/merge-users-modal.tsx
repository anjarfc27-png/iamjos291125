"use client";

import { useState, useTransition } from "react";
import { mergeUsers } from "../actions/users";

type User = {
    id: string;
    username: string;
    email: string;
    fullName: string;
};

type Props = {
    sourceUser: User;
    allUsers: User[]; // List of potential targets
    onCancel: () => void;
    onSuccess: (message: string) => void;
};

export function MergeUsersModal({ sourceUser, allUsers, onCancel, onSuccess }: Props) {
    const [targetUserId, setTargetUserId] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Filter out source user from targets
    const availableTargets = allUsers.filter(u => u.id !== sourceUser.id);

    const handleMerge = () => {
        if (!targetUserId) {
            setError("Please select a target user.");
            return;
        }

        if (!confirm(`Are you sure you want to merge ${sourceUser.username} into the selected user? This action CANNOT be undone and ${sourceUser.username} will be deleted.`)) {
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await mergeUsers(sourceUser.id, targetUserId);
            if (result.success) {
                onSuccess(result.message);
            } else {
                setError(result.message);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Merging users will transfer all submissions, reviews, and editorial assignments from <strong>{sourceUser.username}</strong> to the target user. <strong>{sourceUser.username}</strong> will then be deleted.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Merge into:</label>
                <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#006798] focus:ring-[#006798] sm:text-sm p-2 border"
                >
                    <option value="">-- Select User --</option>
                    {availableTargets.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.fullName} ({user.username})
                        </option>
                    ))}
                </select>
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
                    type="button"
                    onClick={handleMerge}
                    disabled={isPending || !targetUserId}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                    {isPending ? "Merging..." : "Merge Users"}
                </button>
            </div>
        </div>
    );
}
