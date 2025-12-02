"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/admin/language-switcher";
import { Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { Dropdown, DropdownItem, DropdownSection } from "@/components/ui/dropdown";
import { useRouter, useParams } from "next/navigation";
import { getRedirectPathByRole } from "@/lib/auth-redirect";

export type Menu = {
    id: string;
    title: string;
    area: string;
    items: {
        id: string;
        title: string;
        url?: string;
        type: string;
    }[];
};

export type SiteSettings = {
    title: string;
    logo_url?: string;
};

type Props = {
    menus?: Menu[];
    siteSettings?: SiteSettings;
};

export function SiteHeader({ menus = [], siteSettings }: Props) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const params = useParams();

    const handleDashboardClick = () => {
        if (user) {
            const path = getRedirectPathByRole(user);
            router.push(path);
        }
    };

    const primaryMenu = menus.find(m => m.area === 'primary');

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        {siteSettings?.logo_url ? (
                            <img src={siteSettings.logo_url} alt={siteSettings.title} className="h-8 w-auto" />
                        ) : (
                            <span className="text-3xl font-bold text-[var(--primary)]">
                                {siteSettings?.title || "iamJOS"}
                            </span>
                        )}
                    </Link>

                    {/* Primary Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {primaryMenu?.items.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url || '#'}
                                className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]"
                            >
                                {item.title}
                            </Link>
                        ))}
                        {!primaryMenu?.items.length && params?.path && (
                            <>
                                <Link href={`/journals/${params.path}/issue/current`} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">
                                    Current
                                </Link>
                                <Link href={`/journals/${params.path}/issue/archive`} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">
                                    Archives
                                </Link>
                                <Link href={`/journals/${params.path}/about`} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">
                                    About
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search */}
                    <button className="text-gray-500 hover:text-[var(--primary)]">
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Language Switcher */}
                    <LanguageSwitcher variant="light" />

                    {/* User Block */}
                    {user ? (
                        <Dropdown
                            button={
                                <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--primary)] transition-colors">
                                    <User className="h-5 w-5 text-gray-700" />
                                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                                </div>
                            }
                            align="right"
                        >
                            <DropdownSection>
                                <DropdownItem
                                    onClick={handleDashboardClick}
                                    icon={<LayoutDashboard className="h-4 w-4" />}
                                >
                                    Dashboard
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => router.push('/profile')}
                                    icon={<User className="h-4 w-4" />}
                                >
                                    View Profile
                                </DropdownItem>
                                <DropdownItem
                                    onClick={async () => {
                                        await logout();
                                        router.push('/');
                                    }}
                                    icon={<LogOut className="h-4 w-4" />}
                                >
                                    Logout
                                </DropdownItem>
                            </DropdownSection>
                        </Dropdown>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">
                                Login
                            </Link>
                            <Link href="/register" className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
