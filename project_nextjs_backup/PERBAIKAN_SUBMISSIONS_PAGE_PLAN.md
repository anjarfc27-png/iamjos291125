# Rencana Perbaikan Submissions Page - OJS 3.3 Style

## Analisis Perbedaan dengan Referensi

### Struktur Saat Ini:
- Table dengan banyak kolom: ID, TITLE, STAGE, STATUS, LAST ACTIVITY, ACTIONS
- Help icon di header table
- Badge colors belum sesuai referensi
- Layout masih terlalu kompleks

### Struktur Referensi OJS 3.3:
- List view sederhana dengan 4 kolom: Number | Author+Title | Status Badge | Arrow
- Help icon (green circular) di kanan atas tabs
- Badge colors: Red (Submission), Blue (Copyediting), Green (Production)
- Author di baris pertama, Title di baris kedua
- Arrow icon di kanan setiap row

## Rencana Perbaikan

### 1. Memindahkan Help Icon ke Kanan Atas Tabs
**File**: `project_nextjs/src/app/(editor)/editor/page.tsx`
- Pindahkan Help icon dari header table ke kanan atas tabs (sebelum tab content area)
- Styling: Green circular background dengan "i" putih
- Position: Absolute di kanan atas tabs container

### 2. Menyederhanakan Struktur Table
**File**: `project_nextjs/src/features/editor/components/submission-table.tsx`
- Ubah struktur table menjadi hanya 4 kolom:
  1. **Number** (kiri, width narrow)
  2. **Author + Title** (tengah, flex-1)
     - Author di baris pertama
     - Title di baris kedua (dengan truncation jika panjang)
  3. **Status Badge** (kanan tengah, fixed width)
  4. **Arrow Icon** (paling kanan, fixed width)
- Hapus kolom: STAGE, LAST ACTIVITY, ACTIONS
- Hapus header kolom yang tidak perlu

### 3. Memperbaiki Badge Colors
**File**: `project_nextjs/src/features/editor/components/stage-badge.tsx`
- Submission: Red background (#d00a0a atau serupa)
- Review: Orange background (tetap)
- Copyediting: Blue background (#006798 atau serupa)
- Production: Green background (#00b28d atau serupa)
- Styling: Oval badge dengan teks putih

### 4. Memperbaiki Layout Row
**File**: `project_nextjs/src/features/editor/components/submission-table.tsx`
- Number: Padding kiri 1rem, width narrow, font-size kecil
- Author+Title: 
  - Author: Font-size normal, color rgba(0,0,0,0.84)
  - Title: Font-size normal, bold, color #006798, truncate dengan ellipsis
  - Spacing: Margin antara author dan title
- Status Badge: Align right, spacing dengan arrow
- Arrow: ChevronDown icon, align right

### 5. Menambahkan Arrow Icon
**File**: `project_nextjs/src/features/editor/components/submission-table.tsx`
- Import ChevronDown dari lucide-react
- Tambahkan di kolom terakhir setiap row
- Style: Gray color, small size, cursor pointer

### 6. Memperbaiki Header Table
**File**: `project_nextjs/src/features/editor/components/submission-table.tsx`
- Sederhanakan header: Hanya title "Submissions" dan controls (Search, Filter)
- Hapus Help icon dari header
- Perbaiki alignment dan spacing

## Files yang Akan Dimodifikasi

1. `project_nextjs/src/app/(editor)/editor/page.tsx` - Memindahkan Help icon
2. `project_nextjs/src/features/editor/components/submission-table.tsx` - Menyederhanakan struktur table
3. `project_nextjs/src/features/editor/components/stage-badge.tsx` - Memperbaiki badge colors

## Expected Results

- Struktur table lebih sederhana dan rapi sesuai OJS 3.3
- Help icon di posisi yang benar (kanan atas tabs)
- Badge colors sesuai referensi (red, blue, green)
- Layout row lebih clean dengan Author di baris pertama dan Title di baris kedua
- Arrow icon di kanan setiap row
- Overall tampilan lebih rapi dan professional

