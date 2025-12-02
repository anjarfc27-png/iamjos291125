"use client";

import { Bell, BookOpen, ChevronDown, Home, Languages, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownSection,
} from "@/components/ui/dropdown";
import { useSupabase } from "@/providers/supabase-provider";
import type { User } from "@supabase/supabase-js";

export function TopBar() {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [journals, setJournals] = useState<
    { id: string; title: string; path: string }[]
  >([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [headerBg, setHeaderBg] = useState<string>("#1e40af"); // Warna biru OJS

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
          const nameMap = new Map<string, string>();
          (js ?? []).forEach((row: any) => {
            if (row.setting_value) nameMap.set(row.journal_id, row.setting_value as string);
          });
          rows = rows.map((j) => ({ ...j, title: j.title || nameMap.get(j.id) || j.path }));
        }
        setJournals(rows);
      } catch { }
    };
    fetchJournals();
  }, [supabase]);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data: s } = await supabase
          .from("site_settings")
          .select("logo_url")
          .eq("id", "site")
          .single();
        const { data: a } = await supabase
          .from("site_appearance")
          .select("show_logo,header_bg")
          .eq("id", "site")
          .single();
        const lu = (s as { logo_url?: string } | null)?.logo_url ?? null;
        const sl = Boolean((a as { show_logo?: boolean } | null)?.show_logo);
        const hb = (a as { header_bg?: string } | null)?.header_bg ?? "#1e40af";
        setLogoUrl(lu && lu.length ? lu : null);
        setShowLogo(sl);
        setHeaderBg(hb && hb.length ? hb : "#1e40af"); // Default warna biru OJS
      } catch { }
    };
    fetchBranding();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="app__header flex h-16 items-center justify-between border-b border-transparent px-6 shadow-sm" style={{ backgroundColor: headerBg, color: 'white' }}>
      <div className="app__contextTitle flex items-center gap-4">
        <div className="flex items-center gap-2">
          {showLogo && logoUrl ? (
            <Link href="/admin/dashboard" className="block">
              <img src={logoUrl} alt="Site Logo" className="h-7 w-auto" />
            </Link>
          ) : (
            <Link
              href="/admin/dashboard"
              className="text-lg font-semibold text-white hover:text-white/80"
              style={{ color: "#ffffff" }}>
              Open Journal Systems
            </Link>
          )}
        </div>

        {journals.length > 1 && (
          <Dropdown
            button={
              <>
                <ChevronDown size={14} />
                <span className="sr-only">Contexts</span>
              </>
            }
            align="left">
            <DropdownSection>
              <DropdownItem href="/admin/site-management/hosted-journals" icon={<Home size={14} />}>
                Site Administration
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              {journals.map((j) => (
                <DropdownItem
                  key={j.id}
                  href={`/admin/journals/${j.id}/settings`}
                  icon={<BookOpen size={14} />}>
                  {j.title}
                </DropdownItem>
              ))}
            </DropdownSection>
          </Dropdown>
        )}
      </div>

      {user && (
        <div className="app__headerAction flex items-center gap-4">
          {/* Tasks Button */}
          <Button
            variant="ghost"
            size="sm"
            className="app__headerAction relative gap-2 text-white hover:bg-white/10"
            style={{ color: 'white' }}>
            <Bell size={16} style={{ color: 'white' }} />
            <span className="sr-only">Tasks</span>
            <span className="app__tasksCount absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
              0
            </span>
          </Button>

          {/* User Dropdown */}
          <Dropdown
            button={
              <>
                <UserCircle size={18} style={{ color: 'white' }} />
                <span className="sr-only" style={{ color: 'white' }}>{user.email}</span>
              </>
            }
            align="right">
            <DropdownSection>
              {user.email && (
                <div className="px-4 py-2 text-xs font-semibold" style={{ color: '#333' }}>
                  {user.email}
                </div>
              )}
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                href="/admin/profile"
                icon={<UserCircle size={14} />}>
                Edit Profile
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem onClick={handleLogout} icon={<LogOut size={14} />}>
                Log Out
              </DropdownItem>
            </DropdownSection>
          </Dropdown>
        </div>
      )}

      {!user && (
        <div className="flex items-center gap-4 text-sm">
          <Dropdown
            button={
              <>
                <span className="flex items-center gap-1" style={{ color: 'white' }}>
                  <Languages size={16} style={{ color: 'white' }} />
                  English
                  <ChevronDown size={14} style={{ color: 'white' }} />
                </span>
              </>
            }
            align="right">
            <DropdownSection>
              <DropdownItem href="?locale=en">English</DropdownItem>
              <DropdownItem href="?locale=id">Indonesia</DropdownItem>
            </DropdownSection>
          </Dropdown>
          <Link
            href="/login"
            className="text-sm font-semibold hover:text-white/80"
            style={{ color: 'white' }}>
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
