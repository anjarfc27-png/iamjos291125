import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";

type Props = {
    children: ReactNode;
};

import { getNavigationMenus } from "@/features/navigation/actions";
import { getSiteSettings, getSiteAppearanceSetup } from "@/app/(admin)/admin/site-settings/actions";

export default async function SiteLayout({ children }: Props) {
    const [menus, settings, appearance] = await Promise.all([
        getNavigationMenus(),
        getSiteSettings(),
        getSiteAppearanceSetup()
    ]);

    const headerSettings = {
        title: settings.title,
        logo_url: appearance.pageHeaderTitleImage || undefined
    };

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <SiteHeader menus={menus} siteSettings={headerSettings} />
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t border-gray-200 bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
                    {appearance.pageFooter ? (
                        <div dangerouslySetInnerHTML={{ __html: appearance.pageFooter }} />
                    ) : (
                        <p>&copy; {new Date().getFullYear()} {settings.title}. All rights reserved.</p>
                    )}
                </div>
            </footer>
        </div>
    );
}
