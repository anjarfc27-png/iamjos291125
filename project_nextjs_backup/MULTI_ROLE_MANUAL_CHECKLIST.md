# Checklist Uji Manual Multi‑Role (iamJOS vs OJS 3.3)

## 1. Login & routing per role
- [ ] Login sebagai `admin@ojs.test` → mendarat di `/admin`
- [ ] Login sebagai `manager@ojs.test` → akses ke `/admin` & menu manajer jurnal
- [ ] Login sebagai `editor@ojs.test` → mendarat di `/editor`
- [ ] Login sebagai `author@ojs.test` → mendarat di `/author/dashboard`
- [ ] Login sebagai `reviewer@ojs.test` → mendarat di `/reviewer/dashboard`
- [ ] Login sebagai `multi_author_reviewer@ojs.test` → bisa akses `/author` & `/reviewer`

## 2. Navigasi & menu per role
- [ ] Admin: menu Site Administration, Hosted Journals, Site Settings, Users, Statistics, System
- [ ] Manager: sidebar jurnal (Dashboard, Submissions, Issues, Announcements, Users, Tools, Statistics)
- [ ] Editor: sidebar editorial (Dashboard, Submissions, Issues, Settings, Tools, Statistics, Users/Roles)
- [ ] Author: menu Dashboard, New Submission, Published, Statistics, Profile, Help (+ Reviewer Dashboard jika ada role reviewer)
- [ ] Reviewer: menu Dashboard, Assignments, Completed, History, Statistics, Profile, Help
- [ ] Reader: menu Browse Journals, Search, My Reading List, Profile

## 3. Alur submission end‑to‑end
- [ ] Sebagai Author, kirim submission baru sampai selesai wizard
- [ ] Pastikan submission muncul di antrian Editor / Manager
- [ ] Editor mengirim ke review (send to review) → stage & status berubah ke review
- [ ] Tambah reviewer, kirim undangan, reviewer bisa menerima & submit review
- [ ] Editor memberi keputusan (revisions / accept / decline) dan log aktivitas tercatat
- [ ] Keputusan accept memindahkan ke copyediting / production sesuai mapping

## 4. Issue, scheduling, dan publikasi
- [ ] Login sebagai Manager/Editor, buka halaman Issues
- [ ] Pastikan daftar issue dari tabel `issues`/`issue_settings` muncul (termasuk demo-journal-1 & 2 bila ada)
- [ ] Pada tab Publication → Issue untuk satu submission, pilih issue + section dan simpan
- [ ] Jalankan aksi workflow `send_to_issue` / schedule → status submission menjadi scheduled
- [ ] Uji publish (jika tersedia) dan pastikan status serta tanggal published tersimpan

## 5. Multi‑journal
- [ ] Buka dropdown jurnal di header (Admin/Manager/Editor/Reader)
- [ ] Pastikan demo-journal-1 dan demo-journal-2 muncul dengan nama yang benar
- [ ] Pindah jurnal dan cek bahwa statistik/dashboard berubah sesuai konteks jurnal

## 6. Hak akses & pembatasan
- [ ] Author tidak bisa mengakses `/admin`, `/editor`, `/manager`
- [ ] Reviewer tanpa role author tidak bisa mengakses `/author`
- [ ] Manager/editor hanya bisa mengelola submissions / issues dalam jurnal yang dia punya role‑nya
- [ ] Site admin bisa melewati semua batasan jurnal (akses semua jurnal)



