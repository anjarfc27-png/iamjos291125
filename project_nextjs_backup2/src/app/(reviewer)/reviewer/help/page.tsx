'use client';

import { useState } from 'react';
import { Search, Send, Mail, Phone, MessageCircle, Eye, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { withAuth } from '@/lib/auth-client'

function ReviewerHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });

  const faqs = [
    {
      question: 'How do I access manuscripts for review?',
      answer: 'When you are assigned a manuscript for review, you will receive an email notification. Log into your reviewer dashboard and click on "Review Assignments" to see all pending reviews. Click on the manuscript title to access the full text and begin your review.'
    },
    {
      question: 'What is the typical review timeline?',
      answer: 'The standard review period is 4 weeks from the date of assignment. However, this may vary depending on the journal and manuscript complexity. You can see the due date for each assignment in your reviewer dashboard. If you need an extension, please contact the editor as soon as possible.'
    },
    {
      question: 'How do I submit my review recommendations?',
      answer: 'After reading the manuscript, click on "Start Review" or "Submit Review" button. You will be guided through a structured review form where you can provide your evaluation, comments to authors, confidential comments to editors, and your recommendation (Accept, Minor Revision, Major Revision, or Reject).'
    },
    {
      question: 'What criteria should I use for evaluation?',
      answer: 'Evaluate manuscripts based on: Originality and significance of the research, Methodological soundness, Clarity of presentation, Appropriate referencing, Relevance to the journal\'s scope, and Ethical considerations. Use the journal\'s specific review guidelines provided with each assignment.'
    },
    {
      question: 'Can I review if I have a conflict of interest?',
      answer: 'No, you should decline the review if you have any conflicts of interest, including: Recent collaboration with authors, Personal relationships, Financial interests, or Direct competition. It\'s important to maintain the integrity of the peer review process.'
    },
    {
      question: 'How do I update my expertise areas?',
      answer: 'Go to your reviewer profile and click "Edit Profile." You can update your research interests, expertise areas, and keywords. This helps editors match you with appropriate manuscripts for review. Keep your profile current to receive relevant review invitations.'
    }
  ];

  const handleSubmitTicket = () => {
    // Here you would typically send the support ticket to your backend
    console.log('Support ticket submitted:', supportTicket);
    alert('Support ticket submitted successfully!');
    setSupportTicket({ subject: '', category: '', message: '', priority: 'normal' });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Reviewer Help & Support
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Find answers to common questions and get support
        </p>
      </div>

      {/* Search - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '1rem'
        }}>
          Search Help
        </h2>
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
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: '1px solid #d5d5d5',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Quick Links - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Eye style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#002C40',
              margin: 0
            }}>
              Review Guidelines
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: '0 0 1rem 0',
            lineHeight: '1.6'
          }}>
            Learn how to conduct thorough and constructive peer reviews.
          </p>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: '1px solid #d5d5d5',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#002C40',
              margin: 0
            }}>
              Review Timeline
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: '0 0 1rem 0',
            lineHeight: '1.6'
          }}>
            Understand review deadlines and how to request extensions.
          </p>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: '1px solid #d5d5d5',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Award style={{ width: '1.25rem', height: '1.25rem', color: '#9c27b0' }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#002C40',
              margin: 0
            }}>
              Ethics & Policies
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: '0 0 1rem 0',
            lineHeight: '1.6'
          }}>
            Review ethical guidelines and conflict of interest policies.
          </p>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: '1px solid #d5d5d5',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#006798'
          }}>
            Read Policies
          </button>
        </div>
      </div>

      {/* FAQ - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '1rem'
        }}>
          Frequently Asked Questions
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {filteredFaqs.length === 0 ? (
            <p style={{
              padding: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#666',
              fontStyle: 'italic',
              margin: 0
            }}>
              No FAQs found matching your search.
            </p>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div key={index} style={{
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: expandedFaq === index ? '#f8f9fa' : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40',
                    flex: 1
                  }}>
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronUp style={{ width: '1rem', height: '1rem', color: '#666', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown style={{ width: '1rem', height: '1rem', color: '#666', flexShrink: 0 }} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div style={{
                    padding: '0 1rem 1rem 1rem',
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #e5e5e5'
                  }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0,
                      lineHeight: '1.6',
                      paddingTop: '1rem'
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Support Ticket - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#ff9800' }} />
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0
          }}>
            Contact Support
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label htmlFor="subject" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label htmlFor="category" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select a category</option>
                <option value="review_process">Review Process</option>
                <option value="technical">Technical Support</option>
                <option value="account">Account Issues</option>
                <option value="manuscript_access">Manuscript Access</option>
                <option value="deadline">Deadline Issues</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
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
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d5d5d5',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
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
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40',
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
                padding: '0.5rem 0.75rem',
                border: '1px solid #d5d5d5',
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
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSubmitTicket}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <Send style={{ width: '1rem', height: '1rem' }} />
            Submit Ticket
          </button>
        </div>
      </div>

      {/* Contact Information - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#006798' }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#002C40',
              margin: 0
            }}>
              Email Support
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: '0 0 1rem 0',
            lineHeight: '1.6'
          }}>
            Send us an email for general inquiries and support.
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#002C40',
            margin: '0 0 0.25rem 0'
          }}>
            reviewersupport@journal.org
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <MessageCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#002C40',
              margin: 0
            }}>
              Live Chat
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: '0 0 1rem 0',
            lineHeight: '1.6'
          }}>
            Chat with our support team in real-time.
          </p>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: '1px solid #d5d5d5',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#9c27b0' }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#002C40',
              margin: 0
            }}>
              Phone Support
            </h3>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: '0 0 1rem 0',
            lineHeight: '1.6'
          }}>
            Call us for urgent technical issues.
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#002C40',
            margin: '0 0 0.25rem 0'
          }}>
            +1 (555) 234-5678
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Available: Mon-Fri, 9AM-6PM
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ReviewerHelp, 'reviewer')
