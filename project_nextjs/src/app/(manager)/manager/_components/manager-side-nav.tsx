"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";

type NavItem = {
  label: string;
  href?: string;
  isHeader?: boolean;
  children?: NavItem[];
};

const getManagerNavItems = (t: (key: string) => string): NavItem[] => [
  { label: t("editor.navigation.submissions") || "Submissions", href: "/manager" },
  { label: t("editor.navigation.issues") || "Issues", href: "/manager/issues" },
  {
    label: t("editor.navigation.settings") || "Settings",
    isHeader: true,
    children: [
      { label: t("editor.navigation.journal") !== "editor.navigation.journal" ? t("editor.navigation.journal") : "Journal", href: "/manager/settings/context" },
      { label: t("editor.navigation.website") || "Website", href: "/manager/settings/website" },
      { label: t("editor.navigation.workflow") || "Workflow", href: "/manager/settings/workflow" },
      { label: t("editor.navigation.distribution") || "Distribution", href: "/manager/settings/distribution" },
      { label: t("editor.navigation.usersRoles") || "Users & Roles", href: "/manager/users-roles" },
    ],
  },
  {
    label: t("editor.navigation.statistics") || "Statistics",
    isHeader: true,
    children: [
      { label: t("editor.navigation.articles") !== "editor.navigation.articles" ? t("editor.navigation.articles") : "Articles", href: "/manager/statistics/publications" },
      { label: t("editor.navigation.editorialActivity") !== "editor.navigation.editorialActivity" ? t("editor.navigation.editorialActivity") : "Editorial Activity", href: "/manager/statistics/editorial" },
      { label: t("editor.navigation.users") || "Users", href: "/manager/statistics/users" },
      { label: t("editor.navigation.reports") !== "editor.navigation.reports" ? t("editor.navigation.reports") : "Reports", href: "/manager/statistics/reports" },
    ],
  },
];

export function ManagerSideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useI18n();

  const navItems = useMemo(() => getManagerNavItems(t), [t]);
  const hasAdminRole = user?.roles?.some((role) => role.role_path === "admin");

  const isActive = (itemHref?: string) => {
    if (!itemHref) return false;
    if (itemHref === "/manager" && pathname === "/manager") return true;
    return pathname?.startsWith(itemHref) && itemHref !== "/manager";
  };

  return (
    <nav className="pkp_nav" style={{ padding: "0.5rem 0", width: "100%", overflowX: "hidden" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: "0 1rem", width: "100%" }}>
        {navItems.map((item, index) => (
          <li key={index} style={{ marginBottom: "0.25rem" }}>
            {item.isHeader ? (
              <div
                style={{
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: "0.75rem 0 0.25rem 0",
                  marginTop: "0.5rem",
                  textTransform: "none",
                  fontFamily: "Noto Sans, sans-serif"
                }}
              >
                {item.label}
              </div>
            ) : (
              <Link
                href={item.href || "#"}
                style={{
                  display: "block",
                  padding: "0.4rem 0.75rem",
                  color: isActive(item.href) ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                  backgroundColor: isActive(item.href) ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  borderRadius: "4px",
                  fontWeight: isActive(item.href) ? "600" : "400",
                  lineHeight: "1.4",
                  fontFamily: "Noto Sans, sans-serif"
                }}
              >
                {item.label}
              </Link>
            )}

            {item.children && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {item.children.map((child, childIndex) => (
                  <li key={childIndex} style={{ marginBottom: "0.125rem" }}>
                    <Link
                      href={child.href || "#"}
                      style={{
                        display: "block",
                        padding: "0.4rem 0.75rem",
                        color: isActive(child.href) ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                        backgroundColor: isActive(child.href) ? "rgba(255, 255, 255, 0.1)" : "transparent",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        borderRadius: "4px",
                        fontWeight: isActive(child.href) ? "600" : "400",
                        lineHeight: "1.4",
                        fontFamily: "Noto Sans, sans-serif"
                      }}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}

        {/* Tools - Separated Group */}
        <li style={{ marginTop: "1.5rem", marginBottom: "0.25rem" }}>
          <Link
            href="/manager/tools"
            style={{
              display: "block",
              padding: "0.4rem 0.75rem",
              color: isActive("/manager/tools") ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
              backgroundColor: isActive("/manager/tools") ? "rgba(255, 255, 255, 0.1)" : "transparent",
              textDecoration: "none",
              fontSize: "0.9rem",
              borderRadius: "4px",
              fontWeight: isActive("/manager/tools") ? "600" : "400",
              lineHeight: "1.4",
              fontFamily: "Noto Sans, sans-serif"
            }}
          >
            {t("editor.navigation.tools") || "Tools"}
          </Link>
        </li>

        {/* Administration - Grouped with Tools (No Separator) */}
        {hasAdminRole && (
          <li style={{ marginBottom: "0.25rem" }}>
            <Link
              href="/admin"
              style={{
                display: "block",
                padding: "0.4rem 0.75rem",
                color: "rgba(255, 255, 255, 0.7)",
                textDecoration: "none",
                fontSize: "0.9rem",
                borderRadius: "4px",
                fontFamily: "Noto Sans, sans-serif"
              }}
            >
              {t("navigation.admin") !== "navigation.admin" ? t("navigation.admin") : "Administration"}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

