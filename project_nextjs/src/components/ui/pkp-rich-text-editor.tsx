"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, Link as LinkIcon, Superscript, Subscript } from "lucide-react";

interface PkpRichTextEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

/**
 * PKP Rich Text Editor Component
 * Simulates the OJS 3.3 TinyMCE editor styling
 */
export const PkpRichTextEditor = forwardRef<HTMLTextAreaElement, PkpRichTextEditorProps>(
    ({ className, style, label, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                        {label}
                    </label>
                )}
                <div className="border border-[#e5e5e5] rounded bg-white">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-1 border-b border-[#e5e5e5] bg-[#f8f8f8]">
                        <ToolbarButton icon={<Bold className="h-4 w-4" />} title="Bold" />
                        <ToolbarButton icon={<Italic className="h-4 w-4" />} title="Italic" />
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <ToolbarButton icon={<Superscript className="h-4 w-4" />} title="Superscript" />
                        <ToolbarButton icon={<Subscript className="h-4 w-4" />} title="Subscript" />
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <ToolbarButton icon={<LinkIcon className="h-4 w-4" />} title="Link" />
                    </div>

                    {/* Textarea area */}
                    <textarea
                        ref={ref}
                        className={cn(
                            "w-full p-3 min-h-[150px] outline-none text-sm text-gray-800 resize-y block border-none focus:ring-0",
                            className
                        )}
                        style={{
                            fontFamily: "sans-serif",
                            ...style
                        }}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

PkpRichTextEditor.displayName = "PkpRichTextEditor";

function ToolbarButton({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <button
            type="button"
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title={title}
            onClick={(e) => e.preventDefault()} // Prevent form submission
        >
            {icon}
        </button>
    );
}
