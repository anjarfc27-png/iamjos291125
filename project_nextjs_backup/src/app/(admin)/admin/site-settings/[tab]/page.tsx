import { notFound } from "next/navigation";
import Link from "next/link";

import { SITE_SETTING_TABS, type SiteSettingTab } from "@/config/navigation";
import {
  getSiteSettings,
  updateSiteSettingsAction,
  getSitePlugins,
  toggleSitePluginAction,
  getSiteInformation,
  updateSiteInformationAction,
  getSiteLanguages,
  updateSiteLanguagesAction,
  installLocaleAction,
  getSiteNavigation,
  updateSiteNavigationAction,
  getBulkEmailPermissions,
  updateBulkEmailPermissionsAction,
} from "../actions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import BulkEmailsTabClient from "../tabs/BulkEmailsTabClient";

type Props = {
  params: Promise<{ tab: SiteSettingTab }>;
};

export default async function SiteSettingsTabPage({ params }: Props) {
  const { tab } = await params;

  if (!SITE_SETTING_TABS.includes(tab)) {
    notFound();
  }

  const initial = await getSiteSettings();
  const plugins = await getSitePlugins();
  const information = await getSiteInformation();
  const languages = await getSiteLanguages();
  const navigation = await getSiteNavigation();
  const bulkEmailPerms = await getBulkEmailPermissions();
  const supabase = getSupabaseAdminClient();
  const { data: journalRows } = await supabase
    .from("journals")
    .select("id,title,path")
    .order("created_at", { ascending: true });
  const journals = (journalRows ?? []).map((j: any) => ({ id: String(j.id), name: String(j.title ?? j.path ?? j.id) }));

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {tab === "site-setup" && <SiteSetupTab initial={initial} information={information} />}
      {tab === "languages" && <LanguagesTab initial={languages} />}
      {tab === "plugins" && <PluginsTab items={plugins} />}
      {tab === "navigation-menus" && <NavigationMenusTab initial={navigation} />}
      {tab === "bulk-emails" && <BulkEmailsTabClient journals={journals} initial={bulkEmailPerms} templates={[]} logs={[]} />}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      marginBottom: '2rem'
    }}>
      <div style={{
        marginBottom: '1rem'
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#002C40',
          margin: 0
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            {description}
          </p>
        )}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {children}
      </div>
    </div>
  );
}

function SiteSetupTab({ initial, information }: { initial: Awaited<ReturnType<typeof getSiteSettings>>; information: Awaited<ReturnType<typeof getSiteInformation>> }) {
  return (
    <>
      <Section
        title="Site Configuration"
        description="OJS 3.3 PKPSiteConfigForm: title, redirect, minPasswordLength"
      >
        <form action={async (formData) => {
          "use server";
          await updateSiteSettingsAction(formData);
        }} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label
              htmlFor="title"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#002C40'
              }}
            >
              Site title <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={initial.title}
              required
              style={{
                maxWidth: '28rem',
                fontSize: "0.875rem",
                padding: "0.5rem 0.75rem",
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#666',
              margin: 0
            }}>
              The title of this installation as it should appear in web browser titles.
            </p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label
              htmlFor="minPasswordLength"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#002C40'
              }}
            >
              Minimum password length <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              id="minPasswordLength"
              name="minPasswordLength"
              type="number"
              min={6}
              max={64}
              defaultValue={initial.minPasswordLength}
              required
              style={{
                maxWidth: '12rem',
                fontSize: "0.875rem",
                padding: "0.5rem 0.75rem",
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              type="submit"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#006798',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </Section>

      <Section
        title="Contact Information"
        description="OJS 3.3 PKPSiteInformationForm: about, contactName, contactEmail, privacyStatement"
      >
        <form action={async (formData) => {
          "use server";
          await updateSiteInformationAction(formData);
        }} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label
              htmlFor="about"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#002C40'
              }}
            >
              About
            </label>
            <textarea
              id="about"
              name="about"
              rows={6}
              defaultValue={information.about || ""}
              style={{
                width: '100%',
                maxWidth: '42rem',
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#666',
              margin: 0
            }}>
              A brief description of this installation that will appear on the homepage.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <label
                htmlFor="contactName"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#002C40'
                }}
              >
                Contact name <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                defaultValue={information.contactName || ""}
                required
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.75rem",
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
                htmlFor="contactEmail"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#002C40'
                }}
              >
                Contact email <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={information.contactEmail || ""}
                required
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.75rem",
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label
              htmlFor="privacyStatement"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#002C40'
              }}
            >
              Privacy statement
            </label>
            <textarea
              id="privacyStatement"
              name="privacyStatement"
              rows={8}
              defaultValue={information.privacyStatement || ""}
              style={{
                width: '100%',
                maxWidth: '42rem',
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#666',
              margin: 0
            }}>
              A statement describing the privacy policy for this installation.
            </p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '1rem'
          }}>
            <button
              type="submit"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#006798',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simpan Informasi
            </button>
          </div>
        </form>
      </Section>
    </>
  );
}

function LanguagesTab({ initial }: { initial: Awaited<ReturnType<typeof getSiteLanguages>> }) {
  return (
    <>
      <Section
        title="Available Locales"
        description="Aktifkan bahasa yang dapat digunakan oleh jurnal di situs ini."
      >
        <form action={async (formData) => {
          "use server";
          await updateSiteLanguagesAction(formData);
        }} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {initial.enabled_locales.map((locale) => (
              <label
                key={locale}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#f8f9fa',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  name="enabled_locales"
                  value={locale}
                  defaultChecked={true}
                  style={{ cursor: 'pointer' }}
                />
                <span>{locale}</span>
                {locale === initial.default_locale && (
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#006798',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Default
                  </span>
                )}
              </label>
            ))}
          </div>
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <Link
              href="/admin/site-settings/site-setup/languages"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#f8f9fa',
                color: '#006798',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Install Locale
            </Link>
            <button
              type="submit"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#006798',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simpan
            </button>
          </div>
        </form>
      </Section>

      <Section
        title="Language Settings"
        description="Atur bahasa antarmuka dan form input."
      >
        <form action={async (formData) => {
          "use server";
          await updateSiteLanguagesAction(formData);
        }} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label
              htmlFor="primary-locale"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#002C40'
              }}
            >
              Primary Locale
            </label>
            <select
              id="primary-locale"
              name="default_locale"
              defaultValue={initial.default_locale}
              style={{
                width: '100%',
                height: '2.75rem',
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit',
                backgroundColor: '#fff'
              }}
            >
              {initial.enabled_locales.map((locale) => (
                <option key={locale} value={locale}>{locale}</option>
              ))}
            </select>
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#666',
              margin: 0
            }}>
              Bahasa default akan digunakan pada kunjungan pertama pengguna.
            </p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              type="submit"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#006798',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simpan
            </button>
          </div>
        </form>
      </Section>
    </>
  );
}

function PluginsTab({ items }: { items: Awaited<ReturnType<typeof getSitePlugins>> }) {
  const grouped = items.reduce<Record<string, typeof items>>((acc, plugin) => {
    const key = plugin.category ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(plugin);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <>
      <Section title="Installed Plugins" description="Manage plugins that are currently installed on this site.">
        <div style={{ marginBottom: '1rem' }}>
          <Link
            href="/admin/site-settings/plugins/gallery"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Browse Plugin Gallery
          </Link>
        </div>
      </Section>
      {categories.map((category) => (
        <Section key={category} title={getPluginCategoryLabel(category)}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {grouped[category].map((plugin) => (
              <div
                key={plugin.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#002C40',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {plugin.name}
                  </h3>
                  <p style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#666',
                    margin: 0
                  }}>
                    {plugin.description}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <form
                    action={async (formData: FormData) => {
                      'use server'
                      await toggleSitePluginAction(formData)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <input type="hidden" name="plugin_id" value={plugin.id} />
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={plugin.enabled}
                        style={{
                          width: '1rem',
                          height: '1rem',
                          cursor: 'pointer'
                        }}
                      />
                      Aktif
                    </label>
                    <button
                      type="submit"
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
                      Save
                    </button>
                  </form>
                  <button
                    type="button"
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
                    Konfigurasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function getPluginCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    generic: "Generic Plugins",
    importexport: "Import/Export Plugins",
    metadata: "Metadata Plugins",
    reports: "Reports & Tools",
  };
  return labels[category] ?? category.replace(/(^|\s)\w/g, (c) => c.toUpperCase());
}

function NavigationMenusTab({ initial }: { initial: Awaited<ReturnType<typeof getSiteNavigation>> }) {
  return (
    <>
      <Section title="Primary Navigation" description="Menu utama yang tampil di bagian atas halaman depan jurnal.">
        <form action={async (formData) => {
          "use server";
          await updateSiteNavigationAction(formData);
        }} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {initial.primary.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#fff',
                  fontSize: '0.875rem'
                }}
              >
                <span style={{ color: '#002C40' }}>{item}</span>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    type="button"
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
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'transparent',
                      color: '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
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
              Tambah Item
            </button>
          </div>
        </form>
      </Section>

      <Section title="User Navigation" description="Menu untuk user yang tampil di pojok kanan atas saat login.">
        <form action={updateSiteNavigationAction} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {initial.user.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#fff',
                  fontSize: '0.875rem'
                }}
              >
                <span style={{ color: '#002C40' }}>{item}</span>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    type="button"
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
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'transparent',
                      color: '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
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
              Tambah Item
            </button>
          </div>
        </form>
      </Section>
    </>
  );
}
