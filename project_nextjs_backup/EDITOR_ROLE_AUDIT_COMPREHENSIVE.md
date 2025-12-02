# Audit Lengkap Editor Role - OJS PKP 3.3 vs Next.js Project

## Daftar Isi
1. [Frontend Pages/Components](#frontend-pagescomponents)
2. [Backend Handlers/Actions](#backend-handlersactions)
3. [Workflow Features](#workflow-features)
4. [Editor Decisions](#editor-decisions)
5. [File Management](#file-management)
6. [Participant Management](#participant-management)
7. [Review Management](#review-management)
8. [Publication Management](#publication-management)
9. [Statistics & Reports](#statistics--reports)
10. [Summary & Comparison](#summary--comparison)

## 1. Frontend Pages/Components

### OJS 3.3 (PHP)
- `pages/editor/EditorHandler.inc.php` - Main Editor Handler
- `templates/editor/*.tpl` - All editor templates

### Next.js Project
- `src/app/(editor)/editor/page.tsx` - Editor Dashboard
- `src/app/(editor)/editor/submissions/[id]/page.tsx` - Submission Detail
- `src/features/editor/components/*.tsx` - All editor components

---

## 2. Backend Handlers/Actions

### OJS 3.3 (PHP)

#### Editor Handler Files:
1. `pages/editor/EditorHandler.inc.php` - Main editor page handler
2. `controllers/modals/editorDecision/EditorDecisionHandler.inc.php` - Editor decision modal
3. `lib/pkp/controllers/modals/editorDecision/PKPEditorDecisionHandler.inc.php` - Base editor decision handler
4. `lib/pkp/controllers/modals/editorDecision/form/EditorDecisionForm.inc.php` - Base editor decision form
5. `lib/pkp/controllers/modals/editorDecision/form/EditorDecisionWithEmailForm.inc.php` - Editor decision with email form
6. `controllers/modals/editorDecision/form/InitiateExternalReviewForm.inc.php` - Initiate external review form
7. `lib/pkp/controllers/tab/workflow/WorkflowTabHandler.inc.php` - Workflow tab handler
8. `lib/pkp/controllers/tab/workflow/ReviewRoundTabHandler.inc.php` - Review round tab handler
9. `lib/pkp/controllers/grid/files/submission/EditorSubmissionDetailsFilesGridHandler.inc.php` - Submission files grid
10. `lib/pkp/controllers/grid/files/review/EditorReviewFilesGridHandler.inc.php` - Review files grid
11. `lib/pkp/controllers/grid/files/attachment/EditorReviewAttachmentsGridHandler.inc.php` - Review attachments grid
12. `lib/pkp/controllers/grid/files/attachment/EditorSelectableReviewAttachmentsGridHandler.inc.php` - Selectable review attachments grid
13. `lib/pkp/controllers/modals/publish/AssignToIssueHandler.inc.php` - Assign to issue handler
14. `lib/pkp/classes/workflow/PKPEditorDecisionActionsManager.inc.php` - Editor decision actions manager
15. `classes/workflow/EditorDecisionActionsManager.inc.php` - OJS-specific editor decision actions manager
16. `lib/pkp/classes/submission/action/EditorAction.inc.php` - Editor actions

#### Editor Decision Forms:
- SendReviewsForm (Request Revisions, Resubmit, Decline)
- PromoteForm (Accept, Send to Production)
- InitiateExternalReviewForm
- NewReviewRoundForm
- RevertDeclineForm
- RecommendationForm (for Recommend Only role)

### Next.js Project

#### API Routes:
1. `src/app/api/editor/submissions/[submissionId]/activity/route.ts` - Activity log
2. `src/app/api/editor/submissions/[submissionId]/files/route.ts` - File management
3. `src/app/api/editor/submissions/[submissionId]/metadata/route.ts` - Metadata
4. `src/app/api/editor/submissions/[submissionId]/participants/route.ts` - Participants
5. `src/app/api/editor/submissions/[submissionId]/review-rounds/route.ts` - Review rounds
6. `src/app/api/editor/submissions/[submissionId]/reviewers/route.ts` - Reviewers
7. `src/app/api/editor/submissions/[submissionId]/workflow/route.ts` - Workflow

#### Server Actions:
1. `src/features/editor/actions/editor-decisions.ts` - Editor decisions
2. `src/features/editor/actions/participant-assignment.ts` - Participant assignment
3. `src/features/editor/actions/reviewer-assignment.ts` - Reviewer assignment
4. `src/features/editor/actions/production-files.ts` - Production files

---

*[Audit ini akan dilanjutkan dengan pengecekan detail per file...]*



