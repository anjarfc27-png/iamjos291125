'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Globe, Building, Award, Eye, Star } from 'lucide-react';
import { withAuth } from '@/lib/auth-client'

function ReviewerProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'expertise' | 'metrics'>('personal');
  const [profile, setProfile] = useState({
    full_name: user?.full_name || 'Dr. Sarah Johnson',
    email: user?.email || 'sarah.johnson@university.edu',
    orcid: '0000-0000-0000-0000',
    affiliation: 'University of Technology',
    department: 'Department of Educational Technology',
    position: 'Professor',
    country: 'United States',
    phone: '+1-555-987-6543',
    website: 'https://sarahjohnson.university.edu',
    bio: 'Dr. Sarah Johnson is a Professor in Educational Technology with over 15 years of experience in peer review. She has reviewed for numerous international journals and specializes in educational innovation, technology integration, and learning analytics.',
    research_interests: 'Educational Technology, Learning Analytics, Technology Integration, Online Learning',
    expertise: 'Educational Innovation, Digital Learning, Technology Assessment, Curriculum Design',
    review_experience: '15 years',
    review_count: 156,
    specializations: ['Educational Technology', 'Online Learning', 'Learning Analytics', 'Digital Assessment']
  });

  const [expertiseAreas] = useState([
    {
      id: 1,
      area: 'Educational Technology',
      level: 'Expert',
      experience: '15 years',
      reviews_completed: 45
    },
    {
      id: 2,
      area: 'Online Learning',
      level: 'Expert',
      experience: '12 years',
      reviews_completed: 38
    },
    {
      id: 3,
      area: 'Learning Analytics',
      level: 'Advanced',
      experience: '8 years',
      reviews_completed: 32
    },
    {
      id: 4,
      area: 'Digital Assessment',
      level: 'Expert',
      experience: '10 years',
      reviews_completed: 28
    },
    {
      id: 5,
      area: 'Curriculum Design',
      level: 'Advanced',
      experience: '14 years',
      reviews_completed: 25
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
            Reviewer Profile
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage your reviewer profile information
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
      <div style={{
        borderBottom: '2px solid #e5e5e5',
        backgroundColor: '#fff',
        padding: '0',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('personal')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'personal' ? 600 : 400,
            color: activeTab === 'personal' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'personal' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: activeTab === 'personal' ? '-2px' : '0'
          }}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('expertise')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'expertise' ? 600 : 400,
            color: activeTab === 'expertise' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'expertise' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: activeTab === 'expertise' ? '-2px' : '0'
          }}
        >
          Expertise Areas
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'metrics' ? 600 : 400,
            color: activeTab === 'metrics' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'metrics' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: activeTab === 'metrics' ? '-2px' : '0'
          }}
        >
          Review Metrics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && (
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
            marginBottom: '1.5rem'
          }}>
            Personal Information
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <label htmlFor="full_name" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
              }}>
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="orcid" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="phone" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
              }}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="affiliation" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
              }}>
                Institution
              </label>
              <input
                id="affiliation"
                type="text"
                value={profile.affiliation}
                onChange={(e) => setProfile({...profile, affiliation: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="department" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="position" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div>
              <label htmlFor="country" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
              }}>
                Country
              </label>
              <input
                id="country"
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({...profile, country: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="website" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
              }}>
                Website
              </label>
              <input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="bio" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="research_interests" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="expertise" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.5rem'
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expertise' && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0,
              marginBottom: '1rem'
            }}>
              Review Expertise Areas
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {expertiseAreas.map((area) => (
                <div key={area.id} style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: 0
                    }}>
                      {area.area}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      backgroundColor: area.level === 'Expert' ? '#d4edda' : '#d1ecf1',
                      color: area.level === 'Expert' ? '#155724' : '#0c5460',
                      fontWeight: 600
                    }}>
                      {area.level}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem'
                  }}>
                    <div>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        margin: '0 0 0.25rem 0'
                      }}>
                        Experience
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#333',
                        margin: 0
                      }}>
                        {area.experience}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        margin: '0 0 0.25rem 0'
                      }}>
                        Reviews Completed
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#333',
                        margin: 0
                      }}>
                        {area.reviews_completed}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        margin: '0 0 0.25rem 0'
                      }}>
                        Avg. Rating
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Star style={{ width: '1rem', height: '1rem', color: '#f59e0b', fill: '#f59e0b' }} />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          4.8
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0,
              marginBottom: '1rem'
            }}>
              Specializations
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {profile.specializations.map((spec, index) => (
                <span key={index} style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '4px',
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  border: '1px solid #dee2e6'
                }}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
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
            marginBottom: '1.5rem'
          }}>
            Review Metrics
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
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
                <Eye style={{ width: '1rem', height: '1rem', color: '#006798' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#002C40',
                marginBottom: '0.25rem'
              }}>
                {profile.review_count}
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: 0
              }}>
                {profile.review_experience} experience
              </p>
            </div>
            <div style={{
              backgroundColor: '#f8f9fa',
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
                <Award style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#10b981',
                marginBottom: '0.25rem'
              }}>
                34.5%
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: 0
              }}>
                Balanced reviewer
              </p>
            </div>
            <div style={{
              backgroundColor: '#f8f9fa',
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
                  Reviewer Rating
                </h3>
                <Star style={{ width: '1rem', height: '1rem', color: '#f59e0b', fill: '#f59e0b' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#f59e0b',
                marginBottom: '0.25rem'
              }}>
                4.8
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: 0
              }}>
                Out of 5 stars
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ReviewerProfile, 'reviewer')
