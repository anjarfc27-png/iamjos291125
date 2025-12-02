'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pkpColors, pkpTypography } from '@/lib/theme';
import { createJournalAction } from '../actions';

export default function CreateJournalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeLocale, setActiveLocale] = useState('en_US');

  const [formData, setFormData] = useState({
    title: '',
    initials: '',
    abbreviation: '',
    description: '',
    path: '',
    publisher: '',
    issnOnline: '',
    issnPrint: '',
    languages: ['en_US'] as string[],
    primaryLocale: 'en_US',
    isPublic: true
  });

  const availableLocales = [
    { code: 'en_US', label: 'English' },
    { code: 'es_ES', label: 'Español (España)' },
    { code: 'id_ID', label: 'Bahasa Indonesia' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createJournalAction({
        title: formData.title,
        initials: formData.initials,
        abbreviation: formData.abbreviation,
        publisher: formData.publisher,
        issnOnline: formData.issnOnline,
        issnPrint: formData.issnPrint,
        path: formData.path,
        description: formData.description,
        isPublic: formData.isPublic,
      });

      if (result.success && result.journalId) {
        // Redirect to journal settings wizard
        router.push(`/admin/journals/${result.journalId}/settings/wizard`);
      } else if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error creating journal:', err);
      setError(err.message || 'Failed to create journal');
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
      if (formData.languages.length > 1) {
        setFormData({
          ...formData,
          languages: formData.languages.filter(l => l !== lang)
        });
      }
    } else {
      setFormData({
        ...formData,
        languages: [...formData.languages, lang]
      });
    }
  };

  return (
    <div style={{
      fontFamily: pkpTypography.fontFamily,
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem 0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${pkpColors.borderSubtle}`
      }}>
        <h1 style={{
          fontSize: pkpTypography.sectionTitle,
          fontWeight: pkpTypography.bold,
          color: pkpColors.textDark,
          margin: 0
        }}>
          Create Journal
        </h1>
        <button
          type="button"
          onClick={() => router.push('/admin/site-management')}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: pkpColors.textGray
          }}
        >
          ×
        </button>
      </div>

      {/* Language Tabs */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '2rem',
        borderBottom: `1px solid ${pkpColors.borderSubtle}`
      }}>
        {availableLocales.map(locale => (
          <button
            key={locale.code}
            type="button"
            onClick={() => setActiveLocale(locale.code)}
            style={{
              padding: '0.75rem 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeLocale === locale.code ? `3px solid ${pkpColors.primary}` : 'none',
              color: activeLocale === locale.code ? pkpColors.primary : pkpColors.textGray,
              fontWeight: pkpTypography.semibold,
              fontSize: pkpTypography.bodyRegular,
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            {locale.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          color: '#c00'
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Journal Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Journal title <span style={{ color: '#c00' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: `1px solid ${pkpColors.borderSubtle}`,
              borderRadius: '4px',
              fontSize: pkpTypography.bodyRegular,
              fontFamily: pkpTypography.fontFamily
            }}
          />
        </div>

        {/* Journal Initials */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Journal initials <span style={{ color: '#c00' }}>*</span>
          </label>
          <input
            type="text"
            required
            maxLength={16}
            value={formData.initials}
            onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
            style={{
              width: '200px',
              padding: '0.625rem 0.75rem',
              border: `1px solid ${pkpColors.borderSubtle}`,
              borderRadius: '4px',
              fontSize: pkpTypography.bodyRegular,
              fontFamily: pkpTypography.fontFamily
            }}
            placeholder="e.g., JSD"
          />
        </div>

        {/* Journal Abbreviation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Journal Abbreviation
          </label>
          <input
            type="text"
            maxLength={32}
            value={formData.abbreviation}
            onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: `1px solid ${pkpColors.borderSubtle}`,
              borderRadius: '4px',
              fontSize: pkpTypography.bodyRegular,
              fontFamily: pkpTypography.fontFamily
            }}
          />
        </div>

        {/* Publisher */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Publisher
          </label>
          <input
            type="text"
            maxLength={128}
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: `1px solid ${pkpColors.borderSubtle}`,
              borderRadius: '4px',
              fontSize: pkpTypography.bodyRegular,
              fontFamily: pkpTypography.fontFamily
            }}
            placeholder="Organization or institution name"
          />
        </div>

        {/* ISSNs */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: pkpTypography.semibold,
              fontSize: pkpTypography.bodyRegular,
              color: pkpColors.textDark,
            }}>
              ISSN (Online)
            </label>
            <input
              type="text"
              maxLength={32}
              value={formData.issnOnline}
              onChange={(e) => setFormData({ ...formData, issnOnline: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: `1px solid ${pkpColors.borderSubtle}`,
                borderRadius: '4px',
                fontSize: pkpTypography.bodyRegular,
                fontFamily: pkpTypography.fontFamily
              }}
              placeholder="e.g., 1234-5678"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: pkpTypography.semibold,
              fontSize: pkpTypography.bodyRegular,
              color: pkpColors.textDark,
            }}>
              ISSN (Print)
            </label>
            <input
              type="text"
              maxLength={32}
              value={formData.issnPrint}
              onChange={(e) => setFormData({ ...formData, issnPrint: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: `1px solid ${pkpColors.borderSubtle}`,
                borderRadius: '4px',
                fontSize: pkpTypography.bodyRegular,
                fontFamily: pkpTypography.fontFamily
              }}
              placeholder="e.g., 1234-5678"
            />
          </div>
        </div>

        {/* Journal Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Journal description
          </label>
          <div style={{
            border: `1px solid ${pkpColors.borderSubtle}`,
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {/* Simple toolbar */}
            <div style={{
              background: '#f8f9fa',
              padding: '0.5rem',
              borderBottom: `1px solid ${pkpColors.borderSubtle}`,
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button type="button" style={{ padding: '0.25rem 0.5rem', border: '1px solid #ddd', background: 'white', borderRadius: '3px', cursor: 'pointer' }}>
                <strong>B</strong>
              </button>
              <button type="button" style={{ padding: '0.25rem 0.5rem', border: '1px solid #ddd', background: 'white', borderRadius: '3px', cursor: 'pointer' }}>
                <em>I</em>
              </button>
              <button type="button" style={{ padding: '0.25rem 0.5rem', border: '1px solid #ddd', background: 'white', borderRadius: '3px', cursor: 'pointer' }}>
                Link
              </button>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: 'none',
                fontSize: pkpTypography.bodyRegular,
                fontFamily: pkpTypography.fontFamily,
                resize: 'vertical'
              }}
              placeholder="Describe the focus and scope of this journal..."
            />
          </div>
        </div>

        {/* Path */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Path <span style={{ color: '#c00' }}>*</span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <span style={{ color: pkpColors.textGray, fontSize: pkpTypography.bodySmall }}>
              http://localhost/
            </span>
            <input
              type="text"
              required
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              style={{
                flex: 1,
                padding: '0.625rem 0.75rem',
                border: `1px solid ${pkpColors.borderSubtle}`,
                borderRadius: '4px',
                fontSize: pkpTypography.bodyRegular,
                fontFamily: pkpTypography.fontFamily
              }}
              placeholder="journal-path"
            />
          </div>
          <small style={{ color: pkpColors.textGray, fontSize: pkpTypography.bodySmall }}>
            A unique path that will determine this journal's URL
          </small>
        </div>

        {/* Languages */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          border: `1px solid ${pkpColors.borderSubtle}`,
          borderRadius: '4px',
          background: '#f8f9fa'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '1rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Languages <span style={{ color: '#c00' }}>*</span>
          </label>
          {availableLocales.map(locale => (
            <div key={locale.code} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.languages.includes(locale.code)}
                  onChange={() => toggleLanguage(locale.code)}
                  style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                />
                <span style={{ fontSize: pkpTypography.bodyRegular }}>{locale.label}</span>
              </label>
            </div>
          ))}
        </div>

        {/* Primary Locale */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          border: `1px solid ${pkpColors.borderSubtle}`,
          borderRadius: '4px',
          background: '#f8f9fa'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '1rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Primary locale <span style={{ color: '#c00' }}>*</span>
          </label>
          {formData.languages.map(locale => {
            const localeInfo = availableLocales.find(l => l.code === locale);
            return (
              <div key={locale} style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="primaryLocale"
                    value={locale}
                    checked={formData.primaryLocale === locale}
                    onChange={(e) => setFormData({ ...formData, primaryLocale: e.target.value })}
                    style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: pkpTypography.bodyRegular }}>{localeInfo?.label}</span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Enable Journal */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          border: `1px solid ${pkpColors.borderSubtle}`,
          borderRadius: '4px',
          background: '#f8f9fa'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '1rem',
            fontWeight: pkpTypography.semibold,
            fontSize: pkpTypography.bodyRegular,
            color: pkpColors.textDark,
          }}>
            Enable
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: pkpTypography.bodyRegular }}>
              Enable this journal to appear publicly on the site
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${pkpColors.borderSubtle}`
        }}>
          <button
            type="button"
            onClick={() => router.push('/admin/site-management')}
            style={{
              padding: '0.625rem 1.5rem',
              backgroundColor: '#f3f4f6',
              color: pkpColors.textDark,
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: pkpTypography.bodyRegular,
              fontWeight: pkpTypography.semibold,
              cursor: 'pointer',
              fontFamily: pkpTypography.fontFamily
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.625rem 1.5rem',
              backgroundColor: pkpColors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: pkpTypography.bodyRegular,
              fontWeight: pkpTypography.semibold,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: pkpTypography.fontFamily
            }}
          >
            {loading ? 'Creating...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
