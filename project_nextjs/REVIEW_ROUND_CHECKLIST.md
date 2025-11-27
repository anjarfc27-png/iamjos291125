# Review Round Checklist (OJS 3.3 Parity)

Panduan manual untuk memastikan siklus submission ↔ review ↔ revisi ↔ produksi mengikuti OJS 3.3, termasuk verifikasi tabel `submission_review_rounds`, `edit_decisions`, dan log aktivitas.

## Prasyarat
1. Jalankan migrasi terbaru (termasuk `20251126_add_edit_decisions.sql`) dan seed pengguna sesuai `supabase-seed.sql`.
2. Pastikan akun berikut aktif:
   - Site Admin (`admin@ojs.test`)
   - Journal Manager / Editor / Section Editor (mis. `editor@ojs.test`)
   - Author (`author@ojs.test`)
   - Reviewer (mis. `reviewer@ojs.test`, `reviewer2@ojs.test`)
3. Server development/preview berjalan (`npm run dev`) dan Supabase env (URL/key) di `.env.local`.

## Langkah Per Role
### 1. Author – Submit Naskah Baru
1. Login sebagai Author → `/author/submission/new`.
2. Isi metadata minimal + upload file.
3. Pastikan submission muncul di `/editor/submissions` (status `queued`, stage `submission`).
4. Verifikasi DB:
   ```sql
   select id, current_stage, status from submissions where id = '<SUBMISSION_ID>';
   select * from submission_review_rounds where submission_id = '<SUBMISSION_ID>';
   ```
   → seharusnya belum ada review round.

### 2. Editor – Send to External Review
1. Login sebagai Editor.
2. Buka submission → tab Review → klik “Send to External Review”.
3. Pastikan:
   - Stage berubah ke `review` (UI dan kolom `submissions.current_stage`).
   - Tabel `submission_review_rounds` memiliki entri baru (round=1, status `active`).
4. Cek `edit_decisions`:
   ```sql
   select decision, stage_id, review_round_id from edit_decisions where submission_id = '<SUBMISSION_ID>';
   ```
   → Harus ada keputusan `SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW` dengan `review_round_id` terisi.

### 3. Editor – Assign Reviewer & Kelola Review
1. Tambahkan minimal 2 reviewer via panel Participants.
2. Simulasikan:
   - Reviewer submit review (gunakan akun reviewer atau API dummy).
   - Lihat `submission_review_rounds.status` tetap `active`.

### 4. Editor – Request Revisions
1. Masih di stage Review, pilih “Request Revisions”.
2. Verifikasi:
   - `submission_review_rounds.status` -> `revisions_requested`.
   - `edit_decisions` mencatat keputusan `PENDING_REVISIONS` dengan `review_round_id` round aktif.
   - Activity log mencatat pesan.

### 5. Author – Upload Revisi
1. Login sebagai Author, buka submission, unggah file revisi.
2. Tidak ada perubahan stage otomatis (tetap `review`).

### 6. Editor – Resubmit for Review / New Review Round
1. Klik “Resubmit for Review” untuk membuka revisi di round yang sama.
   - `submission_review_rounds.status` -> `resubmitted`.
2. Klik “New Review Round” untuk membuat Round 2.
   - Round 1 harus berstatus `completed`.
   - Round 2 dibuat dengan status `active`.
   - `edit_decisions` mencatat `NEW_ROUND` dengan `review_round_id` round terbaru.

### 7. Editor – Accept & Send to Production
1. Setelah review final, pilih “Accept” lalu “Send to Production”.
2. Pastikan:
   - `submission_review_rounds` round aktif menjadi `completed`.
   - `submissions.current_stage = 'production'`, `status = 'in_production'`.
   - `edit_decisions` mencatat keputusan ACCEPT dan SEND_TO_PRODUCTION.

### 8. Production – Issue Assignment & Publish (Opsional)
1. Pada tab Publication → Issue, pilih issue & section, simpan.
2. Kembali ke stage Production, klik “Send to Issue” untuk menandai `scheduled`.
3. Gunakan modal Publish untuk publish sekarang atau jadwalkan.

## Pemeriksaan Tambahan
- **API**: `/api/editor/submissions/<ID>/review-rounds` harus menampilkan data konsisten dengan tabel.
- **Rollback**: Gunakan “Revert Decline” & “New Round” untuk memastikan round lama disimpan.
- **Logging**: `submission_activity_logs` harus memuat pesan untuk tiap keputusan di atas.

## Troubleshooting
- Jika `review_round_id` kosong di `edit_decisions`, periksa fungsi `recordEditorDecision` (harus menarik round terakhir).
- Pastikan UI mengirim `reviewRoundId` saat membuka modal decision (lihat `workflow-stage-actions.tsx`).

