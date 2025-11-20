## Temuan
- HTML yang Anda pilih menunjukkan header/aside **ganda**: outer layout + inner header/aside dari halaman `/admin`.
- Sidebar masih berikon (lucide) dan putih — ini bukan gaya OJS klasik.

## Rencana Penyelarasan 100% OJS
### 1) Satu Sumber Layout Admin
- Jadikan `src/app/(admin)/layout.tsx` sebagai satu-satunya header + sidebar.
- Hapus header/aside di `src/app/(admin)/admin/page.tsx` (tinggalkan hanya panel “Site Administration”).

### 2) Sidebar Teks Murni (tanpa ikon)
- Ganti item nav menjadi link teks: `Dashboard`, `Hosted Journals`, `Users`, `Site Settings`, `Statistics`.
- Warna dan highlight: `#002C40` untuk sidebar; overlay putih tipis untuk item aktif.

### 3) Header OJS
- Bar biru gelap tinggi ~56px dengan teks “Open Journal Systems”; kanan: nama user + Logout sederhana.

### 4) Konten Utama OJS
- Panel putih “Site Administration” dengan dua blok link persis seperti OJS.
- Pastikan spacing, font-size, line-height, border, radius sesuai.

### 5) Konsistensi Guard
- Pastikan guard di layout tetap memakai util client (`hasRole('admin')`) agar tidak memicu supabase di client.

### 6) Validasi
- Clear cache dan reload halaman.
- Periksa elemen `div`, `main`, `aside` untuk memastikan:
  - Tidak ada ikon
  - Sidebar biru teks
  - Hanya satu header/aside (tidak ganda)

Konfirmasi untuk melanjutkan implementasi agar Anda melihat perubahan langsung di `/admin`. 