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
import { SiteSidebar } from "@/components/site/site-sidebar";
import { pkpColors } from "@/lib/theme";

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

  const navItems = [
    {
      label: t("admin.dashboard"),
      href: "/admin",
      icon: Home,
      key: "dashboard",
    },
    {
      label: t("admin.hostedJournals"),
      href: "/admin/site-management/hosted-journals",
      icon: BookOpen,
      key: "hosted-journals",
    },
    {
      label: t("admin.siteSettings"),
      href: "/admin/site-settings/site-setup/settings",
      icon: Settings,
      key: "site-settings",
    },
    {
      label: t("admin.users"),
      href: "/admin/users",
      icon: Users,
      key: "users",
    },
    {
      label: t("admin.statistics"),
      href: "/admin/statistics",
      icon: BarChart3,
      key: "statistics",
    },
    {
      label: t("admin.administrativeFunctions"),
      href: "/admin/system/system-information",
      icon: Server,
      key: "admin-functions",
    },
  ];

  const siteSettingsSections = [
    {
      title: t("siteSettings.setup"),
      items: [
        { name: t("siteSettings.settings"), href: "/admin/site-settings/site-setup/settings" },
        { name: t("siteSettings.information"), href: "/admin/site-settings/site-setup/information" },
        { name: t("siteSettings.languages"), href: "/admin/site-settings/site-setup/languages" },
        { name: t("siteSettings.navigation"), href: "/admin/site-settings/site-setup/navigation" },
        { name: t("siteSettings.bulkEmails"), href: "/admin/site-settings/site-setup/bulk-emails" },
      ],
    },
    {
      title: t("siteSettings.appearance"),
      items: [
        { name: t("siteSettings.theme"), href: "/admin/site-settings/appearance/theme" },
        { name: t("siteSettings.appearance"), href: "/admin/site-settings/appearance/setup" },
      ],
    },
    {
      title: t("siteSettings.plugins"),
      items: [
        { name: t("siteSettings.installedPlugins"), href: "/admin/site-settings/plugins" },
        { name: t("siteSettings.pluginGallery"), href: "/admin/site-settings/plugins/gallery" },
      ],
    },
  ];

  const administrativeFunctionsSubmenu = [
    { name: t("admin.systemInformation"), href: "/admin/system/system-information" },
    { name: t("admin.expireUserSessions"), href: "/admin/system/expire-sessions" },
    { name: t("admin.clearDataCaches"), href: "/admin/system/clear-data-caches" },
    { name: t("admin.clearTemplateCache"), href: "/admin/system/clear-template-cache" },
    { name: t("admin.clearScheduledTaskExecutionLogs"), href: "/admin/system/clear-scheduled-tasks" },
  ];

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
          height: "60px"
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
          <div className="flex items-center gap-6">
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
                          href={journal.path ? `/${journal.path}` : `/journal/${journal.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" />
                          {journal.title}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </Dropdown>
            </div>
            {/* Tasks */}
            <div className="flex items-center gap-2">
              <span className="text-white text-base font-medium" style={{ fontSize: '1rem' }}>{t('admin.tasks')}</span>
              <span className="bg-gray-600 text-white rounded-full px-2 py-0.5 text-sm" style={{
                backgroundColor: '#4B5563',
                padding: '0.125rem 0.5rem',
                fontSize: '0.875rem',
                borderRadius: '9999px'
              }}>0</span>
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
        </div>
      </header>

      {/* Conditional Layout: Sidebar only on /admin page */}
      {pathname === '/admin' ? (
        // Dashboard layout with sidebar
        <div className="flex flex-1">
          {/* Sidebar - Only on dashboard */}
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} lg:block`}
            style={{
              backgroundColor: pkpColors.sidebarBg,
              minHeight: "calc(100vh - 60px)",
              width: "250px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "1.5rem 1rem", flexShrink: 0 }}>
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mb-4 p-2 rounded-md text-white transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* iamJOS Logo */}
              <div className="mb-8" style={{ marginBottom: "1.5rem" }}>
                <div className="flex items-baseline gap-2 mb-3">
                  <span
                    className="text-white font-bold"
                    style={{
                      fontSize: "2.5rem",
                      lineHeight: "1",
                      fontWeight: "bold",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    iam
                  </span>
                  <span
                    className="text-white font-bold"
                    style={{
                      fontSize: "3rem",
                      lineHeight: "1",
                      fontWeight: "bold",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    JOS
                  </span>
                </div>
                <div className="text-white uppercase tracking-wider opacity-85" style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  lineHeight: '1.5',
                  fontWeight: '500',
                  marginTop: '0.5rem'
                }}>
                  INTEGRATED ACADEMIC MANAGEMENT
                </div>
                <div className="text-white uppercase tracking-wider opacity-85" style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}>
                  JOURNAL OPERATION SYSTEM
                </div>
              </div>
            </div>

            {/* Site Administration heading */}
            <div style={{ padding: '0 1.5rem' }}>
              <h2 className="text-white font-bold" style={{
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>{t('admin.administration')}</h2>
            </div>
          </aside>

          {/* Main Content with sidebar */}
          <main
            className="flex-1 bg-white min-h-screen"
            style={{
              padding: "2rem 1.5rem",
              backgroundColor: "#ffffff",
              minHeight: "calc(100vh - 60px)"
            }}
          >
            {children}
          </main>
        </div>
      ) : (
        // Sub-pages layout without sidebar (full width)
        <main
          className="flex-1 bg-white min-h-screen"
          style={{
            padding: "2rem 1.5rem",
            backgroundColor: "#ffffff",
            minHeight: "calc(100vh - 60px)",
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%"
          }}
        >
          {children}
        </main>
      )}
    </div>
  );
}
