import Link from "next/link";

import { AdminActionLink } from "@/components/admin/admin-action-link";

const SITE_MANAGEMENT_LINKS = [
  {
    label: "Hosted Journals",
    href: "/admin/site-management/hosted-journals",
  },
  {
    label: "Site Settings",
    href: "/admin/site-settings/site-setup",
  },
];

const ADMIN_FUNCTIONS_LINKS = [
  {
    label: "System Information",
    href: "/admin/system/system-information",
    actionType: "link" as const,
  },
  {
    label: "Expire User Sessions",
    href: "/admin/system/expire-sessions",
    actionType: "form" as const,
    confirmMessage: "Tindakan ini akan mengeluarkan seluruh pengguna. Lanjutkan?",
  },
  {
    label: "Clear Data Caches",
    href: "/admin/system/clear-data-caches",
    actionType: "form" as const,
  },
  {
    label: "Clear Template Cache",
    href: "/admin/system/clear-template-cache",
    actionType: "form" as const,
  },
  {
    label: "Clear Scheduled Task Execution Logs",
    href: "/admin/system/clear-scheduled-tasks",
    actionType: "form" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="pkp_structure_page">
      {/* Page Heading - OJS 3.3 Style */}
      <h1 className="app__pageHeading" style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#002C40'
      }}>
        Site Administration
      </h1>

      {/* Content Panel - OJS 3.3 Style */}
      <div className="app__contentPanel" style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Site Management Section */}
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          color: '#002C40'
        }}>
          Site Management
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          marginBottom: '2rem'
        }}>
          {SITE_MANAGEMENT_LINKS.map((link) => (
            <li key={link.href} style={{ marginBottom: '0.5rem' }}>
              <Link 
                href={link.href} 
                style={{
                  color: '#006798',
                  textDecoration: 'underline',
                  fontSize: '0.875rem'
                }}
                className="hover:no-underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Administrative Functions Section */}
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          color: '#002C40'
        }}>
          Administrative Functions
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {ADMIN_FUNCTIONS_LINKS.map((link) => (
            <li key={link.href} style={{ marginBottom: '0.5rem' }}>
              {link.actionType === "form" ? (
                <AdminActionLink href={link.href} confirmMessage={link.confirmMessage}>
                  {link.label}
                </AdminActionLink>
              ) : (
                <Link 
                  href={link.href} 
                  style={{
                    color: '#006798',
                    textDecoration: 'underline',
                    fontSize: '0.875rem'
                  }}
                  className="hover:no-underline"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
