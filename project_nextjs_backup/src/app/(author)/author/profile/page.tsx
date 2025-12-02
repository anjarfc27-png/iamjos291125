'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Globe, Building, Award, BookOpen, FileText } from 'lucide-react';

import { withAuth } from '@/lib/auth-client'

function AuthorProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'affiliations' | 'metrics'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user?.full_name || 'Dr. John Doe',
    email: user?.email || 'john.doe@university.edu',
    orcid: '0000-0000-0000-0000',
    affiliation: 'University of Technology',
    department: 'Department of Computer Science',
    position: 'Associate Professor',
    country: 'United States',
    phone: '+1-555-123-4567',
    website: 'https://johndoe.university.edu',
    bio: 'Dr. John Doe is an Associate Professor in the Department of Computer Science with expertise in machine learning, educational technology, and artificial intelligence. He has published over 50 research papers in top-tier journals and conferences.',
    research_interests: 'Machine Learning, Educational Technology, Artificial Intelligence, Data Mining',
    expertise: 'Educational Data Mining, Learning Analytics, AI in Education'
  });

  const [affiliations] = useState([
    {
      id: 1,
      institution: 'University of Technology',
      department: 'Department of Computer Science',
      position: 'Associate Professor',
      start_date: '2018',
      end_date: 'Present'
    },
    {
      id: 2,
      institution: 'Research Institute of Technology',
      department: 'AI Research Lab',
      position: 'Senior Researcher',
      start_date: '2015',
      end_date: '2018'
    }
  ]);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
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
            Author Profile
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage your author profile information
          </p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          style={{
            backgroundColor: isEditing ? '#00B24E' : '#006798',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Tabs - OJS PKP 3.3 Style */}
      <div
        className="pkp_controllers_tab"
        style={{
          borderBottom: '2px solid #e5e5e5',
          backgroundColor: '#ffffff',
          padding: '0 1.5rem',
          marginBottom: '1.5rem',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            background: 'transparent',
            alignItems: 'flex-end',
            gap: '0.25rem',
          }}
        >
          <button
            onClick={() => setActiveTab('personal')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 1rem',
              lineHeight: '3rem',
              height: '3rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'personal' ? 700 : 400,
              textDecoration: 'none',
              color: activeTab === 'personal' ? 'rgba(0, 0, 0, 0.84)' : '#006798',
              backgroundColor: activeTab === 'personal' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'personal' ? '2px solid #006798' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: activeTab === 'personal' ? '-2px' : '0',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'personal') {
                e.currentTarget.style.color = '#002C40';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'personal') {
                e.currentTarget.style.color = '#006798';
              }
            }}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('affiliations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 1rem',
              lineHeight: '3rem',
              height: '3rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'affiliations' ? 700 : 400,
              textDecoration: 'none',
              color: activeTab === 'affiliations' ? 'rgba(0, 0, 0, 0.84)' : '#006798',
              backgroundColor: activeTab === 'affiliations' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'affiliations' ? '2px solid #006798' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: activeTab === 'affiliations' ? '-2px' : '0',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'affiliations') {
                e.currentTarget.style.color = '#002C40';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'affiliations') {
                e.currentTarget.style.color = '#006798';
              }
            }}
          >
            Affiliations
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 1rem',
              lineHeight: '3rem',
              height: '3rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'metrics' ? 700 : 400,
              textDecoration: 'none',
              color: activeTab === 'metrics' ? 'rgba(0, 0, 0, 0.84)' : '#006798',
              backgroundColor: activeTab === 'metrics' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'metrics' ? '2px solid #006798' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: activeTab === 'metrics' ? '-2px' : '0',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'metrics') {
                e.currentTarget.style.color = '#002C40';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'metrics') {
                e.currentTarget.style.color = '#006798';
              }
            }}
          >
            Metrics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'personal' && (
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
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#002C40',
                margin: 0
              }}>
                Personal Information
              </h2>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="full_name" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      color: '#666'
                    }} />
                    <input
                      id="full_name"
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="email" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      color: '#666'
                    }} />
                    <input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="orcid" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    ORCID
                  </label>
                  <input
                    id="orcid"
                    type="text"
                    value={profile.orcid}
                    onChange={(e) => setProfile({...profile, orcid: e.target.value})}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="phone" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Phone
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      color: '#666'
                    }} />
                    <input
                      id="phone"
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="affiliation" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Institution
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      color: '#666'
                    }} />
                    <input
                      id="affiliation"
                      type="text"
                      value={profile.affiliation}
                      onChange={(e) => setProfile({...profile, affiliation: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="department" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="position" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({...profile, position: e.target.value})}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                      cursor: isEditing ? 'text' : 'not-allowed'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="country" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Country
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      color: '#666'
                    }} />
                    <input
                      id="country"
                      type="text"
                      value={profile.country}
                      onChange={(e) => setProfile({...profile, country: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                  <label htmlFor="website" style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Website
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      color: '#666'
                    }} />
                    <input
                      id="website"
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                        cursor: isEditing ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="bio" style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#002C40'
                }}>
                  Biography
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                    cursor: isEditing ? 'text' : 'not-allowed'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="research_interests" style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#002C40'
                }}>
                  Research Interests
                </label>
                <input
                  id="research_interests"
                  type="text"
                  value={profile.research_interests}
                  onChange={(e) => setProfile({...profile, research_interests: e.target.value})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                    cursor: isEditing ? 'text' : 'not-allowed'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="expertise" style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#002C40'
                }}>
                  Areas of Expertise
                </label>
                <input
                  id="expertise"
                  type="text"
                  value={profile.expertise}
                  onChange={(e) => setProfile({...profile, expertise: e.target.value})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                    cursor: isEditing ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliations' && (
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
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#002C40',
                margin: 0
              }}>
                Institutional Affiliations
              </h2>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {affiliations.map((affiliation) => (
                <div key={affiliation.id} style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem'
                }}>
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
                      {affiliation.institution}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      fontWeight: 600
                    }}>
                      {affiliation.start_date} - {affiliation.end_date}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {affiliation.department}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#333',
                    margin: 0
                  }}>
                    {affiliation.position}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
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
                  Total Publications
                </h3>
                <BookOpen style={{ width: '1rem', height: '1rem', color: '#006798' }} />
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#002C40',
                marginBottom: '0.25rem'
              }}>
                5
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: 0
              }}>
                3 journals, 2 conferences
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
                <Award style={{ width: '1rem', height: '1rem', color: '#00B24E' }} />
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#00B24E',
                marginBottom: '0.25rem'
              }}>
                31
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: 0
              }}>
                h-index: 3
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
                  Active Submissions
                </h3>
                <FileText style={{ width: '1rem', height: '1rem', color: '#006798' }} />
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#006798',
                marginBottom: '0.25rem'
              }}>
                4
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: 0
              }}>
                1 under review
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AuthorProfile, 'author')
