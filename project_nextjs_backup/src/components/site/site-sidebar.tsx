"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type SidebarConfig = {
  sidebar: string[];
};

/**
 * SiteSidebar
 * - Membaca konfigurasi sidebar dari /api/site-sidebar
 * - Menampilkan blok "Administration" ala OJS 3.3 jika diaktifkan
 * - Dipakai di layout pembaca (reader) atau layout publik lain
 */
export function SiteSidebar() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SidebarConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSidebar() {
      try {
        const res = await fetch("/api/site-sidebar", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean; sidebar: string[] };
        if (!json.ok) return;
        if (!cancelled) {
          setConfig({ sidebar: json.sidebar ?? [] });
        }
      } catch {
        // Ignore, fallback: no sidebar blocks
      }
    }
    loadSidebar();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config) {
    return null;
  }

  const enabled = new Set(config.sidebar);

  // Tampilkan blok Administration hanya jika:
  // - Diaktifkan di pengaturan Sidebar
  // - User punya peran admin/manager (mendekati perilaku OJS)
  const canSeeAdmin =
    !!user &&
    Array.isArray(user.roles) &&
    user.roles.some((r) => {
      const rolePath = r.role_path?.toLowerCase();
      return rolePath === "admin" || rolePath === "manager";
    });

  const showAdministrationBlock = enabled.has("administration") && canSeeAdmin;

  if (!showAdministrationBlock) {
    return null;
  }

  const adminLinks: { href: string; label: string }[] = [
    { href: "/admin", label: "Site Administration" },
    { href: "/admin/site-management/hosted-journals", label: "Hosted Journals" },
    { href: "/admin/site-settings/site-setup", label: "Site Settings" },
    { href: "/admin/system/system-information", label: "System Information" },
    { href: "/admin/system/expire-sessions", label: "Expire User Sessions" },
    { href: "/admin/system/clear-data-caches", label: "Clear Data Caches" },
    { href: "/admin/system/clear-template-cache", label: "Clear Template Cache" },
    { href: "/admin/system/clear-scheduled-tasks", label: "Clear Scheduled Task Logs" },
  ];

  return (
    <div
      style={{
        marginTop: "2rem",
        paddingTop: "0.75rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.16)",
      }}
    >
      {/* Safe area wrapper */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "0.375rem",
          backgroundColor: "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.8)",
            marginBottom: "0.5rem",
          }}
        >
          Administration
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {adminLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  color: "#ffffff",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                  padding: "0.125rem 0",
                  lineHeight: 1.4,
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


