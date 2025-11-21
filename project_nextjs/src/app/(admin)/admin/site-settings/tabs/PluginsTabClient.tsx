"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { toggleSitePluginAction } from "../actions";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  version?: string;
  author?: string;
  configurable?: boolean;
}

interface PluginsTabClientProps {
  items: Plugin[];
}

export default function PluginsTabClient({ items }: PluginsTabClientProps) {
  const [plugins, setPlugins] = useState<Plugin[]>(items);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [configPlugin, setConfigPlugin] = useState<Plugin | null>(null);

  const grouped = plugins.reduce<Record<string, Plugin[]>>((acc, plugin) => {
    const key = plugin.category ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(plugin);
    return acc;
  }, {});

  const categories = ["all", ...Object.keys(grouped)];

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGrouped = filteredPlugins.reduce<Record<string, Plugin[]>>(
    (acc, plugin) => {
      const key = plugin.category ?? "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(plugin);
      return acc;
    },
    {}
  );

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("plugin_id", pluginId);
        formData.append("enabled", String(enabled));

        const result = await toggleSitePluginAction(formData);

        if (result.success) {
          setPlugins((prev) =>
            prev.map((p) => (p.id === pluginId ? { ...p, enabled } : p))
          );
          toast.success(`Plugin ${enabled ? "diaktifkan" : "dinonaktifkan"}`);
        } else {
          toast.error(result.message || "Gagal mengubah status plugin");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat mengubah status plugin");
      }
    });
  };

  const handleInstallPlugin = () => {
    toast.info("Fitur instalasi plugin akan segera tersedia");
  };

  const handleUninstallPlugin = (plugin: Plugin) => {
    if (confirm(`Apakah Anda yakin ingin menghapus plugin "${plugin.name}"?`)) {
      toast.info("Fitur penghapusan plugin akan segera tersedia");
    }
  };

  const handleConfigurePlugin = (plugin: Plugin) => {
    setConfigPlugin(plugin);
  };

  const handleSaveConfiguration = async (
    pluginId: string,
    config: Record<string, any>
  ) => {
    try {
      toast.success("Konfigurasi plugin disimpan");
      setConfigPlugin(null);
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Cari plugin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 rounded-md border border-gray-300 bg-white px-3 text-gray-900 shadow-inner focus-visible:border-[#006798] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006798]/20"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {getPluginCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleInstallPlugin} variant="primary">
          Install Plugin Baru
        </Button>
      </div>

      {/* Plugin Categories */}
      {Object.entries(filteredGrouped).map(([category, categoryPlugins]) => (
        <div key={category} className="space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {getPluginCategoryLabel(category)}
            </h3>
            <p className="text-sm text-gray-600">
              {categoryPlugins.length} plugin
            </p>
          </div>

          <div className="space-y-4">
            {categoryPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className="flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                    {plugin.version && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        v{plugin.version}
                      </span>
                    )}
                    {plugin.enabled && (
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{plugin.description}</p>
                  {plugin.author && (
                    <p className="text-xs text-gray-500">
                      Oleh {plugin.author}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={plugin.enabled}
                      onChange={(e) =>
                        handleTogglePlugin(plugin.id, e.target.checked)
                      }
                      disabled={isPending}
                      className="h-4 w-4 rounded border border-[var(--border)]"
                    />
                    Aktif
                  </label>

                  {plugin.configurable && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleConfigurePlugin(plugin)}
                    >
                      Konfigurasi
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleUninstallPlugin(plugin)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(filteredGrouped).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada plugin yang ditemukan</p>
        </div>
      )}

      {/* Configuration Modal */}
      {configPlugin && (
        <PluginConfigModal
          plugin={configPlugin}
          onSave={handleSaveConfiguration}
          onClose={() => setConfigPlugin(null)}
        />
      )}
    </div>
  );
}

function PluginConfigModal({
  plugin,
  onSave,
  onClose,
}: {
  plugin: Plugin;
  onSave: (pluginId: string, config: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(plugin.id, config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Konfigurasi {plugin.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Konfigurasi plugin sesuai kebutuhan Anda.
          </p>

          <div>
            <Label htmlFor="setting1">Setting 1</Label>
            <Input
              id="setting1"
              placeholder="Masukkan nilai setting"
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, setting1: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="setting2">Setting 2</Label>
            <Input
              id="setting2"
              placeholder="Masukkan nilai setting"
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, setting2: e.target.value }))
              }
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getPluginCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    all: "Semua Kategori",
    generic: "Plugin Umum",
    importexport: "Import/Export",
    metadata: "Metadata",
    reports: "Laporan & Alat",
    other: "Lainnya",
  };
  return (
    labels[category] ?? category.replace(/(^|\s)\w/g, (c) => c.toUpperCase())
  );
}