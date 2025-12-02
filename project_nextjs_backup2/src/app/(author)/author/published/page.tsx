'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Calendar, Eye, Download, ExternalLink } from 'lucide-react';

import { withAuth } from '@/lib/auth-client'

function AuthorPublished() {
  const { user } = useAuth();
  const [articles] = useState([
    {
      id: 1,
      title: 'Digital Literacy in Higher Education: Challenges and Opportunities',
      journal: 'Journal of Educational Technology',
      volume: 'Vol. 15 No. 2',
      pages: '123-145',
      publication_date: '2024-01-15',
      doi: '10.1234/jet.2024.15.2.123',
      citations: 8,
      downloads: 156
    },
    {
      id: 2,
      title: 'The Role of Artificial Intelligence in Modern Education',
      journal: 'International Journal of Learning Technologies',
      volume: 'Vol. 12 No. 3',
      pages: '78-102',
      publication_date: '2023-11-20',
      doi: '10.5678/ijlt.2023.12.3.78',
      citations: 15,
      downloads: 234
    },
    {
      id: 3,
      title: 'Online Assessment Methods: A Comparative Study',
      journal: 'Educational Research Review',
      volume: 'Vol. 8 No. 1',
      pages: '45-67',
      publication_date: '2023-08-10',
      doi: '10.9876/err.2023.8.1.45',
      citations: 23,
      downloads: 412
    }
  ]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Published Articles
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          View your published research articles
        </p>
      </div>

      {/* Stats Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Total Published
            </h3>
            <BookOpen style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {articles.length}
          </div>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Total Citations
            </h3>
            <Calendar style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {articles.reduce((sum, article) => sum + article.citations, 0)}
          </div>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Total Downloads
            </h3>
            <BookOpen style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {articles.reduce((sum, article) => sum + article.downloads, 0)}
          </div>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Avg. Citations
            </h3>
            <Calendar style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {Math.round(articles.reduce((sum, article) => sum + article.citations, 0) / articles.length)}
          </div>
        </div>
      </div>

      {/* Publication History Table - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0
          }}>
            Publication History
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e5e5e5'
              }}>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Title
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Journal
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Volume/Issue
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Publication Date
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  DOI
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Citations
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Downloads
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr 
                  key={article.id}
                  style={{
                    borderBottom: '1px solid #e5e5e5',
                    backgroundColor: '#fff'
                  }}
                >
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5',
                    maxWidth: '300px'
                  }}>
                    <div style={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {article.title}
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      backgroundColor: '#e2e3e5',
                      color: '#383d41',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      {article.journal}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    {article.volume}
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    {article.publication_date}
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      backgroundColor: '#e2e3e5',
                      color: '#383d41',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      {article.doi}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      backgroundColor: '#d1ecf1',
                      color: '#0c5460',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      {article.citations}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      {article.downloads}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #d5d5d5',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="View Article"
                      >
                        <Eye style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #d5d5d5',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Download"
                      >
                        <Download style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #d5d5d5',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="External Link"
                      >
                        <ExternalLink style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AuthorPublished, 'author')