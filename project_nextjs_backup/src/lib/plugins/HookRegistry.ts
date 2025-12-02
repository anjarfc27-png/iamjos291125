/**
 * HookRegistry
 * 
 * A registry for hooks that allows plugins to intercept and modify
 * system behavior. Mimics OJS HookRegistry.
 */

type HookCallback = (hookName: string, args: any[]) => boolean | void;

export class HookRegistry {
    private static hooks: Record<string, HookCallback[]> = {};

    /**
     * Register a hook callback
     * @param hookName The name of the hook to register against
     * @param callback The callback function to execute
     */
    static register(hookName: string, callback: HookCallback): void {
        if (!this.hooks[hookName]) {
            this.hooks[hookName] = [];
        }
        this.hooks[hookName].push(callback);
    }

    /**
     * Call a hook
     * @param hookName The name of the hook to call
     * @param args Arguments to pass to the callbacks
     * @returns boolean True if the hook chain should continue, false if it should stop (handled)
     */
    static call(hookName: string, args: any[] = []): boolean {
        if (!this.hooks[hookName]) {
            return false;
        }

        for (const callback of this.hooks[hookName]) {
            // If a callback returns true, it means "I handled this, stop processing"
            // Note: OJS logic is a bit mixed, but generally returning true means "intercepted"
            if (callback(hookName, args) === true) {
                return true;
            }
        }

        return false;
    }

    /**
     * Clear all hooks (useful for testing)
     */
    static clear(): void {
        this.hooks = {};
    }
}
