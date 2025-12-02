'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueForm } from "@/features/issues/components/issue-form";
import { useSupabase } from "@/providers/supabase-provider";
import { useJournalSettings } from "@/features/editor/hooks/useJournalSettings";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";

type Issue = {
  id: string;
  volume: number | null;
  number: string | null;
  year: number | null;
  title: string | null;
  description: string | null;
  is_public: boolean;
  published_at: string | null;
  journal_id: string;
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const supabase = useSupabase();
  const { journalId } = useJournalSettings({ section: 'issues' });

  const fetchIssues = async () => {
    if (!journalId) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('journal_id', journalId)
        .order('year', { ascending: false })
        .order('volume', { ascending: false })
        .order('number', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [journalId]);

  const futureIssues = issues.filter(i => !i.published_at);
  const backIssues = issues.filter(i => i.published_at);

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setIsCreateOpen(true);
  };

  const handleCreateOpen = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setEditingIssue(null);
  };

  const IssueTable = ({ issues, type }: { issues: Issue[], type: 'future' | 'back' }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No issues found.
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <Link href={`/editor/issues/${issue.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {issue.title || `Vol ${issue.volume} No ${issue.number} (${issue.year})`}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        Vol {issue.volume}, No {issue.number} ({issue.year})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={issue.published_at ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {issue.published_at ? 'Published' : 'Unpublished'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.published_at
                      ? format(new Date(issue.published_at), 'MMM d, yyyy')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(issue)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <Link href={`/editor/issues/${issue.id}`} className="text-blue-600 hover:text-blue-800">
                        TOC
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
    }}>
      {/* Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0",
      }}>
        <div style={{ padding: "0 1.5rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <h1 style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                margin: 0,
                padding: "0.5rem 0",
                lineHeight: "2.25rem",
                color: "#002C40",
              }}>
                Issues
              </h1>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}>
                Create and manage issues for this journal.
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: "1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <Tabs defaultValue="future" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="future">Future Issues ({futureIssues.length})</TabsTrigger>
            <TabsTrigger value="back">Back Issues ({backIssues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="future">
            <IssueTable issues={futureIssues} type="future" />
          </TabsContent>

          <TabsContent value="back">
            <IssueTable issues={backIssues} type="back" />
          </TabsContent>
        </Tabs>
      </div>

      <IssueForm
        open={isCreateOpen}
        onOpenChange={handleCreateOpen}
        issue={editingIssue}
        onSuccess={fetchIssues}
      />
    </div>
  );
}