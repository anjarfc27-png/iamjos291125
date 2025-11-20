## Analisis Singkat
- Halaman admin dibungkus oleh `src/app/(admin)/layout.tsx` dan konten utama oleh `src/app/(admin)/admin/page.tsx`.
- Anda belum melihat perubahan — kemungkinan karena dev server cache/Turbopack belum merender ulang, atau layout yang aktif berbeda dari yang Anda lihat (mis. rute yang dibuka bukan `/admin`).

## Rencana Penyelarasan UI (Identik OJS)
### Header
- Bar biru gelap `#002C40` tinggi ~56px, teks kiri “Open Journal Systems” tanpa ikon modern.
- Kanan: nama user, tombol Logout plain (tanpa shadow), font normal.

### Sidebar
- Panel kiri biru `#002C40`, teks putih.
- Kotak logo “OJS” putih kecil, label “Administration”.
- Daftar tautan teks murni: Dashboard, Hosted Journals, Users, Site Settings, Statistics.
- Highlight aktif hanya overlay putih tipis; tanpa ikon lucide.

### Konten Utama
- Panel putih “Site Administration” dengan dua blok:
  - Site Management: Hosted Journals, Site Settings.
  - Administrative Functions: System Information, Expire User Sessions, Clear Data Caches, Clear Template Cache, Clear Scheduled Task Execution Logs.
- Spasi dan tipografi mengikuti OJS (margin atas sedang, border halus, radius minimal).

### Konsistensi & Penghalang
- Pastikan guard role tetap `admin` (middleware & layout) dan tidak menghalangi tampilan.
- Rapikan impor untuk mencegah error modul yang menghalangi render.

## Verifikasi Tampilan
- Jalankan ulang dev server agar perubahan terlihat (clear `.next` bila perlu).
- Uji navigasi: `/admin`, `/admin/site-management`, `/admin/users`, `/admin/site-settings/site-setup`, `/admin/statistics`.
- Bandingkan secara visual dengan screenshot yang Anda kirim dan lakukan tweak padding/line-height sampai “100% identik”.

## Yang Akan Saya Lakukan Setelah Anda Setujui
1. Sinkronkan header, sidebar, dan konten ke gaya OJS persis (tanpa ikon/shadow modern).
2. Tweak CSS (padding, font-size, warna, border) hingga sama persis.
3. Rebuild dev server agar Anda melihat perubahan.
4. Kirimkan hasil dan perbandingan visual.

Konfirmasi agar saya langsung eksekusi penyelarasan dan menampilkan perubahan yang Anda harapkan.