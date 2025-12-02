/**
 * Base Plugin Class
 * 
 * Abstract base class for all plugins.
 */

export abstract class Plugin {
    /**
     * Register the plugin. This is where the plugin should register hooks.
     * @param category The category of the plugin
     * @param path The path to the plugin
     * @param mainContextId The context ID (journal ID) if applicable
     */
    abstract register(category: string, path: string, mainContextId?: string): boolean;

    /**
     * Get the display name of the plugin
     */
    abstract getDisplayName(): string;

    /**
     * Get the description of the plugin
     */
    abstract getDescription(): string;

    /**
     * Get the name of the settings file to be installed on new installs
     */
    getInstallSitePluginSettingsFile(): string | null {
        return null;
    }

    /**
     * Get the name of the settings file to be installed on new context creation
     */
    getContextSpecificPluginSettingsFile(): string | null {
        return null;
    }

    /**
     * Get the filename of the plugin
     */
    abstract getPluginPath(): string;

    /**
     * Get the template path for the plugin
     */
    getTemplatePath(inCore: boolean = false): string {
        return '';
    }
}
