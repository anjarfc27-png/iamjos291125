"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

type NavigationItem = {
    id: string;
    label: string;
    url: string;
};

type NavigationBuilderProps = {
    initialItems: string[]; // Currently stored as comma-separated strings in DB
    name: string;
    label: string;
    description: string;
};

export function NavigationBuilder({ initialItems, name, label, description }: NavigationBuilderProps) {
    // Parse initial items (assuming they are simple labels for now, as per current implementation)
    // In a real system, these would be objects with URL/Label. 
    // For now, we'll treat them as labels and auto-generate a dummy URL or just keep them as strings.
    // Given the current backend expects comma-separated strings, we'll stick to that interface.

    const [items, setItems] = useState<string[]>(initialItems.filter(Boolean));
    const [newItem, setNewItem] = useState("");

    const handleAdd = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem("");
        }
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium text-[#002C40]">{label}</Label>

            {/* Hidden input to submit the data */}
            <input type="hidden" name={name} value={items.join(", ")} />

            <div className="border rounded-md p-4 space-y-4 bg-white">
                <div className="flex gap-2">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add menu item..."
                        className="flex-1"
                    />
                    <Button type="button" onClick={handleAdd} size="sm" variant="secondary">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm italic">
                        No items added yet.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border group">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(index)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
}
