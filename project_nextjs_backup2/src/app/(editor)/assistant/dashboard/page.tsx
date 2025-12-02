"use client";

import Link from "next/link";
import { FileText, Users, ClipboardList, Inbox } from "lucide-react";
import { useAssistantTasks } from "@/features/assistant/hooks/useAssistantTasks";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function AssistantDashboardPage() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useAssistantTasks();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  // Load submissions
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user) {
        setSubmissionsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/editor/assistant/submissions");
        const data = await response.json();

        if (response.ok && data.ok) {
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error("Error loading submissions:", error);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    loadSubmissions();
  }, [user]);
  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0",
      }}>
        <div style={{
          padding: "0 1.5rem",
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            Dashboard
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Welcome to the Editorial Assistant Dashboard. View your assigned tasks and submissions.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>
        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: 0,
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '1.25rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
              }}>
                My Tasks
              </span>
              <ClipboardList className="h-5 w-5" style={{color: '#006798', width: '20px', height: '20px'}} />
            </div>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: '600',
              color: '#002C40',
            }}>
              {tasksLoading ? '...' : tasks.length}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '1.25rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
              }}>
                Assigned Submissions
              </span>
              <FileText className="h-5 w-5" style={{color: '#006798', width: '20px', height: '20px'}} />
            </div>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: '600',
              color: '#002C40',
            }}>
              {submissionsLoading ? '...' : submissions.length}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '1.25rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
              }}>
                Pending Reviews
              </span>
              <Users className="h-5 w-5" style={{color: '#006798', width: '20px', height: '20px'}} />
            </div>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: '600',
              color: '#002C40',
            }}>
              --
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '1.25rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#666666',
                fontWeight: '500',
              }}>
                Inbox
              </span>
              <Inbox className="h-5 w-5" style={{color: '#006798', width: '20px', height: '20px'}} />
            </div>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: '600',
              color: '#002C40',
            }}>
              --
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginBottom: '2.5rem',
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#002C40',
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            <Link
              href="/assistant/submissions"
              style={{
                display: 'block',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006798';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}>
                <FileText className="h-5 w-5" style={{color: '#006798', width: '20px', height: '20px'}} />
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#002C40',
                  margin: 0,
                }}>
                  View Submissions
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#666666',
                margin: 0,
                lineHeight: '1.5',
              }}>
                View submissions assigned to you
              </p>
            </Link>

            <Link
              href="/assistant/tasks"
              style={{
                display: 'block',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006798';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}>
                <ClipboardList className="h-5 w-5" style={{color: '#006798', width: '20px', height: '20px'}} />
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#002C40',
                  margin: 0,
                }}>
                  My Tasks
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#666666',
                margin: 0,
                lineHeight: '1.5',
              }}>
                View and manage your assigned tasks
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#002C40',
          }}>
            Recent Activity
          </h2>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '2rem',
            textAlign: 'center',
            color: '#666666',
          }}>
            <p style={{
              fontSize: '0.9375rem',
              margin: 0,
            }}>
              No recent activity to display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

