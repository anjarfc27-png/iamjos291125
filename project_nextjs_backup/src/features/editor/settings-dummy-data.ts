/**
 * Dummy Data for Settings Pages
 * This file contains dummy data for all Settings grid management
 */

// Dummy Sections Data
export const DUMMY_SECTIONS = [
  {
    id: "1",
    title: "Articles",
    abbreviation: "ART",
    enabled: true,
    policy: "Original research articles",
  },
  {
    id: "2",
    title: "Review Articles",
    abbreviation: "REV",
    enabled: true,
    policy: "Review articles and meta-analyses",
  },
  {
    id: "3",
    title: "Short Communications",
    abbreviation: "SC",
    enabled: true,
    policy: "Brief communications and case reports",
  },
  {
    id: "4",
    title: "Editorials",
    abbreviation: "EDT",
    enabled: false,
    policy: "Editorial content",
  },
];

// Dummy Categories Data
export const DUMMY_CATEGORIES = [
  {
    id: "1",
    title: "Computer Science",
    path: "computer-science",
    description: "Articles related to computer science research",
  },
  {
    id: "2",
    title: "Artificial Intelligence",
    path: "artificial-intelligence",
    description: "Research on AI and machine learning",
  },
  {
    id: "3",
    title: "Information Systems",
    path: "information-systems",
    description: "Information systems and technology",
  },
  {
    id: "4",
    title: "Software Engineering",
    path: "software-engineering",
    description: "Software development and engineering",
  },
];

// Dummy Users Data
export const DUMMY_USERS = [
  {
    id: "1",
    name: "Dr. Andi Wijaya, M.Kom",
    email: "andi.wijaya@ui.ac.id",
    roles: ["Editor-in-Chief", "Manager"],
    status: "active",
  },
  {
    id: "2",
    name: "Siti Nurhaliza, S.T., M.T.",
    email: "siti.nurhaliza@ugm.ac.id",
    roles: ["Section Editor"],
    status: "active",
  },
  {
    id: "3",
    name: "Bambang Suryadi, S.Kom., M.Kom.",
    email: "bambang.s@itb.ac.id",
    roles: ["Reviewer"],
    status: "active",
  },
  {
    id: "4",
    name: "Dr. Ratih Pratiwi, M.Kom.",
    email: "ratih.pratiwi@unpad.ac.id",
    roles: ["Copyeditor"],
    status: "inactive",
  },
  {
    id: "5",
    name: "Dr. Budi Santoso",
    email: "budi.santoso@binus.ac.id",
    roles: ["Reviewer", "Proofreader"],
    status: "active",
  },
];

// Dummy Roles Data
export const DUMMY_ROLES = [
  {
    id: "1",
    name: "Editor-in-Chief",
    description: "Manages the overall editorial process",
    users: 1,
    permissions: ["Manage submissions", "Publish articles", "Manage users"],
  },
  {
    id: "2",
    name: "Section Editor",
    description: "Manages submissions in assigned sections",
    users: 3,
    permissions: ["Edit submissions", "Assign reviewers", "Make recommendations"],
  },
  {
    id: "3",
    name: "Reviewer",
    description: "Reviews submissions and provides feedback",
    users: 12,
    permissions: ["Review submissions", "Submit reviews"],
  },
  {
    id: "4",
    name: "Copyeditor",
    description: "Edits submissions for style and grammar",
    users: 2,
    permissions: ["Edit submissions", "Upload edited files"],
  },
  {
    id: "5",
    name: "Layout Editor",
    description: "Prepares submissions for publication",
    users: 1,
    permissions: ["Edit layouts", "Upload formatted files"],
  },
];

// Dummy Components (File Types) Data
export const DUMMY_COMPONENTS = [
  {
    id: "1",
    name: "Article Text",
    designation: "Article",
    required: true,
    description: "Main article text file",
  },
  {
    id: "2",
    name: "Supplementary File",
    designation: "Supplementary",
    required: false,
    description: "Additional materials and supplementary files",
  },
  {
    id: "3",
    name: "Figure",
    designation: "Figure",
    required: false,
    description: "Image files for figures",
  },
  {
    id: "4",
    name: "Table",
    designation: "Table",
    required: false,
    description: "Table data files",
  },
];

// Dummy Submission Checklist Data
export const DUMMY_CHECKLIST = [
  {
    id: "1",
    order: 1,
    content: "The submission has not been previously published, nor is it before another journal for consideration.",
    enabled: true,
  },
  {
    id: "2",
    order: 2,
    content: "The submission file is in Microsoft Word, RTF, or OpenOffice format.",
    enabled: true,
  },
  {
    id: "3",
    order: 3,
    content: "All URLs in the text (e.g., http://pkp.sfu.ca) are activated and ready to click.",
    enabled: true,
  },
  {
    id: "4",
    order: 4,
    content: "The text adheres to the stylistic and bibliographic requirements outlined in the Author Guidelines.",
    enabled: true,
  },
];

// Dummy Metadata Fields Data
export const DUMMY_METADATA_FIELDS = [
  {
    id: "1",
    field: "Keywords",
    required: true,
    authorEditable: true,
    description: "Keywords for indexing",
  },
  {
    id: "2",
    field: "Subject Classification",
    required: false,
    authorEditable: true,
    description: "Subject classification codes",
  },
  {
    id: "3",
    field: "Discipline",
    required: false,
    authorEditable: true,
    description: "Academic discipline",
  },
  {
    id: "4",
    field: "Language",
    required: true,
    authorEditable: false,
    description: "Language of submission",
  },
  {
    id: "5",
    field: "Sponsors",
    required: false,
    authorEditable: true,
    description: "Funding sources and sponsors",
  },
];

// Dummy Review Forms Data
export const DUMMY_REVIEW_FORMS = [
  {
    id: "1",
    title: "Standard Review Form",
    active: true,
    description: "Standard form for reviewing submissions",
    questions: 5,
  },
  {
    id: "2",
    title: "Technical Review Form",
    active: true,
    description: "Form for technical review of research methods",
    questions: 8,
  },
  {
    id: "3",
    title: "Statistical Review Form",
    active: false,
    description: "Form for statistical analysis review",
    questions: 6,
  },
];

// Dummy Library Files Data
export const DUMMY_LIBRARY_FILES = [
  {
    id: "1",
    fileName: "Author Guidelines.pdf",
    fileType: "PDF",
    dateUploaded: "2024-01-15",
    size: "2.5 MB",
  },
  {
    id: "2",
    fileName: "Review Template.docx",
    fileType: "DOCX",
    dateUploaded: "2024-01-10",
    size: "150 KB",
  },
  {
    id: "3",
    fileName: "Copyright Form.pdf",
    fileType: "PDF",
    dateUploaded: "2024-01-05",
    size: "500 KB",
  },
  {
    id: "4",
    fileName: "Submission Checklist.pdf",
    fileType: "PDF",
    dateUploaded: "2023-12-20",
    size: "800 KB",
  },
];

// Dummy Email Templates Data
export const DUMMY_EMAIL_TEMPLATES = [
  {
    id: "1",
    name: "Submission Acknowledgement",
    description: "Sent to authors when a submission is received",
    enabled: true,
    stage: "Submission",
    recipient: "Author",
  },
  {
    id: "2",
    name: "Review Request",
    description: "Sent to reviewers when requesting a review",
    enabled: true,
    stage: "Review",
    recipient: "Reviewer",
  },
  {
    id: "3",
    name: "Review Reminder",
    description: "Sent to reviewers as a reminder for pending reviews",
    enabled: true,
    stage: "Review",
    recipient: "Reviewer",
  },
  {
    id: "4",
    name: "Decision Notification",
    description: "Sent to authors when a decision is made",
    enabled: true,
    stage: "Review",
    recipient: "Author",
  },
  {
    id: "5",
    name: "Publication Notification",
    description: "Sent to authors when an article is published",
    enabled: false,
    stage: "Production",
    recipient: "Author",
  },
];

// Dummy Navigation Menus Data
export const DUMMY_NAVIGATION_MENUS = [
  {
    id: "1",
    title: "Primary Navigation",
    areaName: "primary",
    menuItems: 5,
  },
  {
    id: "2",
    title: "User Menu",
    areaName: "user",
    menuItems: 3,
  },
  {
    id: "3",
    title: "Footer Menu",
    areaName: "footer",
    menuItems: 4,
  },
];

// Dummy Navigation Menu Items Data
export const DUMMY_NAVIGATION_MENU_ITEMS = [
  {
    id: "1",
    order: 1,
    title: "Home",
    type: "Home",
    path: "/",
  },
  {
    id: "2",
    order: 2,
    title: "About",
    type: "About",
    path: "/about",
  },
  {
    id: "3",
    order: 3,
    title: "Current Issue",
    type: "Current",
    path: "/issue/current",
  },
  {
    id: "4",
    order: 4,
    title: "Archives",
    type: "Archives",
    path: "/archives",
  },
  {
    id: "5",
    order: 5,
    title: "Submit Article",
    type: "Submission",
    path: "/submissions",
  },
];

// Dummy Plugins Data
export const DUMMY_PLUGINS = [
  {
    id: "1",
    name: "CrossRef Export Plugin",
    version: "1.3.0",
    status: "enabled",
    category: "generic",
    description: "Export article metadata to CrossRef",
  },
  {
    id: "2",
    name: "PayPal Plugin",
    version: "2.1.0",
    status: "enabled",
    category: "paymethod",
    description: "Accept payments via PayPal",
  },
  {
    id: "3",
    name: "ORCID Profile Plugin",
    version: "1.2.5",
    status: "enabled",
    category: "generic",
    description: "ORCID profile integration",
  },
  {
    id: "4",
    name: "Google Analytics Plugin",
    version: "1.0.3",
    status: "disabled",
    category: "generic",
    description: "Track website analytics with Google Analytics",
  },
];

