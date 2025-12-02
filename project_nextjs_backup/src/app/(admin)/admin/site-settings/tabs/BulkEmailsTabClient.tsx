'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateBulkEmailPermissionsAction, updateEmailTemplateAction } from '../actions';

interface Journal {
  id: string;
  name: string;
  allow: boolean;
}

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  body: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface BulkEmailsTabClientProps {
  journals: Array<{ id: string; name: string }>;
  initial: { permissions: Array<{ id: string; allow: boolean }> };
  templates: EmailTemplate[];
  logs: Array<{
    id: string;
    template_id: string;
    recipient_email: string;
    recipient_name?: string;
    subject: string;
    status: 'pending' | 'sent' | 'failed';
    sent_at?: string;
    error_message?: string;
    created_at: string;
  }>;
}

export default function BulkEmailsTabClient({ journals, initial, templates, logs }: BulkEmailsTabClientProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => {
    const perms: Record<string, boolean> = {};
    journals.forEach(journal => {
      const existing = initial.permissions.find(p => p.id === journal.id);
      perms[journal.id] = existing ? existing.allow : false;
    });
    return perms;
  });
  const [isPending, startTransition] = useTransition();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'templates' | 'logs'>('permissions');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePermissionChange = (journalId: string, allow: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [journalId]: allow
    }));
  };

  const handleSavePermissions = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        
        journals.forEach(journal => {
          formData.append('journal_id', journal.id);
          if (permissions[journal.id]) {
            formData.append('allow_journal', journal.id);
          }
        });

        await updateBulkEmailPermissionsAction(formData);
        setNotification({ type: 'success', message: 'Pengaturan email massal berhasil disimpan' });
      } catch (error) {
        setNotification({ type: 'error', message: 'Terjadi kesalahan saat menyimpan pengaturan' });
      }
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
  };

  const handleSaveTemplate = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateEmailTemplateAction(formData);
        
        if (result.success) {
          setNotification({ type: 'success', message: 'Template email berhasil disimpan' });
          setEditingTemplate(null);
          window.location.reload();
        } else {
          setNotification({ type: 'error', message: result.message || 'Gagal menyimpan template' });
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'Terjadi kesalahan saat menyimpan template' });
      }
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1000,
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '0.875rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '2rem'
      }}>
        <nav style={{
          display: 'flex',
          gap: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('permissions')}
            type="button"
            style={{
              padding: '0.5rem 0.25rem',
              borderBottom: activeTab === 'permissions' ? '2px solid #006798' : '2px solid transparent',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: activeTab === 'permissions' ? '#006798' : '#666',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            type="button"
            style={{
              padding: '0.5rem 0.25rem',
              borderBottom: activeTab === 'templates' ? '2px solid #006798' : '2px solid transparent',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: activeTab === 'templates' ? '#006798' : '#666',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            type="button"
            style={{
              padding: '0.5rem 0.25rem',
              borderBottom: activeTab === 'logs' ? '2px solid #006798' : '2px solid transparent',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: activeTab === 'logs' ? '#006798' : '#666',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Email Logs
          </button>
        </nav>
      </div>

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#002C40',
                margin: '0 0 0.25rem 0'
              }}>
                Bulk Email Permissions
              </h2>
              <p style={{
                marginTop: '0.25rem',
                fontSize: '1rem',
                color: '#666',
                margin: 0
              }}>
                Tentukan jurnal yang diizinkan menggunakan fitur email massal.
              </p>
            </div>
            
            <p style={{
              fontSize: '1rem',
              color: '#666',
              marginBottom: '1rem'
            }}>
              Fitur email massal dapat membantu mengirim pemberitahuan ke grup user
              tertentu. Pastikan mematuhi regulasi anti-spam.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '2rem'
            }}>
              {journals.map((journal) => (
                <label
                  key={journal.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    {journal.name}
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions[journal.id] || false}
                    onChange={(e) => handlePermissionChange(journal.id, e.target.checked)}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      cursor: 'pointer'
                    }}
                  />
                </label>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '1rem'
            }}>
              <button
                onClick={handleSavePermissions}
                disabled={isPending}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  backgroundColor: isPending ? '#ccc' : '#006798',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1
                }}
              >
                {isPending ? 'Menyimpan...' : 'Simpan pengaturan'}
              </button>
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#002C40',
              margin: '0 0 0.75rem 0'
            }}>
              Catatan Kepatuhan
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0
            }}>
              Penggunaan email massal harus memperhatikan peraturan anti-spam dan
              kebijakan privasi. Pastikan setiap pengguna telah memberikan
              persetujuan sebelum menerima pesan massal.
            </p>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#002C40',
                margin: 0
              }}>
                Template Email
              </h2>
              <button
                type="button"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#006798',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Template Baru
              </button>
            </div>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              marginBottom: '1rem'
            }}>
              Kelola template email untuk berbagai keperluan notifikasi.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: 0
                    }}>
                      {template.template_name}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: template.is_active ? '#d4edda' : '#e2e3e5',
                      color: template.is_active ? '#155724' : '#383d41',
                      fontWeight: 600
                    }}>
                      {template.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    marginBottom: '0.75rem'
                  }}>
                    {template.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleEditTemplate(template)}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#f8f9fa',
                        color: '#006798',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit Template
                    </button>
                    <button
                      type="button"
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        padding: '0.375rem 0.75rem',
                        backgroundColor: 'transparent',
                        color: '#006798',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Test Kirim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#002C40',
              margin: '0 0 0.75rem 0'
            }}>
              Riwayat Email Massal
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              marginBottom: '1rem'
            }}>
              Lihat riwayat pengiriman email massal.
            </p>
            {logs.length > 0 ? (
              <div style={{
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                backgroundColor: '#f8f9fa'
              }}>
                <div>
                  {logs.map((log, index) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '1rem',
                        borderTop: index > 0 ? '1px solid #e5e5e5' : 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#002C40',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {log.subject}
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#666',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {log.recipient_email}
                          </p>
                          {log.recipient_name && (
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#666',
                              margin: 0
                            }}>
                              {log.recipient_name}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.125rem 0.625rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            backgroundColor:
                              log.status === 'sent' ? '#d4edda' :
                              log.status === 'failed' ? '#f8d7da' :
                              '#fff3cd',
                            color:
                              log.status === 'sent' ? '#155724' :
                              log.status === 'failed' ? '#721c24' :
                              '#856404'
                          }}>
                            {log.status === 'sent' ? 'Terkirim' :
                             log.status === 'failed' ? 'Gagal' : 'Menunggu'}
                          </span>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            marginTop: '0.25rem',
                            margin: '0.25rem 0 0 0'
                          }}>
                            {new Date(log.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      {log.error_message && (
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#d32f2f'
                        }}>
                          Error: {log.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1rem'
                }}>
                  <p style={{
                    color: '#666',
                    fontSize: '0.875rem'
                  }}>
                    Belum ada riwayat pengiriman email massal
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setEditingTemplate(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '4px',
              padding: '1.5rem',
              maxWidth: '42rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid #e5e5e5',
              paddingBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#002C40',
                margin: 0
              }}>
                Edit Template: {editingTemplate.template_name}
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                type="button"
                style={{
                  fontSize: '1.5rem',
                  color: '#666',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleSaveTemplate(formData);
            }} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <input type="hidden" name="template_id" value={editingTemplate.id} />
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label
                  htmlFor="template_name"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#002C40'
                  }}
                >
                  Nama Template
                </label>
                <input
                  id="template_name"
                  name="template_name"
                  type="text"
                  defaultValue={editingTemplate.template_name}
                  required
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label
                  htmlFor="subject"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#002C40'
                  }}
                >
                  Subjek Email
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  defaultValue={editingTemplate.subject}
                  required
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label
                  htmlFor="description"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#002C40'
                  }}
                >
                  Deskripsi
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  defaultValue={editingTemplate.description}
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label
                  htmlFor="body"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#002C40'
                  }}
                >
                  Isi Email
                </label>
                <textarea
                  id="body"
                  name="body"
                  defaultValue={editingTemplate.body}
                  rows={8}
                  required
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  margin: 0
                }}>
                  Gunakan {'{{name}}'}, {'{{article_title}}'}, {'{{journal_name}}'} untuk variabel dinamis
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingTemplate.is_active}
                  style={{
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <label
                  htmlFor="is_active"
                  style={{
                    fontSize: '0.875rem',
                    color: '#002C40',
                    cursor: 'pointer'
                  }}
                >
                  Template aktif
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e5e5'
              }}>
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f8f9fa',
                    color: '#006798',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: isPending ? '#ccc' : '#006798',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.6 : 1
                  }}
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Template'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
