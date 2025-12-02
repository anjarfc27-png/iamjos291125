"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { useAuth } from "@/contexts/AuthContext";
import { resetPermissions } from "@/features/editor/actions/tools";
import { useSupabase } from "@/providers/supabase-provider";
import { Download, Upload, Shield, AlertCircle, CheckCircle } from "lucide-react";

export default function ToolsPage() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [activeTab, setActiveTab] = useState("importexport");
  const [journalId, setJournalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Get current journal ID from user roles or first journal
  useEffect(() => {
    const fetchJournalId = async () => {
      try {
        // First, try to get journal ID from user roles (context_id)
        if (user?.roles && user.roles.length > 0) {
          const journalRole = user.roles.find((r) => r.context_id);
          if (journalRole?.context_id) {
            setJournalId(journalRole.context_id);
            return;
          }
        }

        // Fallback: Get first journal
        const { data: journals, error } = await supabase
          .from("journals")
          .select("id")
          .limit(1)
          .maybeSingle();
        
        if (!error && journals) {
          setJournalId(journals.id);
        } else if (error && error.code !== 'PGRST116') {
          console.error("Error fetching journal ID:", error);
        }
      } catch (error) {
        console.error("Error fetching journal ID:", error);
      }
    };

    if (user && supabase) {
      fetchJournalId();
    }
  }, [user, supabase]);

  // Check if user has manager or admin role
  const canResetPermissions = user?.roles?.some(
    (r) => r.role_path === "admin" || r.role_path === "manager"
  ) ?? false;

  const handleResetPermissions = async () => {
    if (!journalId) {
      setFeedback({
        type: "error",
        message: "Journal ID not found. Please refresh the page.",
      });
      return;
    }

    // Confirm action
    const confirmed = window.confirm(
      "Are you sure you want to reset permissions for all submissions in this journal? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const result = await resetPermissions(journalId);

      if (result.success) {
        setFeedback({
          type: "success",
          message: result.message,
        });
      } else {
        setFeedback({
          type: "error",
          message: result.error || result.message,
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to reset permissions",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Dummy import/export plugins list (similar to OJS 3.3)
  const importExportPlugins = [
    {
      name: "Native XML Plugin",
      description: "Import and export users, publications, and article metadata in native XML format.",
      enabled: true,
    },
    {
      name: "Users XML Plugin",
      description: "Import and export users in XML format.",
      enabled: true,
    },
    {
      name: "Articles XML Plugin",
      description: "Import and export articles and their metadata in XML format.",
      enabled: true,
    },
  ];

  return (
    <section style={{
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
            Tools
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Import and export content, and manage permissions for submissions.
          </p>
        </div>
      </div>

      {/* Tabs - OJS 3.3 Style */}
      <PkpTabs defaultValue="importexport" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div style={{
          borderBottom: "2px solid #e5e5e5",
          background: "#ffffff",
          padding: "0",
          position: "relative",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          margin: 0,
        }}>
          <div style={{ display: "flex", flex: 1, paddingLeft: "1.5rem" }}>
            <PkpTabsList style={{ flex: 1 }}>
              <PkpTabsTrigger value="importexport">
                Import/Export
              </PkpTabsTrigger>
              <PkpTabsTrigger value="permissions">
                Permissions
              </PkpTabsTrigger>
            </PkpTabsList>
          </div>
        </div>

        {/* Import/Export Tab Content */}
        <PkpTabsContent value="importexport" style={{
          position: "relative",
          padding: "1.5rem",
          backgroundColor: "#eaedee",
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <h3 style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#002C40",
            }}>
              Import/Export Plugins
            </h3>
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              The following import/export plugins are available. Click on a plugin to import or export data.
            </p>

            {importExportPlugins.length > 0 ? (
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}>
                {importExportPlugins.map((plugin, index) => (
                  <li
                    key={index}
                    style={{
                      padding: "1rem",
                      marginBottom: "0.5rem",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                    }}>
                      {plugin.enabled ? (
                        <Upload className="h-5 w-5" style={{ color: "#006798" }} />
                      ) : (
                        <Download className="h-5 w-5" style={{ color: "#666666" }} />
                      )}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Implement plugin action
                          alert(`Plugin "${plugin.name}" functionality will be implemented in the next phase.`);
                        }}
                        style={{
                          fontSize: "1rem",
                          fontWeight: 500,
                          color: plugin.enabled ? "#006798" : "#666666",
                          textDecoration: "none",
                          cursor: plugin.enabled ? "pointer" : "not-allowed",
                        }}
                        onMouseEnter={(e) => {
                          if (plugin.enabled) {
                            e.currentTarget.style.textDecoration = "underline";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                        }}
                      >
                        {plugin.name}
                      </a>
                    </div>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      margin: 0,
                      paddingLeft: "2rem",
                    }}>
                      {plugin.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                fontStyle: "italic",
              }}>
                No import/export plugins are currently available.
              </p>
            )}
          </div>
        </PkpTabsContent>

        {/* Permissions Tab Content */}
        <PkpTabsContent value="permissions" style={{
          position: "relative",
          padding: "1.5rem",
          backgroundColor: "#eaedee",
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <h3 style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#002C40",
            }}>
              Reset Permissions
            </h3>
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Reset permissions for all submissions in this journal. This will reset article permissions to their default values. This action cannot be undone.
            </p>

            {!canResetPermissions && (
              <div style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                <AlertCircle className="h-5 w-5" style={{ color: "#856404", flexShrink: 0 }} />
                <p style={{
                  fontSize: "0.875rem",
                  color: "#856404",
                  margin: 0,
                }}>
                  Only journal managers and site administrators can reset permissions.
                </p>
              </div>
            )}

            {feedback && (
              <div style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                border: `1px solid ${feedback.type === "success" ? "#28a745" : "#dc3545"}`,
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                {feedback.type === "success" ? (
                  <CheckCircle className="h-5 w-5" style={{ color: "#155724", flexShrink: 0 }} />
                ) : (
                  <AlertCircle className="h-5 w-5" style={{ color: "#721c24", flexShrink: 0 }} />
                )}
                <p style={{
                  fontSize: "0.875rem",
                  color: feedback.type === "success" ? "#155724" : "#721c24",
                  margin: 0,
                }}>
                  {feedback.message}
                </p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleResetPermissions();
              }}
            >
              <PkpButton
                type="submit"
                variant="warnable"
                disabled={!canResetPermissions || loading || !journalId}
                loading={loading}
              >
                {loading ? "Resetting..." : "Reset Permissions"}
              </PkpButton>
            </form>
          </div>
        </PkpTabsContent>
      </PkpTabs>
    </section>
  );
}