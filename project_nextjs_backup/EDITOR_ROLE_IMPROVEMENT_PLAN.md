# Editor Role Implementation & Improvement Plan
**Tanggal: 16 November 2025**  
**Status: In Progress - Systematic Implementation**

---

## Ringkasan Perbaikan yang Telah Dilakukan

### ✅ Completed

1. **Fix Submission Detail Page**
   - ✅ Mengganti hardcoded dummy data dengan `getSubmissionDetail()`
   - ✅ File: `src/app/(editor)/editor/submissions/[id]/page.tsx`

2. **Perbaiki Summary Tab - OJS 3.3 Styling**
   - ✅ Menambahkan metadata table dengan styling OJS 3.3 (`pkpTable`)
   - ✅ Menampilkan authors, abstract, keywords, categories
   - ✅ Styling: Colors (#002C40, #e5e5e5), typography, spacing
   - ✅ File: `src/features/editor/components/submission-workflow-view.tsx`

---

## TODO: Perbaikan yang Masih Perlu Dilakukan

### PRIORITAS SANGAT TINGGI

#### 1. Perbaiki UI/UX Summary Tab - Selesai sebagian
- ✅ Metadata table sudah diperbaiki
- ⏳ Perbaiki Participants section styling (OJS 3.3)
- ⏳ Perbaiki Metadata form section styling (OJS 3.3)
- ⏳ Perbaiki Versions section styling (OJS 3.3)
- ⏳ Perbaiki Files section styling (OJS 3.3)
- ⏳ Perbaiki Review Rounds section styling (OJS 3.3)
- ⏳ Perbaiki Activity Log section styling (OJS 3.3)

#### 2. Perbaiki Workflow Stage View - UI/UX OJS 3.3
**File:** `src/features/editor/components/workflow-stage-view.tsx`
- ⏳ Sidebar width: `20rem` (sudah ada, perlu verifikasi)
- ⏳ Content area spacing dan padding
- ⏳ Panel styling dengan border `#e5e5e5`, shadow `0 1px 3px rgba(0, 0, 0, 0.1)`
- ⏳ Heading styling: `fontSize: "1.125rem"`, `fontWeight: 600`, `color: "#002C40"`

#### 3. Perbaiki Workflow Stage Actions - Decision Buttons
**File:** `src/features/editor/components/workflow-stage-actions.tsx`
- ⏳ Button styling match OJS 3.3:
  - Primary buttons: `#006798` background, white text
  - Danger buttons: `#dc3545` background
  - Outline buttons: transparent background, `#006798` border
- ⏳ Decision button layout: OJS 3.3 menggunakan grid/list layout
- ⏳ Permission checks sudah ada, perlu verifikasi UI feedback

#### 4. Perbaiki Dashboard Table - SubmissionTable
**File:** `src/features/editor/components/submission-table.tsx`
- ⏳ Table styling: `pkp_controllers_grid_table`
- ⏳ Column headers: `fontSize: "0.75rem"`, `color: "rgba(0, 0, 0, 0.54)"`
- ⏳ Row styling: hover states, alternating backgrounds
- ⏳ Actions column: dropdown menu styling OJS 3.3

### PRIORITAS TINGGI

#### 5. Perbaiki Editor Decision Modals
**Files:** `src/features/editor/components/editor-decision-forms/*.tsx`
- ⏳ Modal wrapper styling: `pkp_modal` class
- ⏳ Form field styling: inputs, textareas, selects
- ⏳ Button styling di modals
- ⏳ File selection grid styling

#### 6. Perbaiki Participants Panel
**File:** `src/features/editor/components/submission-participants-panel.tsx`
- ⏳ Participant list styling OJS 3.3
- ⏳ Add participant button styling
- ⏳ Role badges styling
- ⏳ Assignment modals styling

#### 7. Perbaiki Review Rounds Panel
**File:** `src/features/editor/components/review-rounds-panel.tsx`
- ⏳ Review round cards styling OJS 3.3
- ⏳ Reviewer assignment list styling
- ⏳ Review status badges
- ⏳ New review round button styling

#### 8. Perbaiki Files Management
**File:** `src/features/editor/components/submission-file-grid.tsx`
- ⏳ File grid/card layout OJS 3.3
- ⏳ File upload button styling
- ⏳ File actions (download, delete) styling
- ⏳ File metadata display

### PRIORITAS SEDANG

#### 9. Perbaiki Activity Log
**File:** `src/features/editor/components/submission-activity-form.tsx`
- ⏳ Activity log list styling
- ⏳ Activity form styling
- ⏳ Date formatting OJS 3.3 style

#### 10. Lengkapi Publication Tab
**File:** `src/features/editor/components/workflow-tabs.tsx` (Publication tab section)
- ⏳ Publication metadata display
- ⏳ Issue assignment UI
- ⏳ Publication date picker
- ⏳ Schedule publication button

---

## OJS 3.3 Styling Reference

### Colors
- Primary Blue: `#006798`
- Dark Blue: `#002C40`
- Border Gray: `#e5e5e5`
- Background Gray: `#f8f9fa`
- Text Primary: `rgba(0, 0, 0, 0.84)`
- Text Muted: `rgba(0, 0, 0, 0.54)`

### Typography
- Heading 1: `1.125rem`, `fontWeight: 600`, `color: "#002C40"`
- Heading 2: `1rem`, `fontWeight: 600`, `color: "#002C40"`
- Body: `0.875rem`, `color: "rgba(0, 0, 0, 0.84)"`
- Small: `0.75rem`, `color: "rgba(0, 0, 0, 0.54)"`

### Spacing
- Padding: `1.5rem` (sections), `1rem` (panels), `0.5rem` (cells)
- Gaps: `1.5rem` (between sections), `0.75rem` (between items)
- Borders: `1px solid #e5e5e5`

### Shadows
- Box Shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`

---

## Implementation Steps

1. ✅ Fix submission detail page data fetching
2. ✅ Perbaiki Summary Tab metadata display
3. ⏳ Perbaiki semua section dalam Summary Tab (Participants, Metadata Form, Versions, Files, Review Rounds, Activity Log)
4. ⏳ Perbaiki Workflow Stage View layout dan styling
5. ⏳ Perbaiki Workflow Stage Actions buttons styling
6. ⏳ Perbaiki Dashboard Table styling
7. ⏳ Perbaiki semua Editor Decision Modals styling
8. ⏳ Perbaiki Participants Panel styling
9. ⏳ Perbaiki Review Rounds Panel styling
10. ⏳ Perbaiki Files Management UI
11. ⏳ Lengkapi Publication Tab
12. ⏳ Final verification - UI/UX 100% match OJS 3.3

---

## Testing Checklist

- [ ] Dashboard page - all tabs display correctly
- [ ] Submission detail page - data loads correctly
- [ ] Summary Tab - all sections display correctly
- [ ] Review Tab - all sections display correctly
- [ ] Copyediting Tab - all sections display correctly
- [ ] Production Tab - all sections display correctly
- [ ] Publication Tab - all sections display correctly
- [ ] Editor Decisions - all modals open and submit correctly
- [ ] Participants Management - add/remove works correctly
- [ ] Review Rounds - create/manage works correctly
- [ ] Files Management - upload/view/delete works correctly
- [ ] Activity Log - display and add works correctly
- [ ] UI/UX - 100% match OJS 3.3 styling

---

**Last Updated:** 16 November 2025

