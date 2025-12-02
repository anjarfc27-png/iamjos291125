'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, Clock, Award, Calendar, Star } from 'lucide-react';
import { withAuth } from '@/lib/auth-client'

const monthlyReviews = [
  { month: 'Jan', reviews: 3, accept: 1, reject: 1, revision: 1 },
  { month: 'Feb', reviews: 2, accept: 1, reject: 0, revision: 1 },
  { month: 'Mar', reviews: 4, accept: 2, reject: 1, revision: 1 },
  { month: 'Apr', reviews: 3, accept: 2, reject: 0, revision: 1 },
  { month: 'May', reviews: 2, accept: 1, reject: 1, revision: 0 },
  { month: 'Jun', reviews: 5, accept: 3, reject: 1, revision: 1 },
];

const decisionDistribution = [
  { name: 'Accept', value: 10, color: '#10b981' },
  { name: 'Minor Revision', value: 8, color: '#3b82f6' },
  { name: 'Major Revision', value: 5, color: '#f59e0b' },
  { name: 'Reject', value: 4, color: '#ef4444' },
];

const reviewTimeData = [
  { range: '1-7 days', count: 3 },
  { range: '8-14 days', count: 8 },
  { range: '15-21 days', count: 12 },
  { range: '22-30 days', count: 4 },
  { range: '30+ days', count: 2 },
];

function ReviewerStatistics() {
  const { user } = useAuth();

  const stats = {
    totalReviews: 29,
    avgReviewTime: 18.5,
    acceptRate: 34.5,
    avgRating: 4.2,
    onTimeRate: 89.7,
    totalCitations: 156
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Reviewer Statistics
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            View your review performance and statistics
          </p>
        </div>
      </div>

      {/* Summary Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              Total Reviews
            </h3>
            <FileText style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {stats.totalReviews}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            +5 this month
          </p>
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
              Accept Rate
            </h3>
            <TrendingUp style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#10b981',
            marginBottom: '0.25rem'
          }}>
            {stats.acceptRate}%
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Above average
          </p>
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
              Avg. Review Time
            </h3>
            <Clock style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {stats.avgReviewTime} days
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            On time
          </p>
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
              On-Time Rate
            </h3>
            <Calendar style={{ width: '1rem', height: '1rem', color: '#9c27b0' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#9c27b0',
            marginBottom: '0.25rem'
          }}>
            {stats.onTimeRate}%
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Excellent
          </p>
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
              Avg. Rating
            </h3>
            <Star style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#f59e0b',
            marginBottom: '0.25rem'
          }}>
            {stats.avgRating}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Out of 5
          </p>
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
            <Award style={{ width: '1rem', height: '1rem', color: '#6366f1' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#6366f1',
            marginBottom: '0.25rem'
          }}>
            {stats.totalCitations}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            +23 this month
          </p>
        </div>
      </div>

      {/* Charts - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '1rem'
          }}>
            Monthly Review Activity (6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyReviews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reviews" fill="#006798" name="Total Reviews" />
              <Bar dataKey="accept" fill="#10b981" name="Accept" />
              <Bar dataKey="revision" fill="#f59e0b" name="Revision" />
              <Bar dataKey="reject" fill="#ef4444" name="Reject" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '1rem'
          }}>
            Decision Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={decisionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {decisionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '1rem'
          }}>
            Review Time Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reviewTimeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '1rem'
          }}>
            Reviewer Performance Metrics
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>Review Quality Score</span>
              <span style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                backgroundColor: '#d4edda',
                color: '#155724',
                fontWeight: 600
              }}>
                Excellent (4.2/5)
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>Timeliness Score</span>
              <span style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                backgroundColor: '#d1ecf1',
                color: '#0c5460',
                fontWeight: 600
              }}>
                Very Good (89.7%)
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>Constructiveness Score</span>
              <span style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                backgroundColor: '#e7d4f5',
                color: '#6f42c1',
                fontWeight: 600
              }}>
                Good (4.1/5)
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>Expertise Match</span>
              <span style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                backgroundColor: '#d1ecf1',
                color: '#0c5460',
                fontWeight: 600
              }}>
                Excellent (95%)
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>Review Depth</span>
              <span style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                backgroundColor: '#ffeaa7',
                color: '#856404',
                fontWeight: 600
              }}>
                Good (3.8/5)
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>Overall Ranking</span>
              <span style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                fontWeight: 600
              }}>
                Top 15%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ReviewerStatistics, 'reviewer')
