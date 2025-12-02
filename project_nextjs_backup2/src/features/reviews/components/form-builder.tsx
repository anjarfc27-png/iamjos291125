"use client";

import { useState, useTransition } from "react";
import { addFormElement } from "../actions/forms";
import { Plus, Trash2 } from "lucide-react";

type Element = {
    id: string;
    type: number;
    question: string;
    required: boolean;
    options: string[];
};

type Props = {
    formId: string;
    elements: Element[];
};

export function FormBuilder({ formId, elements }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleAdd = (formData: FormData) => {
        startTransition(async () => {
            await addFormElement(formData);
            setIsAdding(false);
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Form Questions</h3>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-sm bg-[#006798] text-white px-3 py-2 rounded hover:bg-[#005a87] flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Question
                    </button>
                </div>

                {isAdding && (
                    <form action={handleAdd} className="bg-gray-50 p-4 rounded mb-6 border border-gray-200">
                        <input type="hidden" name="formId" value={formId} />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question</label>
                                <input name="question" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select name="type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                        <option value="text">Short Text</option>
                                        <option value="textarea">Paragraph</option>
                                        <option value="radio">Multiple Choice (Radio)</option>
                                        <option value="checkbox">Checkboxes</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input type="checkbox" name="required" id="req" className="mr-2" />
                                    <label htmlFor="req" className="text-sm text-gray-700">Required</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Options (for Radio/Checkbox)</label>
                                <textarea name="options" placeholder="One option per line" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={isPending} className="px-3 py-1 text-sm bg-[#006798] text-white rounded">
                                    {isPending ? "Adding..." : "Save Question"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    {elements.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-4">No questions yet.</p>
                    ) : (
                        elements.map((el, idx) => (
                            <div key={el.id} className="p-4 bg-gray-50 rounded border border-gray-200 relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Delete button placeholder */}
                                    <Trash2 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-red-600" />
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-gray-400 font-mono text-sm pt-1">{idx + 1}.</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {el.question}
                                            {el.required && <span className="text-red-500 ml-1">*</span>}
                                        </p>
                                        <div className="mt-2">
                                            {/* Preview based on type */}
                                            {el.type === 1 && <input disabled className="w-full border p-2 rounded bg-white" placeholder="Short text answer" />}
                                            {el.type === 2 && <textarea disabled className="w-full border p-2 rounded bg-white" rows={3} placeholder="Long text answer" />}
                                            {(el.type === 3 || el.type === 4) && (
                                                <div className="space-y-1">
                                                    {el.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className={`w-4 h-4 border ${el.type === 3 ? 'rounded-full' : 'rounded'} bg-white`} />
                                                            <span className="text-sm text-gray-600">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
