'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, MoveUp, MoveDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { addSubmissionToIssue, removeSubmissionFromIssue, getIssueSubmissions, getAvailableSubmissions } from "../actions/toc";
import { toast } from "sonner";
import { useJournalSettings } from "@/features/editor/hooks/useJournalSettings";

type Submission = {
    id: string;
    title: string;
    status: string;
    authors?: any[];
};

type IssueTOCProps = {
    issueId: string;
};

export function IssueTOC({ issueId }: IssueTOCProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [availableSubmissions, setAvailableSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { journalId } = useJournalSettings({ section: 'issues' });

    const fetchTOC = async () => {
        setLoading(true);
        const result = await getIssueSubmissions(issueId);
        if (result.success) {
            setSubmissions(result.data || []);
        } else {
            toast.error("Failed to load Table of Contents");
        }
        setLoading(false);
    };

    const fetchAvailable = async () => {
        if (!journalId) return;
        const result = await getAvailableSubmissions(journalId);
        if (result.success) {
            // Filter out submissions already in the issue
            const currentIds = new Set(submissions.map(s => s.id));
            setAvailableSubmissions((result.data || []).filter((s: Submission) => !currentIds.has(s.id)));
        }
    };

    useEffect(() => {
        fetchTOC();
    }, [issueId]);

    useEffect(() => {
        if (isAddOpen) {
            fetchAvailable();
        }
    }, [isAddOpen]);

    const handleAdd = async (submissionId: string) => {
        const result = await addSubmissionToIssue(issueId, submissionId);
        if (result.success) {
            toast.success("Submission added to issue");
            setIsAddOpen(false);
            fetchTOC();
        } else {
            toast.error("Failed to add submission");
        }
    };

    const handleRemove = async (submissionId: string) => {
        if (!confirm("Are you sure you want to remove this submission from the issue?")) return;

        const result = await removeSubmissionFromIssue(issueId, submissionId);
        if (result.success) {
            toast.success("Submission removed from issue");
            fetchTOC();
        } else {
            toast.error("Failed to remove submission");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Table of Contents</h3>
                <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Article
                </Button>
            </div>

            <div className="bg-white rounded-md border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : submissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No articles assigned to this issue yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {submissions.map((submission, index) => (
                            <li key={submission.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{submission.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {submission.authors?.map((a: any) => `${a.givenName} ${a.familyName}`).join(", ") || "Unknown Author"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="w-9 px-0" disabled={index === 0}>
                                        <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-9 px-0" disabled={index === submissions.length - 1}>
                                        <MoveDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-9 px-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemove(submission.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Modal
                open={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Article to Issue"
                widthClassName="max-w-[600px]"
            >
                <div className="py-4">
                    {availableSubmissions.length === 0 ? (
                        <p className="text-center text-gray-500">No available submissions found in Production stage.</p>
                    ) : (
                        <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                            {availableSubmissions.map((submission) => (
                                <li key={submission.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                    <span className="font-medium truncate max-w-[400px]">{submission.title}</span>
                                    <Button size="sm" onClick={() => handleAdd(submission.id)}>Add</Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Modal>
        </div>
    );
}
