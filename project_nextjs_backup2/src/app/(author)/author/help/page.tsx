'use client';

import { useState } from 'react';
import { BookOpen, HelpCircle, Mail, Phone, MessageCircle, Search, Send, User, FileText, Clock, CheckCircle } from 'lucide-react';

import { withAuth } from '@/lib/auth-client'

function AuthorHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I submit a new manuscript?',
      answer: 'To submit a new manuscript, click on "New Submission" in your dashboard. Fill out the submission form, upload your manuscript files, and complete the metadata information. Make sure to follow the journal\'s submission guidelines.'
    },
    {
      question: 'What file formats are accepted for manuscript submission?',
      answer: 'We accept manuscripts in PDF, DOC, and DOCX formats. Figures should be submitted separately in high-resolution formats such as PNG, JPG, or TIFF. Please ensure all files are properly formatted according to our guidelines.'
    },
    {
      question: 'How long does the review process take?',
      answer: 'The typical review process takes 4-8 weeks from submission to initial decision. However, this timeline may vary depending on the complexity of the manuscript and reviewer availability. You can track the status of your submission in your dashboard.'
    },
    {
      question: 'Can I track the status of my submission?',
      answer: 'Yes, you can track your submission status by going to "My Submissions" in your dashboard. The system will show the current stage of your manuscript (Submission, Review, Copyediting, or Production) and any pending actions.'
    },
    {
      question: 'What happens after my manuscript is accepted?',
      answer: 'After acceptance, your manuscript will enter the copyediting and production stages. You\'ll receive proofs to review, and your article will be scheduled for publication. You\'ll be notified at each stage of the process.'
    }
  ];

  const handleSubmitTicket = () => {
    // Here you would typically send the support ticket to your backend
    console.log('Support ticket submitted:', supportTicket);
    alert('Support ticket submitted successfully!');
    setSupportTicket({ subject: '', category: '', message: '', priority: 'normal' });
  };

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
          Help & Support
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Find answers to common questions and get support
        </p>
      </div>

      {/* Search */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
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
            Search Help
          </h2>
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1rem',
            height: '1rem',
            color: '#666'
          }} />
          <input
            type="text"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.5rem 0.5rem 2.5rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Quick Links */}
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
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
              Submission Guidelines
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            margin: 0
          }}>
            Learn how to prepare and submit your manuscript according to our guidelines.
          </p>
          <button style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#006798'
          }}>
            View Guidelines
          </button>
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
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#00B24E' }} />
              Review Process
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            margin: 0
          }}>
            Understand the peer review process and what to expect at each stage.
          </p>
          <button style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#006798'
          }}>
            Learn More
          </button>
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
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
              Editorial Policies
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            margin: 0
          }}>
            Read about our editorial policies and ethical standards.
          </p>
          <button style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#006798'
          }}>
            Read Policies
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
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
            Frequently Asked Questions
          </h2>
        </div>
        <div>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              borderBottom: index < faqs.length - 1 ? '1px solid #e5e5e5' : 'none',
              paddingBottom: index < faqs.length - 1 ? '1rem' : 0,
              marginBottom: index < faqs.length - 1 ? '1rem' : 0
            }}>
              <button
                onClick={() => toggleAccordion(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#002C40'
                }}
              >
                <span>{faq.question}</span>
                <span style={{
                  fontSize: '1.25rem',
                  color: '#006798',
                  transition: 'transform 0.2s',
                  transform: openAccordion === index ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              {openAccordion === index && (
                <div style={{
                  padding: '0 0.75rem 0.75rem',
                  fontSize: '0.875rem',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Ticket */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
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
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
            Contact Support
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label htmlFor="subject" style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={supportTicket.subject}
                onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                placeholder="Brief description of your issue"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label htmlFor="category" style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Category
              </label>
              <select
                id="category"
                value={supportTicket.category}
                onChange={(e) => setSupportTicket({...supportTicket, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select a category</option>
                <option value="submission">Submission Issues</option>
                <option value="technical">Technical Support</option>
                <option value="account">Account Issues</option>
                <option value="review">Review Process</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Priority
              </label>
              <select
                id="priority"
                value={supportTicket.priority}
                onChange={(e) => setSupportTicket({...supportTicket, priority: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  backgroundColor: '#fff'
                }}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="message" style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              Message
            </label>
            <textarea
              id="message"
              rows={8}
              value={supportTicket.message}
              onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
              placeholder="Please provide detailed information about your issue..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '1rem'
        }}>
          <button
            onClick={handleSubmitTicket}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Send style={{ width: '1rem', height: '1rem' }} />
            Submit Ticket
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
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
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
              Email Support
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            margin: 0
          }}>
            Send us an email for general inquiries and support.
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#002C40',
            margin: 0
          }}>
            support@journal.org
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            marginTop: '0.25rem',
            margin: 0
          }}>
            Response time: 24-48 hours
          </p>
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
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MessageCircle style={{ width: '1.25rem', height: '1.25rem', color: '#00B24E' }} />
              Live Chat
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            margin: 0
          }}>
            Chat with our support team in real-time.
          </p>
          <button style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#006798',
            marginBottom: '0.5rem'
          }}>
            Start Chat
          </button>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Available: Mon-Fri, 9AM-5PM
          </p>
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
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
              Phone Support
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            margin: 0
          }}>
            Call us for urgent technical issues.
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#002C40',
            margin: 0
          }}>
            +1 (555) 123-4567
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            marginTop: '0.25rem',
            margin: 0
          }}>
            Available: Mon-Fri, 9AM-6PM
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AuthorHelp, 'author')
