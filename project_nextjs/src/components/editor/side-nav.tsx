"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Mail, 
  Inbox, 
  List, 
  Archive, 
  Settings, 
  FileEdit, 
  Eye, 
  BookOpen, 
  Megaphone, 
  Users, 
  Wrench,
  BarChart3,
  FileText,
  User
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "WORKFLOW",
    items: [
      { label: "Dashboard", href: "/editor", icon: LayoutDashboard },
      { label: "Unassigned", href: "/editor/submissions?queue=unassigned", icon: Mail },
      { label: "My Queue", href: "/editor/submissions?queue=my", icon: Inbox },
      { label: "All Active", href: "/editor/submissions", icon: List },
      { label: "Archived", href: "/editor/submissions?queue=archived", icon: Archive },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { label: "Production", href: "/editor/submissions?stage=production", icon: Settings },
      { label: "Copyediting", href: "/editor/submissions?stage=copyediting", icon: FileEdit },
      { label: "Review", href: "/editor/submissions?stage=review", icon: Eye },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Issues", href: "/editor/issues", icon: FileText },
      { label: "Announcements", href: "/editor/announcements", icon: Megaphone },
      { label: "Users & Roles", href: "/editor/users-roles", icon: Users },
      { label: "Settings: Workflow", href: "/editor/settings/workflow", icon: Settings },
    ],
  },
  {
    label: "STATISTICS",
    items: [
      { label: "Editorial", href: "/editor/statistics/editorial", icon: BarChart3 },
      { label: "Publications", href: "/editor/statistics/publications", icon: BookOpen },
      { label: "Users", href: "/editor/statistics/users", icon: User },
    ],
  },
];

export function EditorSideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="pkp_structure_sidebar" style={{padding: '1.5rem'}}>
      <nav className="pkp_nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="pkp_nav_group" style={{marginBottom: '2rem'}}>
            <h4 className="pkp_nav_group_title" style={{fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em'}}>
              {section.label}
            </h4>
            <ul className="pkp_nav_list" style={{listStyle: 'none', margin: 0, padding: 0}}>
              {section.items.map((item) => {
                const active = isActive(pathname, searchParams?.toString() ?? "", item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href} style={{margin: 0, marginBottom: '0.25rem'}}>
                    <Link
                      href={item.href}
                      className="pkp_nav_link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0',
                        color: active ? 'white' : 'rgba(255,255,255,0.9)',
                        textDecoration: 'none',
                        fontSize: '0.9375rem',
                        fontWeight: active ? '600' : '400',
                        borderLeft: active ? '4px solid white' : 'none',
                        paddingLeft: active ? '1rem' : '1.25rem',
                        backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                        transition: 'all 0.2s',
                        borderRadius: '4px'
                      }}
                    >
                      <Icon className="h-5 w-5" style={{flexShrink: 0}} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
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

