'use client';

import { useState, useTransition } from 'react';

// Gunakan tipe yang lebih sederhana agar kompatibel dengan parser Turbopack
type Props = {
  initial: any;
  installedLocales: any[];
  updateAction: (formData: FormData) => Promise<void>;
  installAction: (formData: FormData) => Promise<void>;
};

export default function LanguagesPageClient({ initial, installedLocales, updateAction, installAction }: Props) {
  const [isInstalling, startInstall] = useTransition();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [localeToInstall, setLocaleToInstall] = useState('');

  return (
    <>
      <form action={updateAction} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            Pilih bahasa yang akan diaktifkan untuk digunakan oleh jurnal di situs ini.
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {installedLocales.map((locale) => {
              if (!locale) return null;
              return (
                <label
                  key={locale.code}
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
                    value={locale.code}
                    defaultChecked={initial.enabled_locales.includes(locale.code)}
                    style={{
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    {locale.label}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#666'
                  }}>
                    ({locale.nativeName})
                  </span>
                  {initial.default_locale === locale.code && (
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
              );
            })}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="default_locale"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Primary Locale
          </label>
          <select
            id="default_locale"
            name="default_locale"
            defaultValue={initial.default_locale}
            style={{
              width: '100%',
              height: '2.75rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              backgroundColor: '#fff'
            }}
          >
            {installedLocales.map((locale) => {
              if (!locale) return null;
              return (
                <option key={locale.code} value={locale.code}>
                  {locale.label} ({locale.nativeName})
                </option>
              );
            })}
          </select>
          <p style={{
            marginTop: '0.25rem',
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Bahasa default akan digunakan pada kunjungan pertama pengguna.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={() => setShowInstallDialog(true)}
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
            Install Locale
          </button>
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
            Save
          </button>
        </div>
      </form>

      {/* Install Locale Dialog */}
      {showInstallDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#002C40',
              margin: '0 0 1rem 0'
            }}>
              Install Locale
            </h3>
            <form action={(formData) => {
              startInstall(async () => {
                await installAction(formData);
                setShowInstallDialog(false);
                setLocaleToInstall('');
                window.location.reload();
              });
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <label
                  htmlFor="locale_code"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: '#002C40'
                  }}
                >
                  Locale Code
                </label>
                <input
                  id="locale_code"
                  name="locale_code"
                  type="text"
                  value={localeToInstall}
                  onChange={(e) => setLocaleToInstall(e.target.value)}
                  placeholder="e.g., en_US, id_ID"
                  required
                  style={{
                    fontSize: "0.875rem",
                    padding: "0.5rem 0.75rem",
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: '#666',
                  margin: 0
                }}>
                  Enter locale code (e.g., en_US, id_ID, fr_FR)
                </p>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowInstallDialog(false);
                    setLocaleToInstall('');
                  }}
                  disabled={isInstalling}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f8f9fa',
                    color: '#006798',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: isInstalling ? 'not-allowed' : 'pointer',
                    opacity: isInstalling ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInstalling || !localeToInstall}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: isInstalling || !localeToInstall ? '#ccc' : '#006798',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isInstalling || !localeToInstall ? 'not-allowed' : 'pointer',
                    opacity: isInstalling || !localeToInstall ? 0.6 : 1
                  }}
                >
                  {isInstalling ? 'Installing...' : 'Install'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

