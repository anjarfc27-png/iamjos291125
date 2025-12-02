"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Globe, Lock } from "lucide-react";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpTable, PkpTableRow, PkpTableCell } from "@/components/ui/pkp-table";
import { updateIssue, publishIssue, unpublishIssue } from "@/features/issues/actions/issues";
import { addSubmissionToIssue, removeSubmissionFromIssue } from "@/features/issues/actions/toc";
import { PkpModal } from "@/components/ui/pkp-modal";

type Issue = {
    id: string;
    volume: number | null;
    number: string | null;
    year: number | null;
    title: string | null;
    description: string | null;
    is_public: boolean;
    published: boolean;
    date_published: string | null;
    journal_id: string;
};

type Submission = {
    id: string;
    title: string;
    status: string;
    authors: any[];
    version?: number;
    published_at?: string;
};

type Props = {
    issue: Issue;
    assignedSubmissions: Submission[];
    availableSubmissions: Submission[];
};

export function IssueDetailClient({ issue, assignedSubmissions, availableSubmissions }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("data");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        volume: issue.volume?.toString() || "",
        number: issue.number || "",
        year: issue.year?.toString() || new Date().getFullYear().toString(),
        title: issue.title || "",
        description: issue.description || "",
        is_public: issue.is_public,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append("volume", formData.volume);
            data.append("number", formData.number);
            data.append("year", formData.year);
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("is_public", String(formData.is_public));
            data.append("journal_id", issue.journal_id);

            const result = await updateIssue(issue.id, data);
            if (result.success) {
                alert("Issue updated successfully");
                router.refresh();
            } else {
                alert("Failed to update issue: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!confirm("Are you sure you want to publish this issue?")) return;
        setLoading(true);
        try {
            const result = await publishIssue(issue.id);
            if (result.success) {
                alert("Issue published successfully");
                router.refresh();
            } else {
                alert("Failed to publish issue");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUnpublish = async () => {
        if (!confirm("Are you sure you want to unpublish this issue?")) return;
        setLoading(true);
        try {
            const result = await unpublishIssue(issue.id);
            if (result.success) {
                alert("Issue unpublished successfully");
                router.refresh();
            } else {
                alert("Failed to unpublish issue");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubmission = async (submissionId: string) => {
        setLoading(true);
        try {
            const result = await addSubmissionToIssue(issue.id, submissionId);
            if (result.success) {
                setIsAddModalOpen(false);
                router.refresh();
            } else {
                alert("Failed to add submission: " + result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubmission = async (submissionId: string) => {
        if (!confirm("Remove this submission from the issue?")) return;
        setLoading(true);
        try {
            const result = await removeSubmissionFromIssue(issue.id, submissionId);
            if (result.success) {
                router.refresh();
            } else {
                alert("Failed to remove submission: " + result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/manager/issues" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#002C40]">
                            {issue.title || `Vol ${issue.volume}, No ${issue.number} (${issue.year})`}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issue.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {issue.published ? "Published" : "Unpublished"}
                            </span>
                            {issue.date_published && (
                                <span>• Published: {new Date(issue.date_published).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {issue.published ? (
                        <PkpButton variant="destructive" onClick={handleUnpublish} disabled={loading}>
                            <Lock className="h-4 w-4 mr-2" />
                            Unpublish Issue
                        </PkpButton>
                    ) : (
                        <PkpButton variant="primary" onClick={handlePublish} disabled={loading}>
                            <Globe className="h-4 w-4 mr-2" />
                            Publish Issue
                        </PkpButton>
                    )}
                </div>
            </div>

            <PkpTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <PkpTabsList>
                    <PkpTabsTrigger value="data">Issue Data</PkpTabsTrigger>
                    <PkpTabsTrigger value="toc">Table of Contents</PkpTabsTrigger>
                </PkpTabsList>

                {/* Issue Data Tab */}
                <PkpTabsContent value="data" className="bg-white p-6 border border-gray-200 rounded-b-md space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#002C40]">Volume</label>
                            <input
                                type="number"
                                name="volume"
                                value={formData.volume}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006798]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#002C40]">Number</label>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006798]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#002C40]">Year</label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006798]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#002C40]">Title (Optional)</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006798]"
                            placeholder="e.g. Special Issue on AI"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#002C40]">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006798]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_public"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-[#006798] border-gray-300 rounded focus:ring-[#006798]"
                        />
                        <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                            Public (Visible to readers)
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <PkpButton onClick={handleSave} disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </PkpButton>
                    </div>
                </PkpTabsContent>

                {/* Table of Contents Tab */}
                <PkpTabsContent value="toc" className="bg-white p-6 border border-gray-200 rounded-b-md space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[#002C40]">Articles</h3>
                        <PkpButton variant="onclick" size="sm" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Submission
                        </PkpButton>

                        <PkpModal
                            isOpen={isAddModalOpen}
                            onClose={() => setIsAddModalOpen(false)}
                            title="Add Submission to Issue"
                            size="large"
                        >
                            <div className="space-y-2 py-4">
                                {availableSubmissions.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No available submissions found in Production stage.</p>
                                ) : (
                                    availableSubmissions.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                                            <div>
                                                <div className="font-medium text-[#002C40]">{sub.title}</div>
                                                <div className="text-xs text-gray-500">ID: {sub.id} • Status: {sub.status}</div>
                                            </div>
                                            <PkpButton size="sm" onClick={() => handleAddSubmission(sub.id)} disabled={loading}>
                                                Add
                                            </PkpButton>
                                        </div>
                                    ))
                                )}
                            </div>
                        </PkpModal>
                    </div>

                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <PkpTable>
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-[#002C40]">Title</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-[#002C40]">Authors</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm text-[#002C40]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-gray-500 italic">
                                            No articles assigned to this issue yet.
                                        </td>
                                    </tr>
                                ) : (
                                    assignedSubmissions.map(sub => (
                                        <PkpTableRow key={sub.id}>
                                            <PkpTableCell className="py-3 px-4">
                                                <div className="font-medium text-[#006798]">{sub.title}</div>
                                            </PkpTableCell>
                                            <PkpTableCell className="py-3 px-4 text-gray-600">
                                                {/* Assuming authors is array of objects or strings, simplified here */}
                                                {Array.isArray(sub.authors) ? sub.authors.map((a: any) => a.given_name + ' ' + a.family_name).join(', ') : 'Unknown'}
                                            </PkpTableCell>
                                            <PkpTableCell className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleRemoveSubmission(sub.id)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Remove from Issue"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </PkpTableCell>
                                        </PkpTableRow>
                                    ))
                                )}
                            </tbody>
                        </PkpTable>
                    </div>
                </PkpTabsContent>
            </PkpTabs>
        </div>
    );
}
