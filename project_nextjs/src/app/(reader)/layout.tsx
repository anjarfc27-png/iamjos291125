'use client'

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Home, 
  BookOpen,
  Bell,
  LogOut,
  User,
  Globe,
  Search,
  FileText
} from "lucide-react";
import { Dropdown, DropdownItem, DropdownSection } from "@/components/ui/dropdown";
import { SiteSidebar } from "@/components/site/site-sidebar";
import { useSupabase } from "@/providers/supabase-provider";
import { pkpColors } from "@/lib/theme";

type JournalRow = {
  id: string | number;
  title?: string | null;
  name?: string | null;
  journal_title?: string | null;
  path?: string | null;
  slug?: string | null;
  journal_path?: string | null;
};

type JournalSettingRow = {
  journal_id: string;
  setting_value: string;
};

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
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
        const fetchedRows = (data ?? []) as JournalRow[];
        let rows = fetchedRows.map<{
          id: string;
          title: string;
          path: string;
        }>((r) => ({
          id: String(r.id),
          title: (r.title ?? r.name ?? r.journal_title ?? "") ?? "",
          path: (r.path ?? r.slug ?? r.journal_path ?? "") ?? "",
        }));
        const missingNameIds = rows.filter((j) => !j.title || j.title.trim().length === 0).map((j) => j.id);
        if (missingNameIds.length) {
          const { data: js } = await supabase
            .from("journal_settings")
            .select("journal_id, setting_value")
            .eq("setting_name", "name")
            .in("journal_id", missingNameIds);
          const nameRows = (js ?? []) as JournalSettingRow[];
          const nameMap = new Map(nameRows.map((j) => [j.journal_id, j.setting_value]));
          rows = rows.map((j) => {
            const overrideTitle = nameMap.get(j.id);
            return overrideTitle ? { ...j, title: overrideTitle } : j;
          });
        }
        setJournals(rows.filter((j) => j.title && j.title.trim().length > 0));
      } catch (error) {
        console.error("Error fetching journals:", error);
      }
    };
    fetchJournals();
  }, [supabase]);

  const navigation = [
    {
      name: "Browse Journals",
      href: "/reader",
      icon: BookOpen,
      current: pathname === "/reader"
    },
    {
      name: "Search",
      href: "/reader/search",
      icon: Search,
      current: pathname.startsWith("/reader/search")
    },
    {
      name: "My Reading List",
      href: "/reader/reading-list",
      icon: FileText,
      current: pathname.startsWith("/reader/reading-list")
    },
    {
      name: "Profile",
      href: "/reader/profile",
      icon: User,
      current: pathname.startsWith("/reader/profile")
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: pkpColors.pageBg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: pkpColors.headerBg }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLoginRedirect = () => {
    router.push(`/login?source=${encodeURIComponent(pathname)}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: pkpColors.pageBg }}>
      {/* Header */}
      <header
        className="text-white sticky top-0 z-50 shadow-lg"
        style={{
          backgroundColor: pkpColors.headerBg,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{padding: '1.25rem 1.5rem'}}>
          {/* Left side */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md transition-colors"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Dropdown
              button={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                  <span className="text-white font-semibold" style={{fontSize: '1.125rem', fontWeight: '600'}}>Open Journal Systems</span>
                  <ChevronDown className="h-5 w-5 text-white" />
                </div>
              }
              align="left"
            >
              <div className="bg-white rounded-md border border-gray-200 shadow-lg min-w-[250px] py-1">
                <Link 
                  href="/reader" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Reader Dashboard
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

          {/* Right side */}
          <div className="flex items-center gap-6">
            {/* Language */}
            <Dropdown
              button={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                  <Globe className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold" style={{fontSize: '1.125rem', fontWeight: '600'}}>English</span>
                  <ChevronDown className="h-5 w-5 text-white" />
                </div>
              }
              align="right"
            >
              <DropdownSection>
                <DropdownItem href="#" icon={<Globe className="h-4 w-4" />}>
                  English
                </DropdownItem>
                <DropdownItem href="#" icon={<Globe className="h-4 w-4" />}>
                  Bahasa Indonesia
                </DropdownItem>
                <DropdownItem href="#" icon={<Globe className="h-4 w-4" />}>
                  Français
                </DropdownItem>
                <DropdownItem href="#" icon={<Globe className="h-4 w-4" />}>
                  Español
                </DropdownItem>
              </DropdownSection>
            </Dropdown>

            {user ? (
              <>
                <Dropdown
                  button={
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity relative">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                  }
                  align="right"
                >
                  <DropdownSection>
                    <DropdownItem href="#" icon={<Bell className="h-4 w-4" />}>
                      No new notifications
                    </DropdownItem>
                  </DropdownSection>
                </Dropdown>

                <Dropdown
                  button={
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                      <User className="h-5 w-5 text-white" />
                      <span className="text-white font-semibold" style={{fontSize: '1.125rem', fontWeight: '600'}}>
                        {user.full_name || user.username || "Reader"}
                      </span>
                      <ChevronDown className="h-5 w-5 text-white" />
                    </div>
                  }
                  align="right"
                >
                  <DropdownSection>
                    <DropdownItem
                      onClick={async () => {
                        await logout();
                        router.push("/login");
                      }}
                      icon={<LogOut className="h-4 w-4" />}
                    >
                      Logout
                    </DropdownItem>
                  </DropdownSection>
                </Dropdown>
              </>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 rounded-md border border-white text-white font-semibold hover:bg-white hover:text-[#002C40] transition-colors"
                style={{ fontSize: "1rem" }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Blue OJS Theme - Sama seperti Editor, plus OJS 3.3-style blocks */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} lg:block text-white min-h-screen shadow-xl`}
          style={{
            backgroundColor: pkpColors.sidebarBg,
            width: "16rem",
            minHeight: "calc(100vh - 80px)",
            boxShadow: "4px 0 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="p-6" style={{padding: '1.5rem 1.25rem'}}>
            {/* iamJOS Logo - Smaller */}
            <div className="mb-6" style={{marginBottom: '1.5rem'}}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white font-bold" style={{
                  fontSize: '1.75rem',
                  lineHeight: '1',
                  fontWeight: 'bold',
                  letterSpacing: '-0.02em'
                }}>
                  iam
                </span>
                <span className="text-white font-bold" style={{
                  fontSize: '2rem',
                  lineHeight: '1',
                  fontWeight: 'bold',
                  letterSpacing: '-0.02em'
                }}>
                  JOS
                </span>
              </div>
            </div>

            {/* Navigation - Font lebih besar */}
            <nav className="space-y-3" style={{gap: '0.75rem'}}>
              {navigation.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-all"
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: '1.0625rem',
                      fontWeight: item.current ? '600' : '500',
                      borderRadius: '0.5rem',
                      color: item.current ? '#002C40' : 'white',
                      backgroundColor: item.current ? '#ffffff' : 'transparent'
                    }}
                    onClick={() => setSidebarOpen(false)}
                    onMouseEnter={(e) => {
                      if (!item.current) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.current) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3" style={{gap: '0.75rem'}}>
                      <Icon 
                        className={item.current ? "h-5 w-5 text-[#002C40]" : "h-5 w-5 text-white"} 
                        style={{
                          width: '1.25rem', 
                          height: '1.25rem', 
                          color: item.current ? '#002C40' : 'white'
                        }} 
                      />
                      <span 
                        style={{
                          color: item.current ? '#002C40' : 'white',
                          fontWeight: item.current ? '600' : '500'
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* OJS 3.3-style sidebar blocks (Administration, dll.) */}
            <SiteSidebar />
          </div>
        </aside>

        {/* Main Content - Background lebih terang */}
        <main className="flex-1 bg-white" style={{
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          fontSize: '1.0625rem',
          lineHeight: '1.6'
        }}>
          {/* Breadcrumb - Font lebih besar */}
          <div className="mb-6" style={{marginBottom: '1.5rem'}}>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-2" style={{gap: '0.5rem'}}>
                <li className="inline-flex items-center">
                  <Link href="/reader" className="text-gray-700 hover:text-[#002C40] inline-flex items-center font-medium" style={{
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    <Home className="w-5 h-5 mr-2" style={{width: '1.25rem', height: '1.25rem'}} />
                    Reader
                  </Link>
                </li>
                {pathname.split('/').slice(2).map((segment, index, array) => {
                  const href = '/reader/' + array.slice(0, index + 1).join('/');
                  const isLast = index === array.length - 1;
                  
                  return (
                    <li key={index}>
                      <div className="flex items-center">
                        <span className="text-gray-400 mx-2" style={{margin: '0 0.5rem'}}>/</span>
                        {isLast ? (
                          <span className="text-gray-900 capitalize font-semibold" style={{
                            fontSize: '1rem',
                            fontWeight: '600'
                          }}>
                            {segment.replace('-', ' ')}
                          </span>
                        ) : (
                          <Link 
                            href={href} 
                            className="text-gray-700 hover:text-[#002C40] capitalize font-medium" style={{
                              fontSize: '1rem',
                              fontWeight: '500'
                            }}
                          >
                            {segment.replace('-', ' ')}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}

