'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, Eye, Download, Award } from 'lucide-react';

const submissionData = [
  { month: 'Jan', submissions: 2, published: 0 },
  { month: 'Feb', submissions: 1, published: 1 },
  { month: 'Mar', submissions: 3, published: 0 },
  { month: 'Apr', submissions: 2, published: 2 },
  { month: 'May', submissions: 1, published: 1 },
  { month: 'Jun', submissions: 4, published: 1 },
];

const citationData = [
  { month: 'Jan', citations: 5 },
  { month: 'Feb', citations: 8 },
  { month: 'Mar', citations: 12 },
  { month: 'Apr', citations: 15 },
  { month: 'May', citations: 23 },
  { month: 'Jun', citations: 31 },
];

const stageDistribution = [
  { name: 'Submission', value: 2, color: '#ef4444' },
  { name: 'Review', value: 1, color: '#f97316' },
  { name: 'Copyediting', value: 1, color: '#3b82f6' },
  { name: 'Production', value: 3, color: '#10b981' },
];

import { withAuth } from '@/lib/auth-client'

function AuthorStatistics() {
  const { user } = useAuth();

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
          Author Statistics
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          View your publication statistics and metrics
        </p>
      </div>

      {/* Summary Cards */}
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Total Submissions
            </h3>
            <FileText style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#002C40', marginBottom: '0.25rem' }}>
            13
          </div>
          <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>+2 from last month</p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Published Articles
            </h3>
            <Award style={{ width: '1rem', height: '1rem', color: '#00B24E' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00B24E', marginBottom: '0.25rem' }}>
            5
          </div>
          <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>38.5% acceptance rate</p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Total Citations
            </h3>
            <TrendingUp style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#006798', marginBottom: '0.25rem' }}>
            31
          </div>
          <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>+8 this month</p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Total Downloads
            </h3>
            <Download style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#006798', marginBottom: '0.25rem' }}>
            802
          </div>
          <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>+156 this month</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Submissions vs Published (6 Months)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={submissionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submissions" fill="#006798" name="Submissions" />
              <Bar dataKey="published" fill="#00B24E" name="Published" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Citation Trend (6 Months)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={citationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="citations" stroke="#006798" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Current Submissions by Stage
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Performance Metrics
            </h3>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#002C40' }}>Acceptance Rate</span>
              <span style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                38.5%
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#002C40' }}>Average Review Time</span>
              <span style={{
                backgroundColor: '#d1ecf1',
                color: '#0c5460',
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                8.2 days
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#002C40' }}>Average Time to Publication</span>
              <span style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                45 days
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#002C40' }}>H-Index</span>
              <span style={{
                backgroundColor: '#e7d4f8',
                color: '#6f42c1',
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                3
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#002C40' }}>i10-Index</span>
              <span style={{
                backgroundColor: '#e2e3e5',
                color: '#383d41',
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AuthorStatistics, 'author')
