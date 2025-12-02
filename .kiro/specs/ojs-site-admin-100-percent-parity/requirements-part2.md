# Requirements Document Part 2: Additional Site Admin Features

## Requirement 9: Journal Settings Wizard

**User Story:** As a Site Admin, I want to guide journal managers through initial setup with a wizard matching OJS 3.3, so that new journals are properly configured.

#### Acceptance Criteria

1. WHEN accessing wizard at `/admin/wizard/[journalId]` THEN the system SHALL display multi-step wizard with progress indicator
2. WHEN on step 1 (Journal Information) THEN the system SHALL show form with: Journal name, Journal initials, Journal abbreviation, Publisher, ISSN (print), ISSN (online), Description
3. WHEN on step 2 (Theme & Appearance) THEN the system SHALL show: Theme selection, Primary color, Header background, Logo upload, Favicon upload
4. WHEN on step 3 (Search Indexing) THEN the system SHALL show: Search description, Custom meta tags, Indexing options (OAI, Google Scholar, etc.)
5. WHEN on step 4 (Users & Roles) THEN the system SHALL show interface to add initial journal manager and editors
6. WHEN completing wizard THEN the system SHALL save all settings to journal_settings table and redirect to journal dashboard
7. WHEN clicking "Previous" THEN the system SHALL navigate to previous step without losing entered data
8. WHEN clicking "Save & Exit" THEN the system SHALL save progress and allow resuming later

---

## Requirement 10: Scheduled Tasks Management

**User Story:** As a Site Admin, I want to manage scheduled tasks matching OJS 3.3, so that I can configure automated system maintenance and notifications.

#### Acceptance Criteria

1. WHEN accessing `/admin/system/scheduled-tasks` THEN the system SHALL display list of all registered scheduled tasks
2. WHEN viewing task list THEN the system SHALL show for each task: Name, Description, Schedule (cron format), Last run, Next run, Status, Actions
3. WHEN clicking "Run Now" for a task THEN the system SHALL execute task immediately and show execution log
4. WHEN clicking "View Logs" THEN the system SHALL display task execution history with: Timestamp, Duration, Status, Output/Errors
5. WHEN clicking "Edit Schedule" THEN the system SHALL open cron editor with visual interface
6. WHEN clicking "Enable/Disable" THEN the system SHALL toggle task active status
7. WHEN scheduled task runs THEN the system SHALL log execution to scheduled_task_logs table
8. WHEN task fails THEN the system SHALL send notification email to site admin

---

## Requirement 11: Email Templates Management

**User Story:** As a Site Admin, I want to manage site-wide email templates matching OJS 3.3, so that I can customize system notifications.

#### Acceptance Criteria

1. WHEN accessing `/admin/email-templates` THEN the system SHALL display list of all email templates grouped by category
2. WHEN viewing template list THEN the system SHALL show: Template name, Subject, Description, Can disable, Can edit, Actions
3. WHEN clicking "Edit" for template THEN the system SHALL open editor with: Subject field, Body editor (with variable placeholders), Preview button
4. WHEN editing template THEN the system SHALL show available variables (e.g., {$recipientName}, {$submissionTitle}) with descriptions
5. WHEN clicking "Preview" THEN the system SHALL render template with sample data
6. WHEN clicking "Reset to Default" THEN the system SHALL restore original template from registry
7. WHEN clicking "Disable" for template THEN the system SHALL prevent system from sending that email type
8. WHEN saving template THEN the system SHALL validate syntax and store in email_templates table

---

## Requirement 12: Site-wide Announcements

**User Story:** As a Site Admin, I want to manage site-wide announcements matching OJS 3.3, so that I can communicate important information to all users.

#### Acceptance Criteria

1. WHEN accessing `/admin/announcements` THEN the system SHALL display list of all site announcements
2. WHEN viewing announcement list THEN the system SHALL show: Title, Date posted, Expiry date, Type, Actions
3. WHEN clicking "Add Announcement" THEN the system SHALL open form with: Title, Short description, Full description, Type, Expiry date
4. WHEN creating announcement THEN the system SHALL validate required fields and store in announcements table with assoc_type = SITE
5. WHEN announcement is active THEN the system SHALL display on all journal homepages (if configured)
6. WHEN announcement expires THEN the system SHALL automatically hide from public view
7. WHEN clicking "Edit" THEN the system SHALL open announcement editor
8. WHEN clicking "Delete" THEN the system SHALL show confirmation and remove announcement

---

## Requirement 13: Import/Export Tools

**User Story:** As a Site Admin, I want to use import/export tools matching OJS 3.3, so that I can migrate data and integrate with external systems.

#### Acceptance Criteria

1. WHEN accessing `/admin/tools/import-export` THEN the system SHALL display list of available import/export plugins
2. WHEN selecting "Native XML" plugin THEN the system SHALL show options to: Export journals, Export issues, Export articles, Import XML
3. WHEN exporting data THEN the system SHALL generate XML file matching OJS 3.3 schema and provide download link
4. WHEN importing XML THEN the system SHALL validate against schema, show preview of changes, and require confirmation
5. WHEN selecting "Users XML" plugin THEN the system SHALL allow bulk user import/export
6. WHEN selecting "PubMed XML" plugin THEN the system SHALL generate PubMed-compliant XML for published articles
7. WHEN selecting "DOAJ" plugin THEN the system SHALL export article metadata in DOAJ format
8. WHEN import fails THEN the system SHALL show detailed error messages and rollback changes

---

## Requirement 14: Site Backup & Restore

**User Story:** As a Site Admin, I want to backup and restore the entire site matching OJS 3.3 functionality, so that I can protect against data loss.

#### Acceptance Criteria

1. WHEN accessing `/admin/tools/backup` THEN the system SHALL show backup options: Full backup, Database only, Files only
2. WHEN creating full backup THEN the system SHALL export: Database dump, All uploaded files, Configuration files, Plugin files
3. WHEN backup completes THEN the system SHALL provide download link and store backup metadata in backups table
4. WHEN accessing restore interface THEN the system SHALL show list of available backups with: Date, Size, Type, Actions
5. WHEN restoring backup THEN the system SHALL show warning, require confirmation, and create pre-restore backup
6. WHEN restore completes THEN the system SHALL verify data integrity and show success/failure report
7. WHEN scheduling automatic backups THEN the system SHALL allow setting: Frequency, Retention period, Storage location (local/S3/etc.)

---

## Requirement 15: Site Access & Security

**User Story:** As a Site Admin, I want to configure site access and security settings matching OJS 3.3, so that I can control who can access the system.

#### Acceptance Criteria

1. WHEN accessing `/admin/settings/access` THEN the system SHALL show security options: User registration, CAPTCHA, Password requirements, Session timeout
2. WHEN enabling user registration THEN the system SHALL allow users to self-register with email verification
3. WHEN disabling user registration THEN the system SHALL hide registration form and show "Contact administrator" message
4. WHEN enabling CAPTCHA THEN the system SHALL show CAPTCHA on: Registration, Login (after failed attempts), Contact forms
5. WHEN configuring password requirements THEN the system SHALL allow setting: Minimum length, Require uppercase, Require numbers, Require special characters
6. WHEN setting session timeout THEN the system SHALL automatically logout inactive users after specified duration
7. WHEN enabling two-factor authentication THEN the system SHALL require 2FA for admin accounts
8. WHEN configuring IP restrictions THEN the system SHALL allow whitelisting/blacklisting IP ranges for admin access

