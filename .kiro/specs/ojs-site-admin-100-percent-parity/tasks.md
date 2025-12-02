# Implementation Plan: OJS Site Admin 100% Parity

## Phase 1: Database Schema & Core Infrastructure

- [x] 1. Complete database schema alignment


  - [x] 1.1 Add missing OJS tables (queries, edit_decisions, stage_assignments)



  - [x] 1.2 Verify all existing tables match OJS 3.3 schema exactly


  - [x] 1.3 Add missing indexes for performance


  - [x] 1.4 Create database migration scripts


  - [x] 1.5 Set up Row Level Security (RLS) policies




  - _Requirements: Database schema must be 100% compatible with OJS 3.3_

- [ ] 2. Settings management infrastructure
  - [ ] 2.1 Create settings helper functions (get/set/localized)
  - [ ] 2.2 Implement settings caching layer
  - [ ] 2.3 Create settings validation schemas (Zod)
  - [ ] 2.4 Build settings serialization/deserialization
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. File storage setup
  - [ ] 3.1 Configure Supabase Storage buckets (journals, users, plugins, temp)
  - [ ] 3.2 Implement file upload service with validation
  - [ ] 3.3 Create file download/streaming service
  - [ ] 3.4 Set up CDN for public files
  - [ ] 3.5 Implement file cleanup/garbage collection
  - _Requirements: 4.5, 4.6_

- [ ] 4. Authentication & permissions refinement
  - [ ] 4.1 Verify site admin permission checks
  - [ ] 4.2 Implement session management matching OJS
  - [ ] 4.3 Add "force login" functionality
  - [ ] 4.4 Implement IP restriction system
  - _Requirements: 15.1-15.8_

## Phase 2: Admin Dashboard & Navigation

- [ ] 5. Admin layout component
  - [ ] 5.1 Create admin layout with PKP header (#002C40)
  - [ ] 5.2 Build site sidebar navigation
  - [ ] 5.3 Implement breadcrumb system
  - [ ] 5.4 Add user menu with profile/logout
  - [ ] 5.5 Create language switcher
  - [ ] 5.6 Add notification bell (placeholder)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. Admin dashboard page
  - [ ] 6.1 Create dashboard layout matching OJS 3.3
  - [ ] 6.2 Build action cards (Hosted Journals, Settings, Users, etc.)
  - [ ] 6.3 Add quick stats widgets
  - [ ] 6.4 Implement version check warning banner
  - [ ] 6.5 Add recent activity feed
  - _Requirements: 1.1-1.5_

## Phase 3: Hosted Journals Management

- [ ] 7. Journals list page
  - [ ] 7.1 Create journals table with PKP styling
  - [ ] 7.2 Implement sorting by title/path/enabled
  - [ ] 7.3 Add search/filter functionality
  - [ ] 7.4 Build enable/disable toggle
  - [ ] 7.5 Add edit/delete/wizard actions
  - _Requirements: 2.1, 2.8_

- [ ] 8. Journal creation wizard
  - [ ] 8.1 Create wizard layout with progress indicator
  - [ ] 8.2 Build Step 1: Basic Information form
  - [ ] 8.3 Build Step 2: Theme & Appearance form
  - [ ] 8.4 Build Step 3: Search Indexing form
  - [ ] 8.5 Build Step 4: Initial Users form
  - [ ] 8.6 Implement wizard navigation (next/previous/save & exit)
  - [ ] 8.7 Add wizard state persistence
  - [ ] 8.8 Implement wizard completion flow
  - _Requirements: 2.2, 2.3, 9.1-9.8_

- [ ] 9. Journal creation backend
  - [ ] 9.1 Create journal record in database
  - [ ] 9.2 Initialize default user groups with correct role_ids
  - [ ] 9.3 Create default sections
  - [ ] 9.4 Set up default email templates
  - [ ] 9.5 Initialize navigation menus
  - [ ] 9.6 Create journal directory structure
  - _Requirements: 2.4, 2.5_

- [ ] 10. Journal settings wizard (post-creation)
  - [ ] 10.1 Create wizard route `/admin/wizard/[journalId]`
  - [ ] 10.2 Load existing journal data
  - [ ] 10.3 Allow editing all wizard steps
  - [ ] 10.4 Save changes to journal_settings
  - _Requirements: 2.5, 9.1-9.8_

- [ ] 11. Journal deletion
  - [ ] 11.1 Create confirmation dialog
  - [ ] 11.2 Implement soft delete (set enabled=false, add deleted_at)
  - [ ] 11.3 Archive journal files
  - [ ] 11.4 Send notification to journal managers
  - _Requirements: 2.7_

## Phase 4: Site Settings - Setup Tab

- [ ] 12. Site Settings layout
  - [ ] 12.1 Create settings layout with main tabs (Setup, Appearance, Plugins)
  - [ ] 12.2 Implement tab navigation
  - [ ] 12.3 Add save/cancel buttons
  - [ ] 12.4 Implement unsaved changes warning
  - _Requirements: 3.1_

- [ ] 13. Setup - Settings sub-tab
  - [ ] 13.1 Create form with: Site Title, Redirect URL, Min Password Length
  - [ ] 13.2 Add Force Login checkbox
  - [ ] 13.3 Implement form validation
  - [ ] 13.4 Create save handler
  - _Requirements: 3.2_

- [ ] 14. Setup - Information sub-tab
  - [ ] 14.1 Create form with: About Site, Contact info, Mailing Address
  - [ ] 14.2 Add rich text editor for About Site
  - [ ] 14.3 Implement email validation
  - [ ] 14.4 Create save handler
  - _Requirements: 3.3_

- [ ] 15. Setup - Languages sub-tab
  - [ ] 15.1 Display list of installed locales
  - [ ] 15.2 Add "Install Locale" button with modal
  - [ ] 15.3 Implement locale installation (download + register)
  - [ ] 15.4 Add primary locale selector
  - [ ] 15.5 Add enable/disable toggles per locale
  - [ ] 15.6 Add "Reload Defaults" button
  - _Requirements: 3.4, 3.5_

- [ ] 16. Setup - Navigation Menus sub-tab
  - [ ] 16.1 Display list of navigation menus
  - [ ] 16.2 Create menu builder with drag-drop
  - [ ] 16.3 Add menu item types (custom link, page, etc.)
  - [ ] 16.4 Implement menu item editing
  - [ ] 16.5 Add menu item deletion
  - [ ] 16.6 Save menu structure to database
  - _Requirements: 3.6_

- [ ] 17. Setup - Bulk Emails sub-tab
  - [ ] 17.1 Create form with SMTP settings
  - [ ] 17.2 Add "Test Connection" button
  - [ ] 17.3 Implement SMTP validation
  - [ ] 17.4 Create save handler
  - _Requirements: 3.7_

## Phase 5: Site Settings - Appearance Tab

- [ ] 18. Appearance - Theme sub-tab
  - [ ] 18.1 Create theme selector dropdown
  - [ ] 18.2 Add header background color picker
  - [ ] 18.3 Add primary color picker
  - [ ] 18.4 Add footer content editor
  - [ ] 18.5 Implement theme preview
  - [ ] 18.6 Create save handler with cache clear
  - _Requirements: 4.2, 4.6, 4.7_

- [ ] 19. Appearance - Setup sub-tab
  - [ ] 19.1 Add logo upload with preview
  - [ ] 19.2 Add page header upload
  - [ ] 19.3 Add page footer rich text editor
  - [ ] 19.4 Create sidebar block manager
  - [ ] 19.5 Add custom stylesheet upload
  - [ ] 19.6 Implement file validation (size, type)
  - [ ] 19.7 Create save handler with file upload
  - _Requirements: 4.3, 4.5_

- [ ] 20. Appearance - Advanced sub-tab
  - [ ] 20.1 Add custom CSS editor with syntax highlighting
  - [ ] 20.2 Add custom JavaScript editor
  - [ ] 20.3 Add additional HEAD content textarea
  - [ ] 20.4 Implement CSS/JS validation
  - [ ] 20.5 Create save handler
  - _Requirements: 4.4_


## Phase 6: Site Settings - Plugins Tab

- [ ] 21. Plugin infrastructure
  - [ ] 21.1 Create plugin registry system
  - [ ] 21.2 Implement plugin loader
  - [ ] 21.3 Create plugin hooks system
  - [ ] 21.4 Build plugin settings storage
  - _Requirements: 5.1-5.8_

- [ ] 22. Installed Plugins tab
  - [ ] 22.1 Display grid of installed plugins
  - [ ] 22.2 Add enable/disable toggles
  - [ ] 22.3 Create settings button with modal
  - [ ] 22.4 Add delete button with confirmation
  - [ ] 22.5 Implement plugin enable/disable logic
  - _Requirements: 5.2, 5.5, 5.6_

- [ ] 23. Plugin Gallery tab
  - [ ] 23.1 Fetch plugins from PKP gallery API
  - [ ] 23.2 Display plugin cards with info
  - [ ] 23.3 Add install button
  - [ ] 23.4 Implement plugin download
  - [ ] 23.5 Extract and register plugin
  - [ ] 23.6 Run plugin installation hooks
  - _Requirements: 5.3, 5.7_

- [ ] 24. Plugin deletion
  - [ ] 24.1 Show confirmation dialog
  - [ ] 24.2 Run plugin uninstall hooks
  - [ ] 24.3 Remove plugin files
  - [ ] 24.4 Delete database records
  - _Requirements: 5.8_

## Phase 7: Users Management

- [ ] 25. Users list page
  - [ ] 25.1 Create users table with PKP styling
  - [ ] 25.2 Add search by name/email
  - [ ] 25.3 Add filter by role
  - [ ] 25.4 Add filter by journal
  - [ ] 25.5 Implement sorting
  - [ ] 25.6 Add pagination
  - _Requirements: 6.1, 6.2_

- [ ] 26. User creation
  - [ ] 26.1 Create user form with all OJS fields
  - [ ] 26.2 Implement username uniqueness check
  - [ ] 26.3 Implement email validation
  - [ ] 26.4 Add password strength indicator
  - [ ] 26.5 Hash password with bcrypt
  - [ ] 26.6 Create user record
  - [ ] 26.7 Send welcome email
  - _Requirements: 6.3, 6.4_

- [ ] 27. User editing
  - [ ] 27.1 Create user editor with tabs (Identity, Contact, Roles, Password)
  - [ ] 27.2 Build Identity tab form
  - [ ] 27.3 Build Contact tab form
  - [ ] 27.4 Build Roles tab with journal/role matrix
  - [ ] 27.5 Build Password tab with change password form
  - [ ] 27.6 Implement save handlers for each tab
  - _Requirements: 6.5, 6.6_

- [ ] 28. User role management
  - [ ] 28.1 Display all journals and user groups
  - [ ] 28.2 Add checkboxes for role assignment
  - [ ] 28.3 Implement assign role action
  - [ ] 28.4 Implement remove role action
  - [ ] 28.5 Send role assignment notification emails
  - _Requirements: 6.6_

- [ ] 29. User merge functionality
  - [ ] 29.1 Create merge wizard
  - [ ] 29.2 Select source and target users
  - [ ] 29.3 Show preview of merge
  - [ ] 29.4 Transfer submissions
  - [ ] 29.5 Transfer reviews
  - [ ] 29.6 Transfer role assignments
  - [ ] 29.7 Delete source user
  - _Requirements: 6.7_

- [ ] 30. User disable/enable
  - [ ] 30.1 Add disable button
  - [ ] 30.2 Set users.disabled = true
  - [ ] 30.3 Prevent login for disabled users
  - [ ] 30.4 Add enable button
  - _Requirements: 6.8_

- [ ] 31. Email user functionality
  - [ ] 31.1 Create email composer modal
  - [ ] 31.2 Add template selector
  - [ ] 31.3 Implement variable replacement
  - [ ] 31.4 Add preview
  - [ ] 31.5 Send email
  - _Requirements: 6.9_

## Phase 8: Statistics & Reports

- [ ] 32. Statistics dashboard
  - [ ] 32.1 Create statistics page layout
  - [ ] 32.2 Add summary cards (journals, users, submissions, etc.)
  - [ ] 32.3 Build submissions over time chart
  - [ ] 32.4 Build users by role chart
  - [ ] 32.5 Build articles by journal chart
  - [ ] 32.6 Add date range selector
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 33. Report generator
  - [ ] 33.1 Create report builder interface
  - [ ] 33.2 Add report type selector
  - [ ] 33.3 Add date range picker
  - [ ] 33.4 Add format selector (CSV/Excel/PDF)
  - [ ] 33.5 Add filter options
  - [ ] 33.6 Implement report generation
  - [ ] 33.7 Queue background job
  - [ ] 33.8 Provide download link
  - _Requirements: 7.4, 7.5_

- [ ] 34. Article statistics
  - [ ] 34.1 Track abstract views
  - [ ] 34.2 Track galley views
  - [ ] 34.3 Track downloads by file type
  - [ ] 34.4 Display geographic distribution
  - _Requirements: 7.6_

## Phase 9: System Information & Tools

- [ ] 35. System information page
  - [ ] 35.1 Display OJS version
  - [ ] 35.2 Display database version
  - [ ] 35.3 Display server information
  - [ ] 35.4 Display Node.js version
  - [ ] 35.5 Display configuration details
  - [ ] 35.6 Add link to extended Node.js info
  - _Requirements: 8.1, 8.2_

- [ ] 36. Extended Node.js information page
  - [ ] 36.1 Display detailed Node.js config
  - [ ] 36.2 Display environment variables (filtered)
  - [ ] 36.3 Display system resources
  - [ ] 36.4 Add security filtering for sensitive data
  - _Requirements: 8.3_

- [ ] 37. System tools
  - [ ] 37.1 Create tools page
  - [ ] 37.2 Add "Clear Template Cache" button
  - [ ] 37.3 Add "Clear Data Cache" button
  - [ ] 37.4 Add "Clear Scheduled Task Logs" button
  - [ ] 37.5 Add "Expire User Sessions" button
  - [ ] 37.6 Implement cache clearing logic
  - [ ] 37.7 Implement session expiration logic
  - _Requirements: 8.4, 8.5, 8.6, 8.7_

- [ ] 38. Version check
  - [ ] 38.1 Query PKP version API
  - [ ] 38.2 Compare with current version
  - [ ] 38.3 Display upgrade available status
  - [ ] 38.4 Add link to release notes
  - [ ] 38.5 Implement dismissible warning banner
  - _Requirements: 8.8_

## Phase 10: Additional Features

- [ ] 39. Scheduled tasks management
  - [ ] 39.1 Display list of scheduled tasks
  - [ ] 39.2 Show task schedule (cron format)
  - [ ] 39.3 Add "Run Now" button
  - [ ] 39.4 Display execution logs
  - [ ] 39.5 Add cron editor
  - [ ] 39.6 Implement enable/disable toggle
  - _Requirements: 10.1-10.8_

- [ ] 40. Email templates management
  - [ ] 40.1 Display list of email templates
  - [ ] 40.2 Group by category
  - [ ] 40.3 Create template editor
  - [ ] 40.4 Add variable placeholders
  - [ ] 40.5 Implement preview
  - [ ] 40.6 Add reset to default
  - [ ] 40.7 Implement disable toggle
  - _Requirements: 11.1-11.8_

- [ ] 41. Site announcements
  - [ ] 41.1 Display list of announcements
  - [ ] 41.2 Create announcement form
  - [ ] 41.3 Implement expiry date logic
  - [ ] 41.4 Display on journal homepages
  - [ ] 41.5 Add edit/delete actions
  - _Requirements: 12.1-12.8_

- [ ] 42. Import/Export tools
  - [ ] 42.1 Create import/export page
  - [ ] 42.2 Implement Native XML export
  - [ ] 42.3 Implement Native XML import
  - [ ] 42.4 Implement Users XML export/import
  - [ ] 42.5 Implement PubMed XML export
  - [ ] 42.6 Implement DOAJ export
  - _Requirements: 13.1-13.8_

- [ ] 43. Backup & Restore
  - [ ] 43.1 Create backup interface
  - [ ] 43.2 Implement full backup
  - [ ] 43.3 Implement database-only backup
  - [ ] 43.4 Implement files-only backup
  - [ ] 43.5 Create restore interface
  - [ ] 43.6 Implement restore with verification
  - [ ] 43.7 Add automatic backup scheduling
  - _Requirements: 14.1-14.7_

- [ ] 44. Access & Security settings
  - [ ] 44.1 Create security settings page
  - [ ] 44.2 Add user registration toggle
  - [ ] 44.3 Add CAPTCHA configuration
  - [ ] 44.4 Add password requirements settings
  - [ ] 44.5 Add session timeout setting
  - [ ] 44.6 Add 2FA configuration
  - [ ] 44.7 Add IP restriction settings
  - _Requirements: 15.1-15.8_

## Phase 11: Testing & Quality Assurance

- [ ] 45. Unit tests
  - [ ] 45.1 Write tests for settings helpers
  - [ ] 45.2 Write tests for journal creation
  - [ ] 45.3 Write tests for user management
  - [ ] 45.4 Write tests for plugin system
  - [ ] 45.5 Write tests for permissions

- [ ] 46. Integration tests
  - [ ] 46.1 Test journal creation wizard flow
  - [ ] 46.2 Test user role assignment flow
  - [ ] 46.3 Test settings save/load flow
  - [ ] 46.4 Test plugin install/uninstall flow

- [ ] 47. E2E tests
  - [ ] 47.1 Test complete admin workflow
  - [ ] 47.2 Test multi-journal setup
  - [ ] 47.3 Test user management scenarios

- [ ] 48. UI/UX verification
  - [ ] 48.1 Compare every page with OJS 3.3 screenshots
  - [ ] 48.2 Verify all colors match PKP theme
  - [ ] 48.3 Verify all spacing matches OJS
  - [ ] 48.4 Verify all fonts match OJS
  - [ ] 48.5 Test responsive behavior

## Phase 12: Production Readiness

- [ ] 49. Performance optimization
  - [ ] 49.1 Implement database query optimization
  - [ ] 49.2 Add caching layer
  - [ ] 49.3 Optimize file uploads
  - [ ] 49.4 Add CDN for static assets

- [ ] 50. Security hardening
  - [ ] 50.1 Implement rate limiting
  - [ ] 50.2 Add CSRF protection
  - [ ] 50.3 Implement XSS prevention
  - [ ] 50.4 Add SQL injection prevention
  - [ ] 50.5 Implement file upload security

- [ ] 51. Documentation
  - [ ] 51.1 Write API documentation
  - [ ] 51.2 Write deployment guide
  - [ ] 51.3 Write admin user guide
  - [ ] 51.4 Write developer guide

- [ ] 52. Final verification
  - [ ] 52.1 Complete feature parity checklist
  - [ ] 52.2 Verify all OJS workflows work
  - [ ] 52.3 Load test with realistic data
  - [ ] 52.4 Security audit
  - [ ] 52.5 Accessibility audit
