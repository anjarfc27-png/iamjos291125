'use client';

import { useState } from "react";

// Dummy plugin gallery data
const GALLERY_PLUGINS = [
  {
    id: "citation-style-language",
    name: "Citation Style Language",
    description: "Support for Citation Style Language (CSL) citation formatting.",
    version: "1.0.0",
    author: "PKP",
    category: "generic",
    installed: false,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Add Google Analytics tracking code to your site.",
    version: "1.2.0",
    author: "PKP",
    category: "generic",
    installed: true,
  },
  {
    id: "orcid-profile",
    name: "ORCID Profile",
    description: "Allow users to connect their ORCID profile.",
    version: "2.1.0",
    author: "PKP",
    category: "generic",
    installed: false,
  },
  {
    id: "custom-block-manager",
    name: "Custom Block Manager",
    description: "Manage custom content blocks in the sidebar.",
    version: "1.5.0",
    author: "PKP",
    category: "generic",
    installed: true,
  },
  {
    id: "doaj-export",
    name: "DOAJ Export",
    description: "Export metadata to DOAJ format.",
    version: "1.0.0",
    author: "PKP",
    category: "importexport",
    installed: false,
  },
  {
    id: "crossref-xml",
    name: "Crossref XML Export",
    description: "Export metadata to Crossref XML format.",
    version: "2.0.0",
    author: "PKP",
    category: "importexport",
    installed: true,
  },
];

type Plugin = (typeof GALLERY_PLUGINS)[0];

export default function PluginGalleryPage() {
  const [plugins, setPlugins] = useState(GALLERY_PLUGINS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(plugins.map((p) => p.category)))];

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (plugin: Plugin) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === plugin.id ? { ...p, installed: true } : p))
    );
    alert(`Plugin "${plugin.name}" installed successfully`);
  };

  const handleUninstall = (plugin: Plugin) => {
    if (confirm(`Are you sure you want to uninstall "${plugin.name}"?`)) {
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, installed: false } : p))
      );
      alert(`Plugin "${plugin.name}" uninstalled successfully`);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        padding: "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: '#002C40',
          margin: 0
        }}>
          Plugin Gallery
        </h2>
      </header>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 0', minWidth: '200px', maxWidth: '28rem' }}>
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                fontSize: "0.875rem",
                padding: "0.5rem 0.75rem",
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              height: '2.75rem',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: '#fff',
              padding: '0 0.75rem',
              fontSize: "0.875rem",
              fontFamily: 'inherit'
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plugin Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            style={{
              padding: "1rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: '#002C40',
                  margin: 0
                }}>
                  {plugin.name}
                </h3>
                {plugin.installed && (
                  <span style={{
                    fontSize: "0.75rem",
                    color: '#155724',
                    backgroundColor: '#d4edda',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    Installed
                  </span>
                )}
              </div>
              <p style={{
                fontSize: "0.875rem",
                color: '#666',
                marginBottom: "0.75rem",
                margin: '0 0 0.75rem 0'
              }}>
                {plugin.description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: "0.75rem",
                color: '#666'
              }}>
                <span>v{plugin.version}</span>
                <span>By {plugin.author}</span>
              </div>
            </div>
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              {plugin.installed ? (
                <button
                  onClick={() => handleUninstall(plugin)}
                  style={{
                    flex: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Uninstall
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(plugin)}
                  style={{
                    flex: 1,
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
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem'
        }}>
          <p style={{
            color: '#666',
            fontSize: '0.875rem'
          }}>
            No plugins found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    all: "All Categories",
    generic: "Generic",
    importexport: "Import/Export",
    metadata: "Metadata",
    reports: "Reports & Tools",
  };
  return labels[category] ?? category;
}
