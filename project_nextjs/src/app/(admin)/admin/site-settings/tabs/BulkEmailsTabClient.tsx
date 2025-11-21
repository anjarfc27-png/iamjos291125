'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
        toast.success('Pengaturan email massal berhasil disimpan');
      } catch (error) {
        toast.error('Terjadi kesalahan saat menyimpan pengaturan');
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
          toast.success('Template email berhasil disimpan');
          setEditingTemplate(null);
        } else {
          toast.error(result.message || 'Gagal menyimpan template');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat menyimpan template');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email Logs
          </button>
        </nav>
      </div>

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-8">
          <div className="mb-8 space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Bulk Email Permissions
              </h2>
              <p className="mt-1 text-base text-gray-600">
                Tentukan jurnal yang diizinkan menggunakan fitur email massal.
              </p>
            </div>
            
            <p className="text-base text-gray-600">
              Fitur email massal dapat membantu mengirim pemberitahuan ke grup user
              tertentu. Pastikan mematuhi regulasi anti-spam.
            </p>
            
            <div className="space-y-3">
              {journals.map((journal) => (
                <label
                  key={journal.id}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
                >
                  <span className="font-semibold text-gray-900">
                    {journal.name}
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions[journal.id] || false}
                    onChange={(e) => handlePermissionChange(journal.id, e.target.checked)}
                    className="h-4 w-4 rounded border border-[var(--border)]"
                  />
                </label>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleSavePermissions}
                disabled={isPending}
              >
                {isPending ? 'Menyimpan...' : 'Simpan pengaturan'}
              </Button>
            </div>
          </div>

          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Catatan Kepatuhan
            </h2>
            <p className="text-base text-gray-600">
              Penggunaan email massal harus memperhatikan peraturan anti-spam dan
              kebijakan privasi. Pastikan setiap pengguna telah memberikan
              persetujuan sebelum menerima pesan massal.
            </p>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-8">
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Template Email
              </h2>
              <Button size="sm" variant="primary">
                Template Baru
              </Button>
            </div>
            <p className="text-base text-gray-600">
              Kelola template email untuk berbagai keperluan notifikasi.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <div key={template.id} className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit Template
                    </Button>
                    <Button size="sm" variant="outline">
                      Test Kirim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-8">
          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Riwayat Email Massal
            </h2>
            <p className="text-base text-gray-600">
              Lihat riwayat pengiriman email massal.
            </p>
            {logs.length > 0 ? (
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)]">
                <div className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{log.subject}</p>
                          <p className="text-sm text-gray-600">{log.recipient_email}</p>
                          {log.recipient_name && (
                            <p className="text-sm text-gray-500">{log.recipient_name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 'sent' ? 'bg-green-100 text-green-800' :
                            log.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status === 'sent' ? 'Terkirim' :
                             log.status === 'failed' ? 'Gagal' : 'Menunggu'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      {log.error_message && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {log.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada riwayat pengiriman email massal</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Template: {editingTemplate.template_name}</h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleSaveTemplate(formData);
            }} className="space-y-4">
              <input type="hidden" name="template_id" value={editingTemplate.id} />
              
              <div>
                <Label htmlFor="template_name">Nama Template</Label>
                <Input
                  id="template_name"
                  name="template_name"
                  defaultValue={editingTemplate.template_name}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subjek Email</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={editingTemplate.subject}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingTemplate.description}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="body">Isi Email</Label>
                <Textarea
                  id="body"
                  name="body"
                  defaultValue={editingTemplate.body}
                  rows={8}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan {'{{name}}'}, {'{{article_title}}'}, {'{{journal_name}}'} untuk variabel dinamis
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingTemplate.is_active}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_active" className="ml-2">
                  Template aktif
                </Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTemplate(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Menyimpan...' : 'Simpan Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}