"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Bell, User, LogOut, Network } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/providers/supabase-provider";
import { LanguageSwitcher } from "@/components/admin/language-switcher";
import { useI18n } from "@/contexts/I18nContext";
import { ManagerSideNav } from "./_components/manager-side-nav";
import { pkpColors } from "@/lib/theme";

type Props = {
  children: ReactNode;
};

export default function ManagerLayout({ children }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout } = useAuth();
  const supabase = useSupabase();
  const [journals, setJournals] = useState<{ id: string; title: string; path: string }[]>([]);
  const [journalDropdownOpen, setJournalDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const journalDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?source=/manager");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (journalDropdownRef.current && !journalDropdownRef.current.contains(event.target as Node)) {
        setJournalDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    if (journalDropdownOpen || userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [journalDropdownOpen, userDropdownOpen]);

  const currentJournalId = searchParams?.get("journal");
  const currentJournal = journals.find((j) => j.id === currentJournalId) || journals[0];

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: pkpColors.pageBg,
        }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: pkpColors.pageBg,
        display: "flex",
      }}
    >
      {/* Sidebar - PKP style */}
      <aside
        style={{
          width: "256px",
          backgroundColor: pkpColors.sidebarBg,
          color: pkpColors.sidebarText,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Top Section: Logo/Dropdown + Journal Name */}
        <div
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            // borderBottom removed as per request
          }}
        >
          {/* Network icon, separator, journal title, and dropdown */}
          <div ref={journalDropdownRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.25rem",
                color: "#ffffff",
              }}
              title="Select Journal"
            >
              <Network size={24} strokeWidth={2} />
            </button>

            {/* Dropdown Menu */}
            {journalDropdownOpen && journals.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "0.5rem",
                  minWidth: "220px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "0.375rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  zIndex: 100,
                }}
              >
                {journals.map((journal) => (
                  <Link
                    key={journal.id}
                    href={`/manager?journal=${journal.id}`}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "#000000",
                      textDecoration: "none",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                    onClick={() => setJournalDropdownOpen(false)}
                  >
                    {journal.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Vertical Separator */}
          <div
            style={{
              width: "1px",
              height: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              flexShrink: 0,
            }}
          />

          {/* Journal Name */}
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#ffffff",
              fontFamily: "Noto Sans, sans-serif",
              lineHeight: "1.2",
            }}
          >
            {currentJournal?.title || "Select Journal"}
          </div>
        </div>
        {/* Navigation */}
        <div
          style={{
            padding: "1.5rem 0.75rem",
            flex: 1,
            overflowY: "auto",
          }}
        >
          <ManagerSideNav />
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header - pkpColors.headerBg */}
        <header
          style={{
            backgroundColor: pkpColors.headerBg,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            padding: "0.5rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end", // Align items to the right
            height: "60px",
          }}
        >
          {/* Right: Tasks, Language, User */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Tasks (Bell) */}
            <button
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: '#ffffff',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={t('common.tasks')}
            >
              <Bell style={{ height: '1.25rem', width: '1.25rem' }} />
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: '#d9534f',
                color: 'white',
                borderRadius: '50%',
                padding: '0.1rem 0.3rem',
                fontSize: '0.65rem',
                fontWeight: 'bold'
              }}>
                0
              </span>
            </button>

            <LanguageSwitcher />

            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
              >
                <User style={{ height: '1.25rem', width: '1.25rem' }} />
                <span>{user?.username || 'admin'}</span>
                <ChevronDown style={{ height: '1rem', width: '1rem' }} />
              </button>
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  minWidth: '200px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 50
                }}>
                  <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <Link
                      href="/manager/profile"
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none'
                      }}
                    >
                      {t('user.profile')}
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: '#000000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut style={{ height: '1rem', width: '1rem' }} />
                      {t('user.logOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - OJS-style grey background */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "#eaedee",
          }}
        >
          <div
            style={{
              padding: "2rem",
              maxWidth: "100%",
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
