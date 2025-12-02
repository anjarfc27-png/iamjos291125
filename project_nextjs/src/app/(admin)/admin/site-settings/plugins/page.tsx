"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useSupabase } from "@/providers/supabase-provider";
import { Puzzle, Upload, CreditCard, FileText, Shield, Settings as SettingsIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { PluginSettingsModal } from "@/features/admin/components/plugin-settings-modal";

type Plugin = {
    id: string;
    name: string;
    description: string | null;
    category: string;
    enabled: boolean;
    version?: string;
};

export default function PluginsPage() {
    const { t } = useI18n();
    const supabase = useSupabase();
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        fetchPlugins();
    }, []);

    const fetchPlugins = async () => {
        try {
            const { data, error } = await supabase
                .from('site_plugins')
                .select('*')
                .order('category', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            setPlugins(data || []);
        } catch (error) {
            console.error('Error fetching plugins:', error);
            toast.error("Failed to load plugins");
        } finally {
            setLoading(false);
        }
    };

    const togglePlugin = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('site_plugins')
                .update({ enabled: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setPlugins(plugins.map(p =>
                p.id === id ? { ...p, enabled: !currentStatus } : p
            ));
            toast.success(`Plugin ${!currentStatus ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error updating plugin:', error);
            toast.error("Failed to update plugin status");
        }
    };

    const openSettings = (plugin: Plugin) => {
        setSelectedPlugin(plugin);
        setIsSettingsOpen(true);
    };

    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'importexport': return Upload;
            case 'paymethod': return CreditCard;
            case 'reports': return FileText;
            case 'authorization': return Shield;
            default: return Puzzle;
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading plugins...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-sm text-blue-800">
                <p>
                    <strong>Note:</strong> This page lists the installed plugins. You can enable/disable them here.
                    Settings for enabled plugins will be stored in the <code>plugin_settings</code> table.
                </p>
            </div>

            <div className="grid gap-4">
                {plugins.map((plugin) => {
                    const Icon = getIcon(plugin.category);
                    return (
                        <div
                            key={plugin.id}
                            className={`bg-white border rounded-lg p-4 flex items-start gap-4 transition-colors ${plugin.enabled ? 'border-blue-300 shadow-sm' : 'border-gray-200 opacity-80'
                                }`}
                        >
                            <div className={`p-2 rounded-md ${plugin.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 text-lg">{plugin.name}</h3>
                                    {!plugin.enabled && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Disabled</span>}
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{plugin.description}</p>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span className="bg-gray-100 px-2 py-1 rounded">{plugin.category}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border transition-colors ${plugin.enabled
                                        ? 'text-red-600 border-red-200 hover:bg-red-50'
                                        : 'text-green-600 border-green-200 hover:bg-green-50'
                                        }`}
                                >
                                    {plugin.enabled ? (
                                        <>
                                            <ToggleRight className="h-4 w-4" /> Disable
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="h-4 w-4" /> Enable
                                        </>
                                    )}
                                </button>
                                {plugin.enabled && (
                                    <button
                                        onClick={() => openSettings(plugin)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#006798] bg-white border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors"
                                    >
                                        <SettingsIcon className="h-4 w-4" /> Settings
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedPlugin && (
                <PluginSettingsModal
                    open={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                    pluginId={selectedPlugin.id}
                    pluginName={selectedPlugin.name}
                />
            )}
        </div>
    );
}
