"use client";

import { useState, useTransition } from "react";
import { addMenuItem, deleteMenuItem } from "../actions";
import { Plus, Trash2, GripVertical } from "lucide-react";

type MenuItem = {
    id: string;
    title: string;
    url?: string;
    type: string;
    seq: number;
};

type Menu = {
    id: string;
    title: string;
    area: string;
    items: MenuItem[];
};

type Props = {
    menu: Menu;
};

export function MenuEditor({ menu }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (itemId: string) => {
        if (!confirm("Delete this item?")) return;
        await deleteMenuItem(itemId);
    };

    const handleAdd = async (formData: FormData) => {
        startTransition(async () => {
            await addMenuItem(formData);
            setIsAdding(false);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{menu.title}</h3>
                    <p className="text-sm text-gray-500">Area: {menu.area}</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-sm text-[#006798] hover:underline flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Item
                </button>
            </div>

            {isAdding && (
                <form action={handleAdd} className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                    <input type="hidden" name="menuId" value={menu.id} />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Title</label>
                            <input name="title" required className="w-full border rounded p-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">URL</label>
                            <input name="url" placeholder="http://..." className="w-full border rounded p-1 text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-gray-500">Cancel</button>
                        <button type="submit" disabled={isPending} className="text-xs bg-[#006798] text-white px-3 py-1 rounded">
                            {isPending ? "Adding..." : "Add"}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {menu.items.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No items in this menu.</p>
                ) : (
                    menu.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100 group">
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                    {item.url && <div className="text-xs text-gray-500">{item.url}</div>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
