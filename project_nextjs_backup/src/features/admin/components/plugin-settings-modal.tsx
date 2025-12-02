"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type PluginSettingsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pluginId: string;
    pluginName: string;
};

export function PluginSettingsModal({ open, onOpenChange, pluginId, pluginName }: PluginSettingsModalProps) {
    const supabase = getSupabaseBrowserClient();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<Record<string, any>>({});

    // Mock schema for now - in a real app this would come from the plugin definition
    const [schema, setSchema] = useState<any[]>([]);

    useEffect(() => {
        if (open && pluginId) {
            fetchSettings();
        }
    }, [open, pluginId]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // 1. Fetch existing settings
            const { data, error } = await supabase
                .from("plugin_settings")
                .select("setting_name, setting_value")
                .eq("plugin_id", pluginId);

            if (error) throw error;

            const currentSettings: Record<string, any> = {};
            data?.forEach(item => {
                currentSettings[item.setting_name] = item.setting_value;
            });
            setSettings(currentSettings);

            // 2. Define schema based on plugin (Mock logic)
            // In OJS, plugins define their own settings form. Here we'll mock it based on plugin name.
            if (pluginName.toLowerCase().includes("google analytics")) {
                setSchema([
                    { name: "tracking_id", label: "Tracking ID", type: "text", placeholder: "UA-XXXXX-Y" }
                ]);
            } else if (pluginName.toLowerCase().includes("paypal")) {
                setSchema([
                    { name: "client_id", label: "Client ID", type: "text" },
                    { name: "secret", label: "Secret", type: "password" },
                    { name: "sandbox", label: "Sandbox Mode", type: "checkbox" }
                ]);
            } else {
                setSchema([
                    { name: "api_key", label: "API Key", type: "text" },
                    { name: "enabled", label: "Active", type: "checkbox" }
                ]);
            }

        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                plugin_id: pluginId,
                setting_name: key,
                setting_value: value
            }));

            // Upsert settings
            const { error } = await supabase
                .from("plugin_settings")
                .upsert(updates, { onConflict: "plugin_id, setting_name" });

            if (error) throw error;

            toast.success("Settings saved");
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name: string, value: any) => {
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal
            open={open}
            onClose={() => onOpenChange(false)}
            title={`Settings: ${pluginName}`}
        >
            <div className="space-y-6 py-4">
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-4">Loading settings...</div>
                    ) : schema.length === 0 ? (
                        <div className="text-center text-gray-500">No configurable settings for this plugin.</div>
                    ) : (
                        schema.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={field.name}>{field.label}</Label>
                                    {field.type === "checkbox" && (
                                        <input
                                            type="checkbox"
                                            id={field.name}
                                            checked={!!settings[field.name]}
                                            onChange={(e) => handleChange(field.name, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                    )}
                                </div>
                                {field.type !== "checkbox" && (
                                    <Input
                                        id={field.name}
                                        type={field.type}
                                        value={settings[field.name] || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        placeholder={field.placeholder}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
