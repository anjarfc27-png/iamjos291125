"use client";

import { useState } from "react";
import { deleteAnnouncement } from "../actions";
import { AnnouncementForm } from "./announcement-form";
import { Plus, Trash2, Calendar } from "lucide-react";

type Announcement = {
    id: string;
    title: string;
    shortDescription?: string;
    description?: string;
    datePosted: string;
    dateExpire?: string | null;
};

type Props = {
    announcements: Announcement[];
};

export function AnnouncementList({ announcements }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        setDeletingId(id);
        await deleteAnnouncement(id);
        setDeletingId(null);
    };

    if (isCreating) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-bold mb-4">Create Announcement</h3>
                <AnnouncementForm
                    onCancel={() => setIsCreating(false)}
                    onSuccess={() => setIsCreating(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#006798] text-white rounded hover:bg-[#005a87]"
                >
                    <Plus className="h-4 w-4" />
                    Create Announcement
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {announcements.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No announcements found.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Title</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Date Posted</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Expiry</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {announcements.map((announcement) => (
                                <tr key={announcement.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{announcement.title}</div>
                                        {announcement.shortDescription && (
                                            <div className="text-gray-500 text-xs mt-1 truncate max-w-md">
                                                {announcement.shortDescription}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(announcement.datePosted).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {announcement.dateExpire ? new Date(announcement.dateExpire).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            disabled={deletingId === announcement.id}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        >
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
