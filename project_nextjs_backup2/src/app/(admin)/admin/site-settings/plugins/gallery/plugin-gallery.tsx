"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Download, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { installPluginAction, uninstallPluginAction } from "../../actions";

type PluginItem = {
    id: string;
    name: string;
    description: string;
    category: string;
    enabled: boolean;
};

type PluginGalleryProps = {
    installedPlugins: PluginItem[];
    catalog: PluginItem[];
};

export function PluginGallery({ installedPlugins, catalog }: PluginGalleryProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Merge catalog with installed status
    // If a plugin is in installedPlugins, mark it as installed.
    // The catalog contains ALL possible plugins.
    // But getSitePlugins returns installed plugins.
    // We need to know which ones from catalog are installed.

    const installedIds = new Set(installedPlugins.map(p => p.id));

    const galleryItems = catalog.map(item => ({
        ...item,
        isInstalled: installedIds.has(item.id)
    }));

    const categories = ["all", ...Array.from(new Set(catalog.map((p) => p.category)))];

    const filteredPlugins = galleryItems.filter((plugin) => {
        const matchesSearch =
            plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleInstall = async (pluginId: string) => {
        setProcessingId(pluginId);
        try {
            const result = await installPluginAction(pluginId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to install plugin");
        } finally {
            setProcessingId(null);
        }
    };

    const handleUninstall = async (pluginId: string) => {
        if (!confirm("Are you sure you want to uninstall this plugin? Settings may be lost.")) return;

        setProcessingId(pluginId);
        try {
            const result = await uninstallPluginAction(pluginId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to uninstall plugin");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search plugins..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlugins.map((plugin) => (
                    <div
                        key={plugin.id}
                        className="flex flex-col justify-between p-5 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 line-clamp-1" title={plugin.name}>
                                    {plugin.name}
                                </h3>
                                {plugin.isInstalled && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Installed
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2" title={plugin.description}>
                                {plugin.description}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="outline" className="text-xs font-normal text-gray-500">
                                    {plugin.category}
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t">
                            {plugin.isInstalled ? (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleUninstall(plugin.id)}
                                    disabled={processingId === plugin.id}
                                >
                                    {processingId === plugin.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Uninstall
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full bg-[#006798] hover:bg-[#005a87]"
                                    onClick={() => handleInstall(plugin.id)}
                                    disabled={processingId === plugin.id}
                                >
                                    {processingId === plugin.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Install
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPlugins.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    No plugins found matching your criteria.
                </div>
            )}
        </div>
    );
}
