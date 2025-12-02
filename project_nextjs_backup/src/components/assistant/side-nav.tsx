"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight } from "lucide-react";

// Navigation items structure for Editorial Assistant (OJS 3.3)
interface NavItem {
  label: string;
  href: string;
  submenu?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/assistant" },
  { label: "Submissions", href: "/assistant/submissions" },
  { label: "Tasks", href: "/assistant/tasks" },
];

export function AssistantSideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  // Check if user has admin role
  const hasAdminRole = user?.roles?.some(r => r.role_path === "admin");

  // Check if any submenu item is active to auto-expand
  const shouldExpandSubmenu = (item: NavItem): boolean => {
    if (!item.submenu) return false;
    return item.submenu.some(subItem => 
      isActive(pathname, searchParams?.toString() ?? "", subItem.href)
    );
  };

  const autoOpenLabels = useMemo(() => {
    const detected = new Set<string>();
    NAV_ITEMS.forEach(item => {
      if (item.submenu && shouldExpandSubmenu(item)) {
        detected.add(item.label);
      }
    });
    return detected;
  }, [pathname, searchParams]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(pathname, searchParams?.toString() ?? "", item.href);
    const isSubmenuOpen = item.submenu ? autoOpenLabels.has(item.label) || openSubmenus.has(item.label) : false;
    const hasActiveSubmenu = item.submenu ? shouldExpandSubmenu(item) : false;

    return (
      <li key={item.label} style={{ margin: 0 }}>
        {item.submenu ? (
          <>
            {/* Parent item with submenu */}
            <button
              onClick={() => toggleSubmenu(item.label)}
              className="pkp_nav_link"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.875rem 1rem',
                marginBottom: '0.25rem',
                borderRadius: '0.25rem',
                color: hasActiveSubmenu ? '#ffffff' : 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: hasActiveSubmenu ? '600' : '400',
                backgroundColor: hasActiveSubmenu ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.15s ease',
                border: 'none',
                background: hasActiveSubmenu ? 'rgba(255,255,255,0.15)' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!hasActiveSubmenu) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasActiveSubmenu) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }
              }}
            >
              <span>{item.label}</span>
              <ChevronRight
                className="h-4 w-4"
                style={{
                  width: '16px',
                  height: '16px',
                  transition: 'transform 0.2s ease',
                  transform: isSubmenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {/* Submenu items */}
            {isSubmenuOpen && (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                }}
              >
                {item.submenu.map((subItem) => {
                  const subActive = isActive(pathname, searchParams?.toString() ?? "", subItem.href);
                  return (
                    <li key={subItem.href} style={{ margin: 0 }}>
                      <Link
                        href={subItem.href}
                        className="pkp_nav_link"
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem 0.75rem 2rem',
                          marginLeft: '0.5rem',
                          marginBottom: '0.125rem',
                          borderRadius: '0.25rem',
                          color: subActive ? '#ffffff' : 'rgba(255,255,255,0.85)',
                          textDecoration: 'none',
                          fontSize: '0.9375rem',
                          fontWeight: subActive ? '600' : '400',
                          backgroundColor: subActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!subActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!subActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                          }
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
          /* Regular menu item */
          <Link
            href={item.href}
            className="pkp_nav_link"
            style={{
              display: 'block',
              padding: '0.875rem 1rem',
              marginBottom: '0.25rem',
              borderRadius: '0.25rem',
              color: active ? '#ffffff' : 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: active ? '600' : '400',
              backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              }
            }}
          >
            {item.label}
          </Link>
        )}
      </li>
    );
  };

  return (
    <nav className="pkp_nav hide-scrollbar" style={{
      padding: '0.5rem 0',
      overflowY: 'auto',
      height: 'calc(100vh - 220px)',
      width: '100%',
    }}>
      <ul
        className="pkp_nav_list"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: '0 0.5rem',
          width: '100%',
        }}
      >
        {NAV_ITEMS.map(renderNavItem)}
        {/* Conditional Admin link */}
        {hasAdminRole && (
          <li style={{ margin: 0 }}>
            <Link
              href="/admin"
              className="pkp_nav_link"
              style={{
                display: 'block',
                padding: '0.875rem 1rem',
                marginTop: '0.5rem',
                marginBottom: '0.25rem',
                borderRadius: '0.25rem',
                color: pathname?.startsWith('/admin') ? '#ffffff' : 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: pathname?.startsWith('/admin') ? '600' : '400',
                backgroundColor: pathname?.startsWith('/admin') ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!pathname?.startsWith('/admin')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname?.startsWith('/admin')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }
              }}
            >
              Admin
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

function isActive(pathname: string, queryString: string, targetHref: string) {
  const [targetPath, targetQuery] = targetHref.split("?");
  
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

