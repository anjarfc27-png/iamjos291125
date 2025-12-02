import { Plugin } from "./Plugin";

/**
 * PluginRegistry
 * 
 * Manages the loading and retrieval of plugins.
 */
export class PluginRegistry {
    private static plugins: Record<string, Record<string, Plugin>> = {};

    /**
     * Load a category of plugins
     * @param category The category to load
     * @param enabledOnly Whether to load only enabled plugins
     */
    static async loadCategory(category: string, enabledOnly: boolean = false): Promise<Record<string, Plugin>> {
        // In a real implementation, this would dynamically load plugins from the filesystem
        // For now, we'll return an empty object or mock plugins if registered manually
        if (!this.plugins[category]) {
            this.plugins[category] = {};
        }
        return this.plugins[category];
    }

    /**
     * Register a plugin instance
     * @param category The category of the plugin
     * @param plugin The plugin instance
     */
    static register(category: string, plugin: Plugin): void {
        if (!this.plugins[category]) {
            this.plugins[category] = {};
        }
        // Use the plugin path/name as the key
        const name = plugin.getPluginPath();
        this.plugins[category][name] = plugin;
    }

    /**
     * Get all loaded plugins
     */
    static getAllPlugins(): Record<string, Record<string, Plugin>> {
        return this.plugins;
    }

    /**
     * Get a specific plugin
     * @param category The category
     * @param name The plugin name
     */
    static getPlugin(category: string, name: string): Plugin | null {
        return this.plugins[category]?.[name] || null;
    }
}
