'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { createIssue, updateIssue } from "../actions/issues";
import { toast } from "sonner";
import { useJournalSettings } from "@/features/editor/hooks/useJournalSettings";

type Issue = {
    id: string;
    volume: number | null;
    number: string | null;
    year: number | null;
    title: string | null;
    description: string | null;
    is_public: boolean;
    published_at: string | null;
};

type IssueFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issue?: Issue | null;
    onSuccess?: () => void;
};

export function IssueForm({ open, onOpenChange, issue, onSuccess }: IssueFormProps) {
    const [loading, setLoading] = useState(false);
    const { journalId } = useJournalSettings({ section: 'issues' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!journalId) {
            toast.error("Journal ID not found");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('journal_id', journalId);

        try {
            const result = issue
                ? await updateIssue(issue.id, formData)
                : await createIssue(formData);

            if (result.success) {
                toast.success(issue ? "Issue updated" : "Issue created");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => onOpenChange(false)}
            title={issue ? "Edit Issue" : "Create Issue"}
            widthClassName="max-w-[500px]"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" form="issue-form" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </>
            }
        >
            <form id="issue-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="volume">Volume</Label>
                        <Input id="volume" name="volume" type="number" defaultValue={issue?.volume ?? ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Number</Label>
                        <Input id="number" name="number" defaultValue={issue?.number ?? ''} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" name="year" type="number" required defaultValue={issue?.year ?? new Date().getFullYear()} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input id="title" name="title" placeholder="e.g. Special Issue on AI" defaultValue={issue?.title ?? ''} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={issue?.description ?? ''} />
                </div>
            </form>
        </Modal>
    );
}
