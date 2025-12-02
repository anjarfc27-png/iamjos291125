'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRedirectPathByRole } from "@/lib/auth-redirect";
import {
  ChevronDown,
  Menu,
  X,
  Settings,
  Users,
  BookOpen,
  BarChart3,
  Globe,
  Mail,
  Home,
  LogOut,
  Bell,
  User,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasRole } from "@/lib/auth";
import { Dropdown, DropdownItem, DropdownSection } from "@/components/ui/dropdown";
import { useSupabase } from "@/providers/supabase-provider";
import { LanguageSwitcher } from "@/components/admin/language-switcher";
import { useI18n } from "@/contexts/I18nContext";
import { pkpColors, pkpTypography } from "@/lib/theme";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = useSupabase();
  const [journals, setJournals] = useState<{ id: string; title: string; path: string }[]>([]);

  // Fetch journals for dropdown
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const { data } = await supabase
          .from("journals")
          .select("*")
          .order("created_at", { ascending: true });
        let rows = ((data ?? []) as Record<string, any>[]).map((r) => ({
          id: r.id as string,
          title: (r.title ?? r.name ?? r.journal_title ?? "") as string,
          path: (r.path ?? r.slug ?? r.journal_path ?? "") as string,
        }));
        const missingNameIds = rows.filter((j) => !j.title || j.title.trim().length === 0).map((j) => j.id);
        if (missingNameIds.length) {
          const { data: js } = await supabase
            .from("journal_settings")
            .select("journal_id, setting_value")
            .eq("setting_name", "name")
            .in("journal_id", missingNameIds);
          const nameMap = new Map((js ?? []).map((j) => [j.journal_id, j.setting_value]));
          rows = rows.map((j) => (nameMap.has(j.id) ? { ...j, title: nameMap.get(j.id) as string } : j));
        }
        setJournals(rows.filter((j) => j.title && j.title.trim().length > 0));
      } catch (error) {
        console.error("Error fetching journals:", error);
      }
    };
    if (user) {
      fetchJournals();
    }
  }, [supabase, user]);

  // Proteksi role - hanya admin yang bisa akses area ini
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login?source=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const hasAdminRole = hasRole(user, 'admin');
    if (!hasAdminRole) {
      // Redirect to role-appropriate route
      const redirectPath = getRedirectPathByRole(user);
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006798] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !hasRole(user, 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar - PKP header */}
      <header
        className="text-white"
        style={{
          backgroundColor: pkpColors.headerBg,
          height: "60px",
          flexShrink: 0,
          zIndex: 50
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            padding: "0 1.5rem",
            height: "100%"
          }}
        >
          {/* Left: Open Journal Systems and Tasks */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Dropdown
                button={
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-white text-base font-medium" style={{ fontSize: '1rem' }}>{t('admin.openJournalSystems')}</span>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </div>
                }
                align="left"
              >
                <div className="bg-white rounded-md border border-gray-200 shadow-lg min-w-[250px] py-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    {t('admin.siteAdministration')}
                  </Link>
                  {journals.length > 0 && (
                    <>
                      {journals.map((journal) => (
                        <Link
                          key={journal.id}
                          href={`/manager?journal=${journal.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" />
                          {journal.title}
                        </Link>
                      ))}
                    </>
                  )}
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    View Site
                  </Link>
                </div>
              </Dropdown>
            </div>
            {/* Tasks */}
            <div className="flex items-center relative cursor-pointer hover:opacity-80 transition-opacity" title={t('admin.tasks')}>
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-[#d9534f] text-white rounded-full px-1 text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center">
                0
              </span>
            </div>
          </div>

          {/* Right: Language and User */}
          <div className="flex items-center gap-6">
            {/* Language */}
            <LanguageSwitcher />

            {/* User with Logout */}
            <Dropdown
              button={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-white text-base font-medium" style={{ fontSize: '1rem' }}>{user.username || 'admin'}</span>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              }
              align="right"
            >
              <DropdownSection>
                <DropdownItem
                  onClick={() => router.push('/admin/profile')}
                  icon={<User className="h-4 w-4" />}
                >
                  {t('Edit Profile') || 'Edit Profile'}
                </DropdownItem>
                <DropdownItem
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  icon={<LogOut className="h-4 w-4" />}
                >
                  {t('admin.logout')}
                </DropdownItem>
              </DropdownSection>
            </Dropdown>
          </div>
        </div >
      </header >

      {/* Main Layout Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* Sidebar removed as per user request */}

        {/* Main Content - Full Width */}
        <main
          className="flex-1 bg-white overflow-auto"
          style={{
            backgroundColor: "#eaedee",
            padding: "2rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
            {children}
          </div>
        </main>
      </div>
    </div >
  );
}
