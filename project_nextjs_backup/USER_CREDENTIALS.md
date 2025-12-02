# Daftar User Dummy dan Password

## ⚠️ PENTING
Semua password di bawah ini adalah **plain text** dan **HANYA untuk development/testing**. 
**JANGAN gunakan di production!**

## User Dummy dari Script `supabase-seed.sql`

Script `supabase-seed.sql` membuat 6 user dummy dengan password yang sama untuk semua:

### Password Default: `password123`

---

## 1. Site Administrator
- **Email:** `admin@ojs.test`
- **Username:** `admin`
- **Password:** `password123`
- **Role:** Site admin
- **Akses:** `/admin` (Full access ke semua fitur admin)

---

## 2. Editor
- **Email:** `editor@ojs.test`
- **Username:** `editor`
- **Password:** `password123`
- **Role:** Editor
- **Akses:** `/editor` (Dashboard editor, submissions, dll)

---

## 3. Author
- **Email:** `author@ojs.test`
- **Username:** `author`
- **Password:** `password123`
- **Role:** Author
- **Akses:** `/author` (Submit manuscripts, track submissions)

---

## 4. Reviewer
- **Email:** `reviewer@ojs.test`
- **Username:** `reviewer`
- **Password:** `password123`
- **Role:** Reviewer
- **Akses:** `/reviewer` (Review assignments, completed reviews)

---

## 5. Reader
- **Email:** `reader@ojs.test`
- **Username:** `reader`
- **Password:** `password123`
- **Role:** Reader
- **Akses:** `/reader` (Browse journals, read articles)

---

## 6. Manager
- **Email:** `manager@ojs.test`
- **Username:** `manager`
- **Password:** `password123`
- **Role:** Manager
- **Akses:** `/admin` (Similar to Site admin)

---

## User Lain yang Terlihat di Database

Dari screenshot yang Anda kirim, ada beberapa user lain yang mungkin dibuat manual atau dari script lain:

### Copyeditor
- **Email:** `copyeditor@example.com` atau `copyeditor@test.com`
- **Username:** `copyeditor` atau `copyeditor-test`
- **Password:** Tidak diketahui (mungkin perlu dibuat manual atau dari script lain)
- **Role:** Copyeditor (jika ada di `user_account_roles`)

### Layout Editor
- **Email:** `layout-editor@test.com` atau `layouteditor@example.com`
- **Username:** `layout-editor` atau `layouteditor`
- **Password:** Tidak diketahui (mungkin perlu dibuat manual)
- **Role:** Layout Editor (jika ada di `user_account_roles`)

### Manager Test
- **Email:** (tidak terlihat di screenshot)
- **Username:** `manager-test`
- **Password:** Tidak diketahui
- **Role:** Manager (kemungkinan)

---

## Cara Cek Password User Lain

Jika Anda ingin tahu password user lain yang tidak ada di script, jalankan query ini di Supabase SQL Editor:

```sql
SELECT 
  username,
  email,
  password,
  first_name,
  last_name
FROM user_accounts
WHERE email NOT IN (
  'admin@ojs.test',
  'editor@ojs.test',
  'author@ojs.test',
  'reviewer@ojs.test',
  'reader@ojs.test',
  'manager@ojs.test'
)
ORDER BY username;
```

---

## Cara Reset Password User

Jika Anda ingin mengubah password user tertentu, jalankan query ini:

```sql
-- Contoh: Reset password admin menjadi "newpassword123"
UPDATE user_accounts 
SET password = 'newpassword123'
WHERE email = 'admin@ojs.test';
```

**Catatan:** Password masih disimpan sebagai plain text. Di production, gunakan password hashing (bcrypt, argon2, dll).

---

## Quick Reference untuk Testing

| Role | Email | Password | URL Setelah Login |
|------|-------|----------|-------------------|
| Admin | admin@ojs.test | password123 | /admin |
| Editor | editor@ojs.test | password123 | /editor |
| Author | author@ojs.test | password123 | /author |
| Reviewer | reviewer@ojs.test | password123 | /reviewer |
| Reader | reader@ojs.test | password123 | /reader |
| Manager | manager@ojs.test | password123 | /admin |

---

## Untuk Laporan/Demo

Anda bisa gunakan user berikut untuk demo ke ketua:

1. **Admin** - untuk menunjukkan fitur admin lengkap
2. **Editor** - untuk menunjukkan dashboard editor dan submissions
3. **Author** - untuk menunjukkan proses submit manuscript
4. **Reviewer** - untuk menunjukkan proses review

Semua menggunakan password yang sama: **`password123`** (mudah diingat untuk demo).

