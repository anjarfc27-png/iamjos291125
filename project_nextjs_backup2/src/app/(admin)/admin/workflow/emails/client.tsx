"use client";

import { useState } from "react";
import { EmailTemplateForm } from "@/features/emails/components/email-template-form";
import { Edit2 } from "lucide-react";

type Template = {
    id: string;
    key: string;
    subject: string;
    body: string;
    description: string;
    canEdit: boolean;
};

type Props = {
    templates: Template[];
};

export function EmailTemplatesClient({ templates }: Props) {
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    if (editingTemplate) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-bold mb-4">Edit Template: {editingTemplate.key}</h3>
                <EmailTemplateForm
                    template={editingTemplate}
                    onCancel={() => setEditingTemplate(null)}
                    onSuccess={(msg) => {
                        setFeedback(msg);
                        setEditingTemplate(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedback && (
                <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-4">
                    {feedback}
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-500">Key</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Subject</th>
                            <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {templates.map((template) => (
                            <tr key={template.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{template.key}</div>
                                    <div className="text-gray-500 text-xs mt-1 truncate max-w-xs">
                                        {template.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {template.subject}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setEditingTemplate(template)}
                                        className="text-[#006798] hover:text-[#005a87] flex items-center gap-1 justify-end w-full"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
