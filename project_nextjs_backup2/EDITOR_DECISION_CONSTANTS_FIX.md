# PERBAIKAN EDITOR DECISION CONSTANTS

## ❌ MASALAH DITEMUKAN

Konstanta Editor Decision di Next.js **TIDAK SESUAI** dengan OJS PKP 3.3 asli!

### Perbandingan Detail:

| Decision Constant | OJS 3.3 Asli | Next.js (types.ts) | Next.js (constants.ts) | Status |
|-------------------|--------------|-------------------|----------------------|--------|
| SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW | **8** | 6 ❌ | 2 ❌ | ❌ SALAH |
| SUBMISSION_EDITOR_DECISION_ACCEPT | **1** | 1 ✅ | 1 ✅ | ✅ BENAR |
| SUBMISSION_EDITOR_DECISION_DECLINE | **4** | 8 ❌ | 4 ✅ | ❌ SALAH di types.ts |
| SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE | **9** | 9 ✅ | 9 ✅ | ✅ BENAR |
| SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS | **2** | 4 ❌ | 5 ❌ | ❌ SALAH |
| SUBMISSION_EDITOR_DECISION_RESUBMIT | **3** | 5 ❌ | 6 ❌ | ❌ SALAH |
| SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION | **7** | 7 ✅ | 7 ✅ | ✅ BENAR |
| SUBMISSION_EDITOR_DECISION_REVERT_DECLINE | **17** | 17 ✅ | 17 ✅ | ✅ BENAR |
| SUBMISSION_EDITOR_DECISION_NEW_ROUND | **16** | 10 ❌ | - | ❌ SALAH |

### Rekomendasi Perbaikan:

**File:** `src/features/editor/types.ts`

```typescript
// Editor Decision Constants (matching OJS PKP 3.3) - PERBAIKI!
export const SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 8; // BUKAN 6!
export const SUBMISSION_EDITOR_DECISION_ACCEPT = 1; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_DECLINE = 4; // BUKAN 8!
export const SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE = 9; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 2; // BUKAN 4!
export const SUBMISSION_EDITOR_DECISION_RESUBMIT = 3; // BUKAN 5!
export const SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION = 7; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_REVERT_DECLINE = 17; // ✅ BENAR
export const SUBMISSION_EDITOR_DECISION_NEW_ROUND = 16; // BUKAN 10!
```

**File:** `src/features/editor/constants/editor-decisions.ts`

```typescript
// Editor Decision Constants - PERBAIKI!
export const SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 8; // BUKAN 2!
export const SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 2; // BUKAN 5!
export const SUBMISSION_EDITOR_DECISION_RESUBMIT = 3; // BUKAN 6!
```

**Sumber Referensi OJS 3.3:**
- `classes/workflow/EditorDecisionActionsManager.inc.php` (lines 17-29)
- `lib/pkp/classes/workflow/PKPEditorDecisionActionsManager.inc.php` (lines 16-22)

---

## PENGARUH KESALAHAN INI:

1. **Decision tidak akan ter-record dengan benar di database**
2. **Workflow logic akan salah**
3. **Kompatibilitas dengan OJS 3.3 akan terganggu**
4. **Integration testing akan gagal**

**PRIORITAS:** ⚠️ **SANGAT TINGGI** - Harus diperbaiki segera!



