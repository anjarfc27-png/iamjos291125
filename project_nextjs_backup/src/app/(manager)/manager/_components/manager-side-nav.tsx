"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";

type NavItem = {
  label: string;
  labelKey: string;
  href: string;
  submenu?: NavItem[];
};

const getManagerNavItems = (t: (key: string) => string): NavItem[] => [
  // Submissions – landing utama Manager (/manager) dengan tab My Queue/Unassigned/Active/Archives
  { label: t("editor.navigation.submissions"), labelKey: "editor.navigation.submissions", href: "/manager" },

  // Issues
  { label: t("editor.navigation.issues"), labelKey: "editor.navigation.issues", href: "/manager/issues" },

  // Announcements
  { label: t("editor.navigation.announcements"), labelKey: "editor.navigation.announcements", href: "/manager/announcements" },

  // Settings group – urutan persis seperti OJS 3.3
  {
    label: t("editor.navigation.settings"),
    labelKey: "editor.navigation.settings",
    href: "/manager/settings/context",
    submenu: [
      { label: t("editor.navigation.context"), labelKey: "editor.navigation.context", href: "/manager/settings/context" },
      { label: t("editor.navigation.website"), labelKey: "editor.navigation.website", href: "/manager/settings/website" },
      { label: t("editor.navigation.workflow"), labelKey: "editor.navigation.workflow", href: "/manager/settings/workflow" },
      { label: t("editor.navigation.distribution"), labelKey: "editor.navigation.distribution", href: "/manager/settings/distribution" },
      { label: t("editor.navigation.access"), labelKey: "editor.navigation.access", href: "/manager/settings/access" },
    ],
  },

  // People (Users & Roles)
  { label: t("editor.navigation.usersRoles"), labelKey: "editor.navigation.usersRoles", href: "/manager/users-roles" },

  // Tools
  { label: t("editor.navigation.tools"), labelKey: "editor.navigation.tools", href: "/manager/tools" },

  // Statistics group
  {
    label: t("editor.navigation.statistics"),
    labelKey: "editor.navigation.statistics",
    href: "/manager/statistics/editorial",
    submenu: [
      { label: t("editor.navigation.editorial"), labelKey: "editor.navigation.editorial", href: "/manager/statistics/editorial" },
      { label: t("editor.navigation.publications"), labelKey: "editor.navigation.publications", href: "/manager/statistics/publications" },
      { label: t("editor.navigation.users"), labelKey: "editor.navigation.users", href: "/manager/statistics/users" },
    ],
  },
];

export function ManagerSideNav() {
  // Force rebuild: Updated hierarchy to match OJS 3.3
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  const navItems = useMemo(() => getManagerNavItems(t), [t, locale]);
  const hasAdminRole = user?.roles?.some((role) => role.role_path === "admin");

  const shouldExpandSubmenu = (item: NavItem) => {
    if (!item.submenu) return false;
    return item.submenu.some((subItem) => isActive(pathname, searchParams?.toString() ?? "", subItem.href));
  };

  const autoOpenLabels = useMemo(() => {
    const detected = new Set<string>();
    navItems.forEach((item) => {
      if (item.submenu && shouldExpandSubmenu(item)) {
        detected.add(item.labelKey);
      }
      if (item.labelKey === "editor.navigation.settings" && pathname?.startsWith("/manager/settings")) {
        detected.add(item.labelKey);
      }
      if (item.labelKey === "editor.navigation.statistics" && pathname?.startsWith("/manager/statistics")) {
        detected.add(item.labelKey);
      }
    });
    return detected;
  }, [navItems, pathname, searchParams]);

  const toggleSubmenu = (labelKey: string) => {
    setOpenSubmenus((prev) => {
      const next = new Set(prev);
      if (next.has(labelKey)) {
        next.delete(labelKey);
      } else {
        next.add(labelKey);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(pathname, searchParams?.toString() ?? "", item.href);
    const isSubmenuOpen = item.submenu ? autoOpenLabels.has(item.labelKey) || openSubmenus.has(item.labelKey) : false;
    const hasActiveSubmenu = item.submenu ? shouldExpandSubmenu(item) : false;

    return (
      <li key={item.label} style={{ margin: 0 }}>
        {item.submenu ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.labelKey)}
              className="pkp_nav_link"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "0.875rem 1rem",
                marginBottom: "0.25rem",
                borderRadius: "0.25rem",
                color: hasActiveSubmenu ? "#ffffff" : "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: hasActiveSubmenu ? "600" : "400",
                backgroundColor: hasActiveSubmenu ? "rgba(255,255,255,0.15)" : "transparent",
                transition: "all 0.15s ease",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>{item.label}</span>
              <ChevronRight
                className="h-4 w-4"
                style={{
                  width: "16px",
                  height: "16px",
                  transition: "transform 0.2s ease",
                  transform: isSubmenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {isSubmenuOpen && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {item.submenu.map((subItem) => {
                  const subActive = isActive(pathname, searchParams?.toString() ?? "", subItem.href);
                  return (
                    <li key={subItem.href} style={{ margin: 0 }}>
                      <Link
                        href={subItem.href}
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem 0.75rem 2rem",
                          marginLeft: "0.5rem",
                          marginBottom: "0.125rem",
                          borderRadius: "0.25rem",
                          color: subActive ? "#ffffff" : "rgba(255,255,255,0.85)",
                          textDecoration: "none",
                          fontSize: "0.9375rem",
                          fontWeight: subActive ? "600" : "400",
                          backgroundColor: subActive ? "rgba(255,255,255,0.15)" : "transparent",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            className="pkp_nav_link"
            style={{
              display: "block",
              padding: "0.875rem 1rem",
              marginBottom: "0.25rem",
              borderRadius: "0.25rem",
              color: active ? "#ffffff" : "rgba(255,255,255,0.9)",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: active ? "600" : "400",
              backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
              transition: "all 0.15s ease",
            }}
          >
            {item.label}
          </Link>
        )}
      </li>
    );
  };

  return (
    <nav className="pkp_nav" style={{ padding: "0.5rem 0", width: "100%" }}>
      <ul
        className="pkp_nav_list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: "0 0.5rem",
          width: "100%",
        }}
      >
        {navItems.map((item) => renderNavItem(item))}
        {hasAdminRole && (
          <li style={{ margin: "0.5rem 0 0 0" }}>
            <Link
              href="/admin"
              style={{
                display: "block",
                padding: "0.875rem 1rem",
                borderRadius: "0.25rem",
                color: pathname?.startsWith("/admin") ? "#ffffff" : "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: pathname?.startsWith("/admin") ? "600" : "400",
                backgroundColor: pathname?.startsWith("/admin") ? "rgba(255,255,255,0.15)" : "transparent",
              }}
            >
              {t("navigation.admin")}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

function isActive(pathname: string, queryString: string, targetHref: string) {
  const [targetPath, targetQuery] = targetHref.split("?");

  if (targetPath === "/manager" && pathname === "/manager") {
    return true;
  }

  if (pathname !== targetPath) {
    return false;
  }
  if (!targetQuery) {
    return true;
  }
  const current = new URLSearchParams(queryString);
  const target = new URLSearchParams(targetQuery);
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) {
      return false;
    }
  }
  return true;
}

