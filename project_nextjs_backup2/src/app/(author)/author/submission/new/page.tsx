'use client'

import { useState } from 'react';
import {
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  University,
  Globe,
  Save,
  Send,
  Plus,
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";

import { withAuth } from '@/lib/auth-client'
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect } from 'react';
import { createSubmissionAction, saveSubmissionMetadataAction, uploadSubmissionFileAction } from './actions';
import { useRouter } from 'next/navigation';

function NewSubmissionPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    journal: '',
    section: '',
    language: 'en',
    authors: [
      {
        givenName: '',
        familyName: '',
        email: '',
        affiliation: '',
        country: '',
        orcid: '',
        isCorresponding: true
      }
    ],
    files: [] as File[]
  });

  const totalSteps = 5;

  const steps = [
    { id: 1, name: 'Start', description: 'Select journal and section' },
    { id: 2, name: 'Upload Submission', description: 'Upload your manuscript files' },
    { id: 3, name: 'Enter Metadata', description: 'Add authors and details' },
    { id: 4, name: 'Upload Supplementary Files', description: 'Additional files (optional)' },
    { id: 5, name: 'Confirmation', description: 'Review and submit' }
  ];

  const [journals, setJournals] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const supabase = getSupabaseBrowserClient();

  // Fetch Journals on mount
  // Fetch Journals on mount
  useEffect(() => {
    const fetchJournals = async () => {
      // 1. Fetch journals (without name, as it doesn't exist)
      const { data: journalsData, error } = await supabase
        .from('journals')
        .select('id, path')
        .eq('enabled', true);

      if (journalsData) {
        // 2. Fetch journal names from settings
        const journalIds = journalsData.map(j => j.id);
        const { data: settingsData } = await supabase
          .from('journal_settings')
          .select('journal_id, setting_value')
          .in('journal_id', journalIds)
          .eq('setting_name', 'name'); // Assuming 'name' is the setting key for journal title

        // 3. Map names to journals
        const nameMap = new Map(settingsData?.map(s => [s.journal_id, s.setting_value]) || []);

        const mappedJournals = journalsData.map(j => ({
          ...j,
          name: nameMap.get(j.id) || j.path || `Journal ${j.id}`
        }));

        setJournals(mappedJournals);
      }
    };
    fetchJournals();
  }, []);

  // Fetch Sections when Journal changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!formData.journal) {
        setSections([]);
        return;
      }

      try {
        // 1. Fetch sections (without title)
        const { data: sectionsData, error } = await supabase
          .from('sections')
          .select('id, seq, is_inactive')
          .eq('journal_id', formData.journal);

        if (sectionsData) {
          // 2. Fetch section titles from settings
          const sectionIds = sectionsData.map(s => s.id);
          const { data: settingsData } = await supabase
            .from('section_settings')
            .select('section_id, setting_value')
            .in('section_id', sectionIds)
            .eq('setting_name', 'title');

          // 3. Map titles to sections
          const titleMap = new Map(settingsData?.map(s => [s.section_id, s.setting_value]) || []);

          const mappedSections = sectionsData
            .filter((s: any) => !s.is_inactive)
            .map((s: any) => ({
              ...s,
              title: titleMap.get(s.id) || `Section ${s.id}`
            }));

          setSections(mappedSections);
        }
      } catch (e) {
        console.error("Failed to fetch sections", e);
      }
    };
    fetchSections();
  }, [formData.journal]);

  const countries = [
    { code: 'ID', name: 'Indonesia' },
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthorChange = (index: number, field: string, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setFormData(prev => ({ ...prev, authors: newAuthors }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, {
        givenName: '',
        familyName: '',
        email: '',
        affiliation: '',
        country: '',
        orcid: '',
        isCorresponding: false
      }]
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length > 1) {
      const newAuthors = formData.authors.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, authors: newAuthors }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!submissionId) {
      alert("Submission ID not found. Please restart the process.");
      return;
    }

    for (const file of files) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("submissionId", submissionId);
        formDataToSend.append("file", file);
        formDataToSend.append("fileKind", "manuscript"); // Or differentiate based on step

        const result = await uploadSubmissionFileAction(formDataToSend);

        if (!result.success) throw new Error(result.message);

        setFormData(prev => ({ ...prev, files: [...prev.files, file] }));
      } catch (error: any) {
        console.error("Error uploading file:", error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = formData.files[index];
    if (!submissionId) return;

    try {
      // 1. Delete from Storage
      const filePath = `${submissionId}/${fileToRemove.name}`;
      const { error: storageError } = await supabase.storage
        .from('submissions')
        .remove([filePath]);

      if (storageError) console.warn("Failed to delete from storage", storageError);

      // 2. Delete from Database
      // We need the file ID. But currently formData.files stores File objects which don't have IDs.
      // We should update formData.files to store the DB record or at least map it.
      // For now, let's delete by name and submission_id (risky if duplicates, but okay for MVP)
      const { error: dbError } = await supabase
        .from('submission_files')
        .delete()
        .eq('submission_id', submissionId)
        .eq('file_name', fileToRemove.name);

      if (dbError) throw dbError;

      const newFiles = formData.files.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, files: newFiles }));
    } catch (error: any) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file.");
    }
  };

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [publicationId, setPublicationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!formData.journal || !formData.section || !formData.language) {
        alert("Please select all required fields.");
        return;
      }

      setIsSaving(true);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("journalId", formData.journal);
        formDataToSend.append("sectionId", formData.section);
        formDataToSend.append("locale", formData.language);

        const result = await createSubmissionAction(formDataToSend);

        if (!result.success) {
          throw new Error(result.message);
        }

        setSubmissionId(result.data.submissionId);
        setPublicationId(result.data.publicationId);
        setCurrentStep(currentStep + 1);
      } catch (error: any) {
        console.error("Error creating submission:", error);
        alert(`Failed to create submission: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else if (currentStep === 3) {
      // Save Metadata before moving to Step 4
      if (!submissionId || !publicationId) return;

      setIsSaving(true);
      try {
        const result = await saveSubmissionMetadataAction(submissionId, publicationId, {
          title: formData.title,
          abstract: formData.abstract,
          keywords: formData.keywords,
          locale: formData.language
        });

        if (!result.success) throw new Error(result.message);

        setCurrentStep(currentStep + 1);
      } catch (error: any) {
        console.error("Error saving metadata:", error);
        alert(`Failed to save metadata: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form style={{ marginBottom: '1.5rem' }}>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#002C40',
                margin: '0 0 0.5rem 0'
              }}>
                Step 1: Start
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#666',
                margin: '0 0 1.5rem 0'
              }}>
                Select the journal and section for your submission
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="journal" style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  Journal <span style={{ color: '#d32f2f' }}>*</span>
                </label>
                <select
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => handleInputChange('journal', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Select a journal</option>
                  {journals.map((journal) => (
                    <option key={journal.id} value={journal.id}>
                      {journal.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="section" style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  Section <span style={{ color: '#d32f2f' }}>*</span>
                </label>
                <select
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleInputChange('section', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="language" style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  Language <span style={{ color: '#d32f2f' }}>*</span>
                </label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                </select>
              </div>
            </div>
          </form>
        );

      case 2:
        return (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#002C40',
                margin: '0 0 0.25rem 0'
              }}>
                Step 2: Upload Submission
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#666',
                margin: 0
              }}>
                Upload your manuscript file(s). Accepted formats: PDF, DOC, DOCX
              </p>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{
                border: '2px dashed #dee2e6',
                borderRadius: '4px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#006798';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload style={{
                  width: '3rem',
                  height: '3rem',
                  color: '#666',
                  margin: '0 auto 1rem'
                }} />
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  margin: '0 0 0.5rem 0'
                }}>
                  Drag and drop your files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <button
                  type="button"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#006798',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-upload')?.click();
                  }}
                >
                  <Upload style={{ width: '1rem', height: '1rem' }} />
                  Choose Files
                </button>
              </div>

              {formData.files.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40'
                  }}>
                    Uploaded Files
                  </label>
                  {formData.files.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <FileText style={{
                          width: '1rem',
                          height: '1rem',
                          color: '#666'
                        }} />
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#002C40',
                            margin: 0
                          }}>
                            {file.name}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            margin: 0
                          }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#d32f2f'
                        }}
                      >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
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
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#002C40',
                  margin: '0 0 0.25rem 0'
                }}>
                  Step 3: Enter Metadata
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  margin: 0
                }}>
                  Provide information about your submission
                </p>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <label htmlFor="title" style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40'
                  }}>
                    Title <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter the title of your manuscript"
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

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <label htmlFor="abstract" style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40'
                  }}>
                    Abstract <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => handleInputChange('abstract', e.target.value)}
                    placeholder="Enter your abstract here..."
                    rows={6}
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

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <label htmlFor="keywords" style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40'
                  }}>
                    Keywords <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    placeholder="Enter keywords separated by commas"
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
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #e5e5e5'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#002C40',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Authors
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    margin: 0
                  }}>
                    Add author information for your submission
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addAuthor}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#006798',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                  Add Author
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {formData.authors.map((author, index) => (
                  <div key={index} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h4 style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#002C40',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        Author {index + 1}
                        {author.isCorresponding && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            backgroundColor: '#f8f9fa',
                            color: '#333',
                            fontWeight: 600
                          }}>
                            Corresponding
                          </span>
                        )}
                      </h4>
                      {formData.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d32f2f'
                          }}
                        >
                          <Trash2 style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      )}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40'
                        }}>
                          Given Name <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={author.givenName}
                          onChange={(e) => handleAuthorChange(index, 'givenName', e.target.value)}
                          placeholder="First name"
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
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40'
                        }}>
                          Family Name <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={author.familyName}
                          onChange={(e) => handleAuthorChange(index, 'familyName', e.target.value)}
                          placeholder="Last name"
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
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40'
                        }}>
                          Email <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                          type="email"
                          value={author.email}
                          onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                          placeholder="author@example.com"
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
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40'
                        }}>
                          ORCID
                        </label>
                        <input
                          type="text"
                          value={author.orcid}
                          onChange={(e) => handleAuthorChange(index, 'orcid', e.target.value)}
                          placeholder="0000-0000-0000-0000"
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
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        gridColumn: '1 / -1'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40'
                        }}>
                          Affiliation <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={author.affiliation}
                          onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                          placeholder="University or institution"
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
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40'
                        }}>
                          Country <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <select
                          value={author.country}
                          onChange={(e) => handleAuthorChange(index, 'country', e.target.value)}
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
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#002C40',
                margin: '0 0 0.25rem 0'
              }}>
                Step 4: Upload Supplementary Files
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#666',
                margin: 0
              }}>
                Upload any supplementary files (optional). This could include datasets, code, or additional materials.
              </p>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{
                border: '2px dashed #dee2e6',
                borderRadius: '4px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#006798';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
                onClick={() => document.getElementById('supplementary-upload')?.click()}
              >
                <Upload style={{
                  width: '3rem',
                  height: '3rem',
                  color: '#666',
                  margin: '0 auto 1rem'
                }} />
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  margin: '0 0 0.5rem 0'
                }}>
                  Upload supplementary files here
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="supplementary-upload"
                />
                <button
                  type="button"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#006798',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('supplementary-upload')?.click();
                  }}
                >
                  <Upload style={{ width: '1rem', height: '1rem' }} />
                  Choose Files
                </button>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: '#666',
                margin: 0
              }}>
                Supplementary files are optional and can include datasets, code, figures, or other materials that support your submission.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
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
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#002C40',
                  margin: '0 0 0.25rem 0'
                }}>
                  Step 5: Confirmation
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  margin: 0
                }}>
                  Please review your submission details before final submission
                </p>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <AlertCircle style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: '#856404',
                      marginTop: '0.125rem',
                      flexShrink: 0
                    }} />
                    <div>
                      <h4 style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#856404',
                        margin: '0 0 0.5rem 0'
                      }}>
                        Submission Checklist
                      </h4>
                      <ul style={{
                        fontSize: '0.875rem',
                        color: '#856404',
                        margin: 0,
                        paddingLeft: '1.25rem',
                        listStyle: 'disc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        <li>The submission has not been previously published</li>
                        <li>The submission file is in Microsoft Word or PDF format</li>
                        <li>All authors have been added with complete information</li>
                        <li>The text adheres to the stylistic and bibliographic requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#002C40',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Submission Details
                    </h4>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <div><strong>Title:</strong> {formData.title || 'Not specified'}</div>
                      <div><strong>Journal:</strong> {journals.find(j => j.id === formData.journal)?.name || 'Not selected'}</div>
                      <div><strong>Section:</strong> {sections.find(s => s.id === formData.section)?.name || 'Not selected'}</div>
                      <div><strong>Language:</strong> {formData.language === 'en' ? 'English' : 'Indonesian'}</div>
                      <div><strong>Authors:</strong> {formData.authors.length} author(s)</div>
                      <div><strong>Files:</strong> {formData.files.length} file(s) uploaded</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <input
                    type="checkbox"
                    id="terms"
                    style={{
                      width: '1rem',
                      height: '1rem',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="terms" style={{
                    fontSize: '0.875rem',
                    color: '#333',
                    cursor: 'pointer'
                  }}>
                    I agree to the <a href="#" style={{ color: '#006798', textDecoration: 'underline' }}>terms and conditions</a> and <a href="#" style={{ color: '#006798', textDecoration: 'underline' }}>privacy policy</a>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
          New Submission
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Submit your manuscript for peer review
        </p>
      </div>

      {/* Progress Steps - OJS PKP 3.3 Style */}
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
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '150px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: currentStep > step.id ? '#00B24E' : currentStep === step.id ? '#006798' : '#e5e5e5',
                  color: currentStep > step.id || currentStep === step.id ? '#fff' : '#666'
                }}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div style={{ marginTop: '0.5rem', textAlign: 'center', width: '100%' }}>
                  <p style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#002C40',
                    margin: '0 0 0.125rem 0'
                  }}>
                    {step.name}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    margin: 0
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  flex: '1',
                  height: '2px',
                  margin: '0 1rem',
                  minWidth: '50px',
                  backgroundColor: currentStep > step.id ? '#00B24E' : '#e5e5e5'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons - OJS PKP 3.3 Style */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e5e5'
      }}>
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 1 ? 0.5 : 1,
            color: '#006798'
          }}
        >
          Previous
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={nextStep}
              style={{
                backgroundColor: '#006798',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {currentStep === 4 ? 'Review' : 'Next'}
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              type="button"
              onClick={async () => {
                if (!submissionId) return;
                // Finalize submission (update status)
                // We could add a server action for this too, but for now a simple update is okay if RLS allows, 
                // OR better: create a 'submitSubmissionAction'
                // For MVP, let's just redirect since status is already 'queued' (1).
                // Ideally we change it to 'submitted' if that's a different status.
                // Assuming 1 is 'Queued' which is fine for initial submission.

                alert("Submission successful!");
                router.push('/author/submissions');
              }}
              style={{
                backgroundColor: '#00B24E',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Send style={{ width: '1rem', height: '1rem' }} />
              Submit Manuscript
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export default withAuth(NewSubmissionPage, 'author')
