## Diagnosa
- Tautan "Dashboard" di sidebar mengarah ke `/reviewer`, namun halaman ini langsung `redirect` ke `/reviewer/dashboard`.
- Rute `/reviewer/dashboard` belum ada, sehingga klik terasa "tidak berfungsi" atau berujung 404/ter-redirect.
- Guard `withAuth(..., 'reviewer')` akan mendorong user ke `/dashboard` bila akun tidak punya role `reviewer`, yang terlihat seperti tombol tidak bisa di-klik.

## Perbaikan Teknis
1. Tambah halaman `/reviewer/dashboard` dengan konten dashboard sederhana (tanpa ikon modern), mengikuti gaya OJS klasik.
2. Ubah item navigasi sidebar "Dashboard" agar `href` menunjuk langsung ke `/reviewer/dashboard` dan logika aktif (`current`) disesuaikan dengan path tersebut.
3. Pertahankan `redirect('/reviewer/dashboard')` di `/reviewer/page.tsx` agar akses root tetap menuju dashboard yang valid.
4. Pastikan semua tautan sidebar memakai `Link` sederhana (tanpa elemen interaktif bersarang) dan gaya tidak menonaktifkan pointer (hindari overlay/pointer-events: none).

## Penyesuaian OJS Klasik
- Hilangkan `lucide-react` ikon pada layout Reviewer; ganti dengan teks tombol/tautan klasik OJS.
- Gunakan warna OJS: `#002C40` (judul/header) dan `#006798` (tautan/aksi), tombol teks dengan border tipis.
- Samakan breadcrumb dan panel header ala OJS.

## Pemeriksaan Role
- Verifikasi akun login memiliki role `Reviewer` (role_path `reviewer`). Bila belum, seed/assign role agar guard tidak mengalihkan ke `/dashboard`.

## Verifikasi
- Jalankan dev server, buka `/reviewer` dan klik "Dashboard" serta tautan sidebar lain → pastikan berpindah halaman tanpa 404.
- Uji akun tanpa role `reviewer` untuk konfirmasi guard mengalihkan sesuai desain.
- Cek interaksi: pointer, hover, fokus, tidak ada elemen overlay yang menutupi tautan.

## Hasil yang Diharapkan
- Klik "Dashboard" dan item sidebar di area Reviewer selalu berfungsi.
- Tampilan Reviewer konsisten dengan OJS klasik, tanpa ikon modern.
- Tidak ada redirect membingungkan karena rute hilang atau role tidak cocok.