# Requirements Document: OJS Site Admin 100% Parity

## Introduction

Dokumen ini mendefinisikan requirements untuk mencapai 100% parity antara OJS PKP 3.3 Site Admin dengan implementasi Next.js. Tujuannya adalah membuat clone yang identik dalam hal UI, UX, workflow, logic, dan fitur - siap untuk production.

## Glossary

- **Site Admin**: Administrator tingkat site yang memiliki akses penuh ke semua journal dan konfigurasi sistem
- **OJS PKP 3.3**: Open Journal Systems versi 3.3.0 dari Public Knowledge Project
- **Context**: Istilah OJS untuk journal/press instance
- **Hosted Journal**: Journal yang di-host dalam instalasi OJS multi-journal
- **Wizard**: Multi-step form untuk konfigurasi awal journal
- **Plugin**: Modul ekstensible yang menambah fungsionalitas OJS
- **Locale**: Bahasa/regional setting (contoh: en_US, id_ID)
- **Theme**: Template visual untuk journal
- **Navigation Menu**: Menu yang dapat dikustomisasi untuk site/journal

---

## Requirement 1: Site Admin Dashboard

**User Story:** As a Site Admin, I want to access a dashboard that matches OJS 3.3 exactly, so that I have familiar navigation and quick access to all administrative functions.

#### Acceptance Criteria

1. WHEN a Site Admin logs in THEN the system SHALL display the admin index page at `/admin` with identical layout to OJS 3.3
2. WHEN the admin index loads THEN the system SHALL display the "Open Journal Systems" header with PKP blue theme (#002C40)
3. WHEN the admin index loads THEN the system SHALL show the site sidebar with sections: Site Management, Settings, Users, Statistics, and System Information
4. WHEN the admin index loads THEN the system SHALL display action cards for: Hosted Journals, Site Settings, Languages, Users, Statistics, and System tools
5. WHEN version check detects newer version THEN the system SHALL display dismissible warning banner with upgrade link

---

## Requirement 2: Hosted Journals Management

**User Story:** As a Site Admin, I want to manage all hosted journals with the same interface as OJS 3.3, so that I can create, edit, enable/disable, and delete journals.

#### Acceptance Criteria

1. WHEN accessing `/admin/contexts` THEN the system SHALL display a table of all journals with columns: Title, Path, Enabled status, and Actions
2. WHEN clicking "Create Journal" THEN the system SHALL open the Journal Creation Wizard with identical steps to OJS 3.3
3. WHEN creating a journal THEN the system SHALL validate path uniqueness and format (lowercase, no spaces, alphanumeric + dash/underscore)
4. WHEN a journal is created THEN the system SHALL initialize default user groups (Manager, Editor, Reviewer, Author, Reader) with correct role_id values
5. WHEN clicking "Settings Wizard" for a journal THEN the system SHALL open multi-step wizard with tabs: Information, Theme, Search Indexing
6. WHEN clicking "Edit" for a journal THEN the system SHALL navigate to journal-specific settings at `/management/settings/journal`
7. WHEN clicking "Delete" for a journal THEN the system SHALL show confirmation dialog and soft-delete or archive the journal
8. WHEN toggling "Enabled" THEN the system SHALL update journal.enabled field and show/hide journal from public site

---

## Requirement 3: Site Settings - Setup Tab

**User Story:** As a Site Admin, I want to configure site-wide settings that match OJS 3.3 structure, so that I can control site information, languages, navigation, and bulk emails.

#### Acceptance Criteria

1. WHEN accessing `/admin/site-settings/site-setup` THEN the system SHALL display nested tabs: Settings, Information, Languages, Navigation Menus, Bulk Emails
2. WHEN on Settings sub-tab THEN the system SHALL show form with: Site Title, Redirect URL, Minimum Password Length, and Force Login options
3. WHEN on Information sub-tab THEN the system SHALL show form with: About Site, Contact Name, Contact Email, Mailing Address, and Technical Support Contact
4. WHEN on Languages sub-tab THEN the system SHALL display installed locales with options to: Install new locale, Set primary locale, Enable/disable locales, Reload locale defaults
5. WHEN installing new locale THEN the system SHALL download locale files and register in site_languages table
6. WHEN on Navigation Menus sub-tab THEN the system SHALL display menu builder with drag-drop interface matching OJS 3.3
7. WHEN on Bulk Emails sub-tab THEN the system SHALL show form to configure bulk email settings and test SMTP connection
8. WHEN saving any settings THEN the system SHALL validate inputs and store in appropriate tables (site_settings, site_information, etc.)

---

## Requirement 4: Site Settings - Appearance Tab

**User Story:** As a Site Admin, I want to customize site appearance with the same options as OJS 3.3, so that I can control theme, logo, colors, and styling.

#### Acceptance Criteria

1. WHEN accessing `/admin/site-settings/appearance` THEN the system SHALL display nested tabs: Theme, Setup, Advanced
2. WHEN on Theme sub-tab THEN the system SHALL show: Theme selection dropdown, Header background color picker, Primary color picker, Footer content editor
3. WHEN on Setup sub-tab THEN the system SHALL show: Logo upload, Page header upload, Page footer editor, Sidebar management, Custom stylesheet upload
4. WHEN on Advanced sub-tab THEN the system SHALL show: Custom CSS editor, Custom JavaScript editor, Additional HEAD content
5. WHEN uploading logo THEN the system SHALL validate file type (jpg, png, gif), resize if needed, store in Supabase Storage, and save URL to site_appearance
6. WHEN changing theme THEN the system SHALL update site_appearance.theme_name and reload CSS accordingly
7. WHEN saving appearance settings THEN the system SHALL clear cache and apply changes immediately to public site

---

## Requirement 5: Site Settings - Plugins Tab

**User Story:** As a Site Admin, I want to manage plugins with the same interface as OJS 3.3, so that I can install, enable, disable, configure, and delete plugins.

#### Acceptance Criteria

1. WHEN accessing `/admin/site-settings/plugins` THEN the system SHALL display nested tabs: Installed Plugins, Plugin Gallery
2. WHEN on Installed Plugins tab THEN the system SHALL show grid of plugins with: Name, Version, Author, Description, Enable/Disable toggle, Settings button, Delete button
3. WHEN on Plugin Gallery tab THEN the system SHALL fetch available plugins from PKP plugin gallery API and display with: Name, Description, Version, Compatibility, Install button
4. WHEN clicking Settings for a plugin THEN the system SHALL open plugin-specific configuration modal/page
5. WHEN enabling a plugin THEN the system SHALL run plugin initialization hooks and update site_plugins.enabled = true
6. WHEN disabling a plugin THEN the system SHALL run plugin cleanup hooks and update site_plugins.enabled = false
7. WHEN installing plugin from gallery THEN the system SHALL download plugin files, extract to plugins directory, register in database, and run installation hooks
8. WHEN deleting plugin THEN the system SHALL show confirmation, run uninstall hooks, remove files, and delete database records

---

## Requirement 6: Users Management

**User Story:** As a Site Admin, I want to manage all users across all journals with the same interface as OJS 3.3, so that I can create, edit, merge, disable, and assign roles to users.

#### Acceptance Criteria

1. WHEN accessing `/admin/users` THEN the system SHALL display user list with filters: Search by name/email, Filter by role, Filter by journal
2. WHEN the user list loads THEN the system SHALL show table with columns: Name, Username, Email, Roles, Last Login, Actions
3. WHEN clicking "Add User" THEN the system SHALL open user creation form with fields matching OJS 3.3: Username, Email, Password, First Name, Last Name, Country, Affiliation
4. WHEN creating user THEN the system SHALL validate username uniqueness, email format, password strength, and hash password with bcrypt
5. WHEN clicking "Edit" for user THEN the system SHALL open user profile editor with tabs: Identity, Contact, Roles, Password
6. WHEN on Roles tab THEN the system SHALL show all journals and available user groups per journal with checkboxes to assign/remove roles
7. WHEN clicking "Merge Users" THEN the system SHALL open merge wizard to combine duplicate user accounts and transfer all submissions/reviews/assignments
8. WHEN clicking "Disable" for user THEN the system SHALL set users.disabled = true and prevent login while preserving all data
9. WHEN clicking "Email User" THEN the system SHALL open email composer with template selection

---

## Requirement 7: Statistics & Reports

**User Story:** As a Site Admin, I want to view site-wide statistics and generate reports matching OJS 3.3, so that I can monitor system usage and performance.

#### Acceptance Criteria

1. WHEN accessing `/admin/statistics` THEN the system SHALL display dashboard with: Total journals, Total users, Total submissions, Active submissions, Published articles
2. WHEN the statistics page loads THEN the system SHALL show charts for: Submissions over time, Users by role, Articles by journal, Review completion rates
3. WHEN selecting date range THEN the system SHALL filter all statistics and charts accordingly
4. WHEN clicking "Generate Report" THEN the system SHALL show report builder with options matching OJS 3.3: Report type, Date range, Format (CSV/Excel/PDF), Filters
5. WHEN generating report THEN the system SHALL queue background job, process data, and provide download link when complete
6. WHEN viewing article statistics THEN the system SHALL show: Abstract views, Galley views, Downloads by file type, Geographic distribution

---

## Requirement 8: System Information & Tools

**User Story:** As a Site Admin, I want to access system information and maintenance tools matching OJS 3.3, so that I can monitor system health and perform maintenance tasks.

#### Acceptance Criteria

1. WHEN accessing `/admin/system/system-information` THEN the system SHALL display: OJS version, Database version, Server info, PHP/Node.js version, Configuration details
2. WHEN on system information page THEN the system SHALL show link to "Extended Node.js Information" (equivalent to phpinfo)
3. WHEN accessing `/admin/system/nodejs-info` THEN the system SHALL display detailed Node.js configuration, environment variables (filtered for security), and system resources
4. WHEN accessing system tools THEN the system SHALL show buttons for: Clear template cache, Clear data cache, Clear scheduled task logs, Expire user sessions
5. WHEN clicking "Clear Template Cache" THEN the system SHALL delete cached templates and show success message
6. WHEN clicking "Clear Data Cache" THEN the system SHALL clear Redis/memory cache and show success message
7. WHEN clicking "Expire User Sessions" THEN the system SHALL delete all active sessions except current admin session
8. WHEN accessing version check THEN the system SHALL query PKP version API and display: Current version, Latest version, Upgrade available status, Release notes link

