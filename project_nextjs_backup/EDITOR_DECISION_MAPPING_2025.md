# Editor Decision Mapping Audit (26 Nov 2025)

Referensi utama: OJS 3.3 `PKPEditorDecisionActionsManager`, `EditorAction`, dan implementasi project ini di `src/features/editor/actions/editor-decisions.ts` serta `src/app/api/editor/submissions/[submissionId]/workflow/route.ts`.

## 1. Submission Stage Decisions
| OJS Action (UI) | OJS Constant | Implementasi di Next.js | Status |
| --- | --- | --- | --- |
| Send to External Review | `SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW` | `workflow-stage-actions` → `saveEditorDecision` (`ACTION_TO_DECISION.send_to_review`) | ✅ |
| Accept (Skip Review) | `SUBMISSION_EDITOR_DECISION_ACCEPT` | `ACTION_TO_DECISION.send_to_copyediting` / `accept` | ✅ |
| Decline (Initial) | `SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE` | `ACTION_TO_DECISION.decline_submission` | ✅ |
| Revert Decline | `SUBMISSION_EDITOR_DECISION_REVERT_DECLINE` | `ACTION_TO_DECISION.revert_decline` | ✅ |

## 2. Review Stage Decisions
| OJS Action (UI) | OJS Constant | Implementasi | Status |
| --- | --- | --- | --- |
| Accept (Send to Copyediting) | `SUBMISSION_EDITOR_DECISION_ACCEPT` | `ACTION_TO_DECISION.accept` | ✅ |
| Request Revisions | `SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS` | `ACTION_TO_DECISION.pending_revisions` | ✅ |
| Resubmit for Review | `SUBMISSION_EDITOR_DECISION_RESUBMIT` | `ACTION_TO_DECISION.resubmit_for_review` | ✅ |
| Decline | `SUBMISSION_EDITOR_DECISION_DECLINE` | `ACTION_TO_DECISION.decline` | ✅ |
| Create New Review Round | `SUBMISSION_EDITOR_DECISION_NEW_ROUND` | `ACTION_TO_DECISION.new_review_round` | ✅ |

## 3. Copyediting Stage Decisions
| OJS Action (UI) | OJS Constant | Implementasi | Status | Catatan |
| --- | --- | --- | --- | --- |
| Send to Production | `SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION` | `ACTION_TO_DECISION.send_to_production` | ✅ | Menggunakan server action standar. |
| Request Author Copyediting | (OJS requestAuthorCopyedit) | Hanya entri `ACTION_TRANSITIONS.request_author_copyedit` → perubahan status manual | ⚠️ | Tidak ada tombol UI atau server action; belum mencatat `edit_decisions`. |

## 4. Production / Publication Actions
| OJS Action (UI) | Implementasi Project | Status | Catatan |
| --- | --- | --- | --- |
| Send to Issue | `ACTION_TRANSITIONS.send_to_issue` (fallback update status) | ⚠️ | Tidak mengelola relasi `publication_issue`; perlu integrasi dengan `issue_id` pada `submission_versions`. |
| Schedule for Publication | `ACTION_TRANSITIONS.schedule_publication` (fallback status) | ⚠️ | Belum memanggil API `publications/publish` untuk penjadwalan + `edit_decisions` log. |
| Publish | `ACTION_TRANSITIONS.publish` (fallback status) + API `publications/publish` (manual) | ⚠️ | Workflow endpoint tidak memanggil API publish; tidak mencatat keputusan. |
| Unpublish | `/api/editor/submissions/[submissionId]/publications/unpublish` | ⚠️ | Tidak terhubung ke workflow UI; tak ada catatan keputusan. |

## 5. Rangkuman & Gap
1. Semua keputusan berbasis konstanta `SUBMISSION_EDITOR_DECISION_*` sudah dipetakan dan menggunakan `saveEditorDecision` → ✅.
2. Aksi lanjutan di Copyediting/Production (`request_author_copyedit`, `send_to_issue`, `schedule_publication`, `publish`, `unpublish`) masih memakai jalur fallback manual (hanya update kolom `submissions.status`). Dampak:
   - Tidak ada validasi izin per aksi.
   - Tidak menulis `edit_decisions` ataupun metadata publikasi.
   - Belum menyentuh tabel terkait (`submission_versions.issue_id`, `issues`, dsb.).
3. Kesenjangan ini dicatat untuk dikerjakan pada tugas `implement-missing-actions` dan `verify-review-rounds`.

