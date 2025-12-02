# Setup Supabase dengan Data Dummy

Karena Anda menggunakan data example/dummy dan belum ada user yang terdaftar, ikuti langkah berikut untuk setup Supabase dengan user dummy.

## Langkah 1: Buat Tabel di Supabase

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor** di sidebar kiri
4. Jalankan script berikut untuk membuat tabel:

```sql
-- Buat tabel user_accounts
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel user_account_roles
CREATE TABLE IF NOT EXISTS user_account_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
  role_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_user_account_roles_user_id ON user_account_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
```

## Langkah 2: Insert Data Dummy User & Jurnal Hosted

1. Masih di **SQL Editor**
2. Copy dan paste isi file `supabase-seed.sql`
3. Klik **Run** untuk menjalankan script
4. Script akan membuat 6+ user dummy dengan berbagai role dan minimal 2 jurnal hosted (`demo-journal-1`, `demo-journal-2`)

## User Dummy yang Dibuat

Setelah menjalankan script, Anda akan punya user berikut (semua password: `password123`):

| Email | Password | Role | Akses |
|-------|----------|------|-------|
| admin@ojs.test | password123 | Site admin | `/admin` |
| editor@ojs.test | password123 | Editor | `/editor` |
| author@ojs.test | password123 | Author | `/author` |
| reviewer@ojs.test | password123 | Reviewer | `/reviewer` |
| reader@ojs.test | password123 | Reader | `/reader` |
| manager@ojs.test | password123 | Manager | `/admin` |

## Langkah 3: Test Login

1. Buka aplikasi Anda (localhost atau Vercel)
2. Buka halaman login
3. Login dengan salah satu user di atas
4. Anda akan di-redirect ke dashboard sesuai role

## Catatan Penting

⚠️ **PENTING UNTUK PRODUCTION:**
- Password disimpan sebagai plain text (tidak di-hash) - **HANYA UNTUK DEVELOPMENT**
- Di production, gunakan password hashing (bcrypt, argon2, dll)
- Jangan gunakan password `password123` di production
- Hapus atau ubah password user dummy sebelum production

## Troubleshooting

### Error: "relation does not exist"
- Pastikan Anda sudah menjalankan script CREATE TABLE terlebih dahulu
- Cek apakah nama tabel sudah benar

### Error: "duplicate key value"
- User sudah ada, script akan update data yang ada
- Atau hapus data lama dulu dengan:
  ```sql
  DELETE FROM user_account_roles;
  DELETE FROM user_accounts;
  ```

### Tidak bisa login
- Pastikan email dan password sesuai (case-sensitive)
- Cek console browser untuk error
- Pastikan environment variables sudah benar di Vercel

## Menambah User Baru

Untuk menambah user baru, jalankan query berikut di SQL Editor:

```sql
-- Insert user baru
INSERT INTO user_accounts (username, email, password, first_name, last_name)
VALUES ('newuser', 'newuser@ojs.test', 'password123', 'New', 'User');

-- Dapatkan user_id yang baru dibuat
-- Lalu insert role
INSERT INTO user_account_roles (user_id, role_name)
VALUES (
  (SELECT id FROM user_accounts WHERE email = 'newuser@ojs.test'),
  'Author'  -- Ganti dengan role yang diinginkan
);
```

## Role yang Tersedia

- `Site admin` - Akses penuh ke `/admin`
- `Manager` - Akses ke `/admin`
- `Editor` - Akses ke `/editor`
- `Section editor` - Akses ke `/editor`
- `Copyeditor` - Akses ke `/editor`
- `Proofreader` - Akses ke `/editor`
- `Layout Editor` - Akses ke `/editor`
- `Author` - Akses ke `/author`
- `Reviewer` - Akses ke `/reviewer`
- `Reader` - Akses ke `/reader`
- `Subscription manager` - Akses terbatas

