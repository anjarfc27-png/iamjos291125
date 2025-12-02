# Panduan Git Commit & Push untuk Deploy

## Workflow Git yang Benar

Ya, Anda **HARUS** melakukan `git commit` sebelum `git push`. Urutannya:

1. **git add** - Menambahkan file ke staging area
2. **git commit** - Menyimpan perubahan dengan pesan commit
3. **git push** - Mengirim perubahan ke GitHub

---

## Langkah-langkah Deploy

### 1. Cek Status Git
```bash
cd project_nextjs
git status
```

### 2. Tambahkan Semua Perubahan ke Staging
```bash
# Tambahkan semua file yang diubah
git add .

# Atau tambahkan file spesifik
git add src/
git add supabase-seed.sql
git add DEPLOYMENT.md
git add SUPABASE_SETUP.md
git add USER_CREDENTIALS.md
```

### 3. Commit Perubahan
```bash
git commit -m "Update UI: Adjust sidebar sizes, add iamJOS logo, fix role-based redirects"
```

**Tips untuk commit message:**
- Gunakan pesan yang jelas dan deskriptif
- Contoh: `"Fix admin sidebar size and add iamJOS branding"`
- Contoh: `"Update editor dashboard with submission tabs"`
- Contoh: `"Add role-based redirect after login"`

### 4. Push ke GitHub
```bash
git push origin main
```

Atau jika branch Anda bukan `main`:
```bash
git push origin <nama-branch-anda>
```

---

## Command Lengkap (Copy-Paste)

```bash
cd project_nextjs
git add .
git commit -m "Update UI: Adjust sidebar sizes, add iamJOS logo, fix role redirects"
git push origin main
```

---

## Setelah Push ke GitHub

1. **Vercel akan otomatis detect** perubahan di GitHub
2. **Vercel akan auto-deploy** dengan perubahan baru
3. **Cek di Vercel Dashboard** → Deployments untuk melihat progress

---

## Troubleshooting

### Error: "nothing to commit"
- Pastikan sudah `git add .` terlebih dahulu
- Cek dengan `git status` apakah ada file yang modified

### Error: "failed to push"
- Pastikan sudah login ke GitHub: `git config --global user.name "Your Name"`
- Pastikan remote sudah benar: `git remote -v`
- Jika perlu, set remote: `git remote add origin https://github.com/username/repo.git`

### Error: "branch is behind"
- Pull dulu: `git pull origin main`
- Resolve conflict jika ada
- Push lagi: `git push origin main`

---

## File yang Perlu Di-commit

Dari `git status`, file penting yang perlu di-commit:
- ✅ Semua file di `src/` (layout, components, dll)
- ✅ `supabase-seed.sql` (script untuk seed data)
- ✅ `DEPLOYMENT.md` (panduan deployment)
- ✅ `SUPABASE_SETUP.md` (panduan setup)
- ✅ `USER_CREDENTIALS.md` (daftar user)
- ✅ `package.json` dan `package-lock.json` (jika ada perubahan dependency)

---

## Tips

1. **Commit message yang baik:**
   - Jelas dan deskriptif
   - Jelaskan apa yang diubah
   - Contoh: `"Fix: Reduce admin sidebar width and font sizes"`

2. **Commit kecil dan sering:**
   - Lebih baik commit beberapa kali dengan perubahan kecil
   - Daripada satu commit besar dengan banyak perubahan

3. **Jangan commit file sensitif:**
   - `.env.local` (sudah di `.gitignore`)
   - `node_modules/` (sudah di `.gitignore`)
   - File dengan password atau API keys

