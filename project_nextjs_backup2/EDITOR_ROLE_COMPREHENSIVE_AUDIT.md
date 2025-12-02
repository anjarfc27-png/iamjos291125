# AUDIT LENGKAP EDITOR ROLE - OJS PKP 3.3 vs Next.js Project

**Tanggal Audit:** 16 November 2025  
**Auditor:** AI Assistant  
**Scope:** Role Editor dan semua fitur yang berkaitan dengan Editor

---

## METODOLOGI AUDIT

1. **Identifikasi semua file terkait Editor di OJS 3.3 asli**
2. **Identifikasi semua file terkait Editor di Next.js Project**
3. **Bandingkan fitur per fitur secara detail**
4. **Identifikasi yang belum ada di Next.js**
5. **Identifikasi yang kelebihan di Next.js**
6. **Verifikasi konstanta dan tipe data**
7. **Verifikasi workflow dan alur bisnis**

---

## 1. EDITOR DECISION CONSTANTS

### OJS 3.3 Asli (PHP)

**File:** `classes/workflow/EditorDecisionActionsManager.inc.php`

```php
// Submission stage decision actions.
define('SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW', 8);

// Submission and review stages decision actions.
define('SUBMISSION_EDITOR_DECISION_ACCEPT', 1);
define('SUBMISSION_EDITOR_DECISION_DECLINE', 4);

// Review stage decisions actions.
define('SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS', 2);
define('SUBMISSION_EDITOR_DECISION_RESUBMIT', 3);
define('SUBMISSION_EDITOR_DECISION_NEW_ROUND', 16);

// Editorial stage decision actions.
define('SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION', 7);
```

**File:** `lib/pkp/classes/workflow/PKPEditorDecisionActionsManager.inc.php`

```php
define('SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE', 9);
define('SUBMISSION_EDITOR_DECISION_REVERT_DECLINE', 17);

// Recommendations (for Recommend Only role)
define('SUBMISSION_EDITOR_RECOMMEND_ACCEPT', 11);
define('SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS', 12);
define('SUBMISSION_EDITOR_RECOMMEND_RESUBMIT', 13);
define('SUBMISSION_EDITOR_RECOMMEND_DECLINE', 14);
```

### Next.js Project

**File:** `src/features/editor/types.ts`

```typescript
export const SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 6; // ❌ SALAH! Harusnya 8
export const SUBMISSION_EDITOR_DECISION_ACCEPT = 1; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_DECLINE = 8; // ❌ SALAH! Harusnya 4
export const SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE = 9; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 4; // ❌ SALAH! Harusnya 2
export const SUBMISSION_EDITOR_DECISION_RESUBMIT = 5; // ❌ SALAH! Harusnya 3
export const SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION = 7; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_REVERT_DECLINE = 17; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_NEW_ROUND = 10; // ❌ SALAH! Harusnya 16
```

**File:** `src/features/editor/constants/editor-decisions.ts`

```typescript
export const SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 2; // ❌ SALAH! Harusnya 8
export const SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 5; // ❌ SALAH! Harusnya 2
export const SUBMISSION_EDITOR_DECISION_RESUBMIT = 6; // ❌ SALAH! Harusnya 3
```

### ❌ MASALAH DITEMUKAN:

**Konstanta Editor Decision tidak sesuai dengan OJS 3.3 asli!**

| Decision | OJS 3.3 Asli | Next.js (types.ts) | Next.js (constants.ts) | Status |
|----------|--------------|-------------------|------------------------|--------|
| EXTERNAL_REVIEW | 8 | 6 | 2 | ❌ SALAH di kedua file |
| ACCEPT | 1 | 1 | - | ✅ BENAR |
| DECLINE | 4 | 8 | 4 | ❌ SALAH di types.ts |
| INITIAL_DECLINE | 9 | 9 | 9 | ✅ BENAR |
| PENDING_REVISIONS | 2 | 4 | 5 | ❌ SALAH di kedua file |
| RESUBMIT | 3 | 5 | 6 | ❌ SALAH di kedua file |
| SEND_TO_PRODUCTION | 7 | 7 | 7 | ✅ BENAR |
| REVERT_DECLINE | 17 | 17 | 17 | ✅ BENAR |
| NEW_ROUND | 16 | 10 | - | ❌ SALAH di types.ts |

**Rekomendasi:** Perbaiki semua konstanta decision agar sesuai dengan OJS 3.3 asli!

---

## 2. FRONTEND PAGES/COMPONENTS

### OJS 3.3 Asli (PHP Templates)

**File:** `lib/pkp/templates/controllers/tab/workflow/`

1. `submission.tpl` - Submission/Summary tab
2. `review.tpl` - Review tab dengan review rounds
3. `editorial.tpl` - Copyediting tab
4. `production.tpl` - Production tab
5. `stageParticipants.tpl` - Participants panel

**File:** `templates/workflow/workflow.tpl` - Main workflow page

**File:** `lib/pkp/templates/workflow/editorialLinkActions.tpl` - Editor decision buttons

### Next.js Project

**File:** `src/app/(editor)/editor/`

1. `page.tsx` - Editor Dashboard ✅
2. `submissions/[id]/page.tsx` - Submission Detail Page ✅
3. `dashboard/page.tsx` - Editor Dashboard ✅
4. `announcements/page.tsx` - Announcements ❓
5. `issues/page.tsx` - Issues Management ❓
6. `statistics/*/page.tsx` - Statistics pages ❓
7. `settings/*/page.tsx` - Settings pages ❓
8. `tools/page.tsx` - Tools page ❓
9. `users-roles/page.tsx` - Users & Roles ❓

**File:** `src/features/editor/components/`

1. `workflow-tabs.tsx` - Workflow tabs ✅
2. `submission-workflow-view.tsx` - Summary tab ✅
3. `workflow-stage-view.tsx` - Stage-specific tabs ✅
4. `workflow-header.tsx` - Workflow header ✅
5. `workflow-progress-bar.tsx` - Progress bar ✅
6. `workflow-stage-actions.tsx` - Decision buttons ✅

### ⚠️ PERBANDINGAN:

| Feature | OJS 3.3 | Next.js | Status |
|---------|---------|---------|--------|
| Editor Dashboard | ✅ | ✅ | ✅ ADA |
| Submission Detail | ✅ | ✅ | ✅ ADA |
| Workflow Tabs | ✅ | ✅ | ✅ ADA |
| Summary Tab | ✅ | ✅ | ✅ ADA |
| Review Tab | ✅ | ✅ | ✅ ADA |
| Copyediting Tab | ✅ | ✅ | ✅ ADA |
| Production Tab | ✅ | ✅ | ✅ ADA |
| Publication Tab | ✅ | ⚠️ Placeholder | ⚠️ BELUM LENGKAP |
| Announcements | ✅ | ❓ | ❓ PERLU DICEK |
| Issues Management | ✅ | ❓ | ❓ PERLU DICEK |
| Statistics | ✅ | ❓ | ❓ PERLU DICEK |
| Settings | ✅ | ❓ | ❓ PERLU DICEK |
| Tools | ✅ | ❓ | ❓ PERLU DICEK |

---

## 3. BACKEND HANDLERS/ACTIONS

### OJS 3.3 Asli (PHP Handlers)

#### Editor Decision Handlers:
1. `lib/pkp/classes/controllers/modals/editorDecision/PKPEditorDecisionHandler.inc.php` - Base handler
2. `controllers/modals/editorDecision/EditorDecisionHandler.inc.php` - OJS-specific handler
3. `lib/pkp/controllers/modals/editorDecision/form/EditorDecisionForm.inc.php` - Base form
4. `lib/pkp/controllers/modals/editorDecision/form/EditorDecisionWithEmailForm.inc.php` - Email form
5. `controllers/modals/editorDecision/form/InitiateExternalReviewForm.inc.php` - External review form
6. `lib/pkp/controllers/modals/editorDecision/form/SendReviewsForm.inc.php` - Send reviews form
7. `lib/pkp/controllers/modals/editorDecision/form/PromoteForm.inc.php` - Promote form
8. `lib/pkp/controllers/modals/editorDecision/form/NewReviewRoundForm.inc.php` - New round form
9. `lib/pkp/controllers/modals/editorDecision/form/RevertDeclineForm.inc.php` - Revert decline form

#### Editor Actions:
1. `lib/pkp/classes/submission/action/EditorAction.inc.php` - Editor action class dengan methods:
   - `recordDecision()` - Record editor decision
   - `addReviewer()` - Assign reviewer
   - `setDueDates()` - Set review due dates
   - `incrementWorkflowStage()` - Move to next stage

#### Workflow Tab Handlers:
1. `lib/pkp/controllers/tab/workflow/PKPWorkflowTabHandler.inc.php` - Base workflow tab handler
2. `controllers/tab/workflow/WorkflowTabHandler.inc.php` - OJS-specific workflow tab handler
3. `controllers/tab/workflow/ReviewRoundTabHandler.inc.php` - Review round tab handler

#### File Grid Handlers:
1. `lib/pkp/controllers/grid/files/submission/EditorSubmissionDetailsFilesGridHandler.inc.php` - Submission files
2. `lib/pkp/controllers/grid/files/review/EditorReviewFilesGridHandler.inc.php` - Review files
3. `lib/pkp/controllers/grid/files/attachment/EditorReviewAttachmentsGridHandler.inc.php` - Review attachments
4. `lib/pkp/controllers/grid/files/attachment/EditorSelectableReviewAttachmentsGridHandler.inc.php` - Selectable attachments

### Next.js Project

#### API Routes:
1. `src/app/api/editor/submissions/[submissionId]/activity/route.ts` ✅
2. `src/app/api/editor/submissions/[submissionId]/files/route.ts` ✅
3. `src/app/api/editor/submissions/[submissionId]/metadata/route.ts` ✅
4. `src/app/api/editor/submissions/[submissionId]/participants/route.ts` ✅
5. `src/app/api/editor/submissions/[submissionId]/review-rounds/route.ts` ✅
6. `src/app/api/editor/submissions/[submissionId]/reviewers/route.ts` ✅
7. `src/app/api/editor/submissions/[submissionId]/workflow/route.ts` ✅

#### Server Actions:
1. `src/features/editor/actions/editor-decisions.ts` ✅
2. `src/features/editor/actions/participant-assignment.ts` ✅
3. `src/features/editor/actions/reviewer-assignment.ts` ✅
4. `src/features/editor/actions/production-files.ts` ✅

#### Editor Decision Forms:
1. `src/features/editor/components/editor-decision-forms/send-reviews-form.tsx` ✅
2. `src/features/editor/components/editor-decision-forms/promote-form.tsx` ✅
3. `src/features/editor/components/editor-decision-forms/initiate-external-review-form.tsx` ✅
4. `src/features/editor/components/editor-decision-forms/new-review-round-form.tsx` ✅
5. `src/features/editor/components/editor-decision-forms/revert-decline-form.tsx` ✅
6. `src/features/editor/components/editor-decision-forms/recommendation-form.tsx` ✅

### ⚠️ PERBANDINGAN BACKEND:

| Handler/Action | OJS 3.3 | Next.js | Status |
|----------------|---------|---------|--------|
| Editor Decision Handler | ✅ | ✅ Modal wrapper | ✅ ADA |
| Send Reviews Form | ✅ | ✅ | ✅ ADA |
| Promote Form | ✅ | ✅ | ✅ ADA |
| Initiate External Review Form | ✅ | ✅ | ✅ ADA |
| New Review Round Form | ✅ | ✅ | ✅ ADA |
| Revert Decline Form | ✅ | ✅ | ✅ ADA |
| Recommendation Form | ✅ | ✅ | ✅ ADA |
| EditorAction.recordDecision() | ✅ | ⚠️ saveEditorDecision() | ⚠️ PERLU DICEK |
| EditorAction.addReviewer() | ✅ | ⚠️ assignReviewer() | ⚠️ PERLU DICEK |
| EditorAction.setDueDates() | ✅ | ❓ | ❓ PERLU DICEK |
| EditorAction.incrementWorkflowStage() | ✅ | ❓ | ❓ PERLU DICEK |
| Workflow Tab Handler | ✅ | ✅ Component-based | ✅ ADA |
| Review Round Tab Handler | ✅ | ✅ review-rounds-panel.tsx | ✅ ADA |
| Submission Files Grid | ✅ | ✅ submission-file-grid.tsx | ✅ ADA |
| Review Files Grid | ✅ | ⚠️ | ⚠️ PERLU DICEK |
| Review Attachments Grid | ✅ | ❓ | ❓ BELUM ADA |
| Import Peer Reviews | ✅ | ❓ | ❓ BELUM ADA |

---

## 4. WORKFLOW FEATURES

### OJS 3.3 Asli

**Workflow Stages:**
1. **Submission Stage** (WORKFLOW_STAGE_ID_SUBMISSION = 1)
   - Send to External Review
   - Accept (Skip Review)
   - Decline (Initial)
   - Revert Decline

2. **External Review Stage** (WORKFLOW_STAGE_ID_EXTERNAL_REVIEW = 3)
   - Request Revisions
   - Resubmit for Review
   - New Review Round
   - Accept
   - Decline
   - Revert Decline

3. **Editorial/Copyediting Stage** (WORKFLOW_STAGE_ID_EDITING = 4)
   - Send to Production

4. **Production Stage** (WORKFLOW_STAGE_ID_PRODUCTION = 5)
   - Publication scheduling
   - Issue assignment
   - Galley management

### Next.js Project

**Workflow Stages:**
1. **Submission Stage** (`"submission"`)
2. **Review Stage** (`"review"`)
3. **Copyediting Stage** (`"copyediting"`)
4. **Production Stage** (`"production"`)

### ⚠️ PERBANDINGAN WORKFLOW:

| Feature | OJS 3.3 | Next.js | Status |
|---------|---------|---------|--------|
| Submission Stage | ✅ | ✅ | ✅ ADA |
| External Review Stage | ✅ | ✅ Review Stage | ✅ ADA |
| Editorial/Copyediting Stage | ✅ | ✅ Copyediting Stage | ✅ ADA |
| Production Stage | ✅ | ✅ Production Stage | ✅ ADA |
| Workflow Stage IDs | ✅ Numeric (1,3,4,5) | ⚠️ String ("submission", etc) | ⚠️ PERLU MAPPING |
| Stage Navigation | ✅ | ✅ | ✅ ADA |
| Progress Bar | ✅ | ✅ | ✅ ADA |

---

## 5. EDITOR DECISIONS - DETAIL PER DECISION

### 5.1 Send to External Review

**OJS 3.3:**
- Handler: `externalReview()`, `saveExternalReview()`
- Form: `InitiateExternalReviewForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 8`
- Action: Create first review round, move to external review stage

**Next.js:**
- Component: `initiate-external-review-form.tsx` ✅
- Action: `sendToExternalReview()` ✅
- Decision Constant: ❌ SALAH (6 atau 2, harusnya 8)

### 5.2 Accept Submission

**OJS 3.3:**
- Handler: `promote()`, `promoteInReview()`, `savePromote()`, `savePromoteInReview()`
- Form: `PromoteForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_ACCEPT = 1`
- Action: Move to copyediting stage, copy files to final, send email

**Next.js:**
- Component: `promote-form.tsx` ✅
- Action: `acceptSubmission()` ✅
- Decision Constant: ✅ BENAR (1)
- File copying: ❓ PERLU DICEK
- Email sending: ❓ PERLU DICEK

### 5.3 Decline Submission

**OJS 3.3:**
- Handler: `sendReviews()`, `saveSendReviews()`, `sendReviewsInReview()`, `saveSendReviewsInReview()`
- Form: `SendReviewsForm`
- Decision Constants: 
  - `SUBMISSION_EDITOR_DECISION_DECLINE = 4` (in review)
  - `SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE = 9` (in submission)
- Action: Set status to DECLINED, close review round, send email

**Next.js:**
- Component: `send-reviews-form.tsx` ✅
- Action: `declineSubmission()` ✅
- Decision Constants: ❌ SALAH (8 dan 9, harusnya 4 dan 9)

### 5.4 Request Revisions

**OJS 3.3:**
- Handler: `sendReviews()`, `sendReviewsInReview()`, `saveSendReviews()`, `saveSendReviewsInReview()`
- Form: `SendReviewsForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 2`
- Action: Update review round status to REVISIONS_REQUESTED, send email

**Next.js:**
- Component: `send-reviews-form.tsx` ✅
- Action: `requestRevisions()` ✅
- Decision Constant: ❌ SALAH (4 atau 5, harusnya 2)

### 5.5 Resubmit for Review

**OJS 3.3:**
- Handler: Same as Request Revisions
- Form: `SendReviewsForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_RESUBMIT = 3`
- Action: Update review round status to RESUBMIT_FOR_REVIEW, send email

**Next.js:**
- Component: `send-reviews-form.tsx` ✅
- Action: `resubmitForReview()` ✅
- Decision Constant: ❌ SALAH (5 atau 6, harusnya 3)
- New review round: ❓ PERLU DICEK

### 5.6 New Review Round

**OJS 3.3:**
- Handler: `newReviewRound()`, `saveNewReviewRound()`
- Form: `NewReviewRoundForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_NEW_ROUND = 16`
- Action: Create new review round, copy revision files

**Next.js:**
- Component: `new-review-round-form.tsx` ✅
- Action: Via `saveEditorDecision()` ✅
- Decision Constant: ❌ SALAH (10, harusnya 16)

### 5.7 Send to Production

**OJS 3.3:**
- Handler: `promote()`, `savePromote()`
- Form: `PromoteForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION = 7`
- Action: Move to production stage, copy files to production ready

**Next.js:**
- Component: `promote-form.tsx` ✅
- Action: `sendToProduction()` ✅
- Decision Constant: ✅ BENAR (7)
- File copying: ❓ PERLU DICEK

### 5.8 Revert Decline

**OJS 3.3:**
- Handler: `revertDecline()`, `saveRevertDecline()`
- Form: `RevertDeclineForm`
- Decision Constant: `SUBMISSION_EDITOR_DECISION_REVERT_DECLINE = 17`
- Action: Set status back to QUEUED, send email

**Next.js:**
- Component: `revert-decline-form.tsx` ✅
- Action: `revertDecline()` ✅
- Decision Constant: ✅ BENAR (17)

---

## 6. FILE MANAGEMENT

### OJS 3.3 Asli

**File Grids:**
1. `EditorSubmissionDetailsFilesGridHandler` - Submission files management
2. `EditorReviewFilesGridHandler` - Review files management
3. `EditorReviewAttachmentsGridHandler` - Review attachments
4. `EditorSelectableReviewAttachmentsGridHandler` - Selectable attachments for decisions

**File Stages:**
- SUBMISSION_FILE_SUBMISSION (1) - Submission files
- SUBMISSION_FILE_REVIEW_FILE (2) - Review files
- SUBMISSION_FILE_ATTACHMENT (5) - Review attachments
- SUBMISSION_FILE_FINAL (7) - Final copyedited files
- SUBMISSION_FILE_PRODUCTION_READY (8) - Production ready files
- SUBMISSION_FILE_PUBLIC (9) - Public galleys

### Next.js Project

**File Components:**
1. `submission-file-grid.tsx` - File grid component ✅
2. `submission-files-panel.tsx` - Files panel ✅
3. `production-files-panel.tsx` - Production files ✅
4. `production-files/galley-grid.tsx` - Galleys grid ✅

**File Management:**
- File upload: ⚠️ Basic (masih placeholder)
- File download: ❓ PERLU DICEK
- File delete: ✅ ADA
- File selection for decisions: ❓ PERLU DICEK
- File copying between stages: ❓ PERLU DICEK

### ⚠️ PERBANDINGAN FILE MANAGEMENT:

| Feature | OJS 3.3 | Next.js | Status |
|---------|---------|---------|--------|
| Submission Files Grid | ✅ | ✅ | ✅ ADA |
| Review Files Grid | ✅ | ⚠️ | ⚠️ PERLU DICEK |
| Review Attachments Grid | ✅ | ❓ | ❓ BELUM ADA |
| Selectable Attachments | ✅ | ❓ | ❓ BELUM ADA |
| File Upload | ✅ | ⚠️ Basic | ⚠️ PERLU LENGKAPI |
| File Download | ✅ | ❓ | ❓ PERLU DICEK |
| File Delete | ✅ | ✅ | ✅ ADA |
| File Selection (for decisions) | ✅ | ❓ | ❓ BELUM ADA |
| File Copying (between stages) | ✅ | ❓ | ❓ BELUM ADA |
| Galley Management | ✅ | ✅ | ✅ ADA |

---

*[Audit ini akan dilanjutkan dengan bagian Participant Management, Review Management, Publication Management, dan Summary...]*



