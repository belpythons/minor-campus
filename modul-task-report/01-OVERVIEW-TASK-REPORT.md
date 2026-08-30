# 📊 Modul 2: Tracking Task Report Magang / PKL - Overview

Modul Tracking Task Report Magang dirancang untuk mereplikasi dan meng-enhance sistem laporan harian kegiatan magang yang saat ini aktif di lingkungan **PT Badak NGL** (`http://10.10.1.187:8097/reports/new`).

---

## 🎯 Tujuan & Integrasi Sistem

- **Presisi Form Input**: Mengikuti 100% struktur form penambahan kegiatan magang asli (Tanggal, Jam, Kategori, Judul, Deskripsi, Output, Kendala, Foto).
- **Storage Terintegrasi**: Menggunakan Supabase Storage Bucket `report-photos` untuk menangani arsip dokumentasi kegiatan.
- **Ekspor Dokumen Resmi**: Menghasilkan dokumen rekap laporan berbentuk PDF/Cetak yang mengadopsi format resmi `template kop.pdf` PT Badak NGL.

---

## 🗃️ Skema Database Supabase (`internship_reports`)

```sql
CREATE TABLE internship_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_mulai TIME,
    jam_selesai TIME,
    kategori VARCHAR(100) NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    output TEXT,
    kendala TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Kategori Kegiatan Resmi:
1. `Pekerjaan Utama`
2. `Meeting/Diskusi`
3. `Belajar/Training`
4. `Dokumentasi`
5. `Kunjungan Lapangan`
6. `Lainnya`
