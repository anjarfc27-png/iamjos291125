'use client'

import { withAuth } from "@/lib/auth-client";
import { useI18n } from "@/contexts/I18nContext";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

const statsData = [
  {
    label: "Total Journals",
    value: 5,
    trend: "+1 this month"
  },
  {
    label: "Total Users",
    value: 127,
    trend: "+12 this month"
  },
  {
    label: "Active Submissions",
    value: 43,
    trend: "+8 this week"
  },
  {
    label: "Published Articles",
    value: 892,
    trend: "+24 this month"
  }
];

const recentActivities = [
  {
    user: "Dr. Andi Wijaya",
    action: "submitted new manuscript",
    target: "Machine Learning for Weather Prediction",
    time: "2 hours ago"
  },
  {
    user: "Editor Team",
    action: "reviewed",
    target: "Sentiment Analysis of Government Policies",
    time: "5 hours ago"
  },
  {
    user: "Dr. Siti Nurhaliza",
    action: "published article in",
    target: "Journal of Information Technology",
    time: "1 day ago"
  }
];

function AdminStatisticsPage() {
  const { t } = useI18n();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Breadcrumb */}
      <AdminBreadcrumb items={[
        { label: t('admin.siteAdministration'), href: '/admin' },
        { label: t('admin.statistics') }
      ]} />

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
          Site Statistics
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Overview of journal activities and system metrics
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {statsData.map((stat, index) => (
          <div key={index} style={{
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '1.25rem'
          }}>
            <div style={{
              paddingBottom: '0.75rem',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#666',
                margin: 0
              }}>
                {stat.label}
              </h3>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#002C40',
              marginBottom: '0.25rem'
            }}>
              {stat.value}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#00B24E',
              margin: 0
            }}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
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
            Recent Activity
          </h2>
        </div>
        <div style={{
          padding: '1rem 1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {recentActivities.map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: index < recentActivities.length - 1 ? '1rem' : '0',
                borderBottom: index < recentActivities.length - 1 ? '1px solid #e5e5e5' : 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      color: '#1e40af',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      <span style={{ fontWeight: 500 }}>{activity.user}</span> {activity.action} <span style={{ fontWeight: 500 }}>{activity.target}</span>
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  color: '#333',
                  fontWeight: 600
                }}>
                  Recent
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminStatisticsPage, 'admin')
