"use client";

import { FileText, Download } from "lucide-react";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTable, PkpTableRow, PkpTableCell } from "@/components/ui/pkp-table";

export default function ReportsPage() {
    const reports = [
        {
            id: "reviews",
            name: "Review Report",
            description: "Report on review assignments, completion times, and reviewer performance.",
            lastGenerated: "Never",
        },
        {
            id: "articles",
            name: "Article Report",
            description: "List of all articles with their current status, authors, and submission dates.",
            lastGenerated: "2 days ago",
        },
        {
            id: "users",
            name: "User Report",
            description: "List of all registered users and their roles.",
            lastGenerated: "1 week ago",
        },
        {
            id: "views",
            name: "View Report",
            description: "Statistics on article views and downloads.",
            lastGenerated: "Never",
        },
    ];

    const handleGenerate = (reportId: string) => {
        alert(`Generating ${reportId} report... (This is a placeholder)`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#002C40] mb-2">Reports</h1>
                <p className="text-gray-600">Generate and download reports for your journal.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <PkpTable>
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-[#002C40]">Report Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-[#002C40]">Description</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-[#002C40]">Last Generated</th>
                            <th className="text-right py-3 px-4 font-semibold text-sm text-[#002C40]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <PkpTableRow key={report.id}>
                                <PkpTableCell className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded text-[#006798]">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-[#002C40]">{report.name}</span>
                                    </div>
                                </PkpTableCell>
                                <PkpTableCell className="py-4 px-4 text-gray-600">
                                    {report.description}
                                </PkpTableCell>
                                <PkpTableCell className="py-4 px-4 text-gray-500 text-sm">
                                    {report.lastGenerated}
                                </PkpTableCell>
                                <PkpTableCell className="py-4 px-4 text-right">
                                    <PkpButton
                                        variant="onclick"
                                        size="sm"
                                        onClick={() => handleGenerate(report.id)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Generate
                                    </PkpButton>
                                </PkpTableCell>
                            </PkpTableRow>
                        ))}
                    </tbody>
                </PkpTable>
            </div>
        </div>
    );
}
