# 📖 Modul 3: Log Book Kegiatan & Konsultasi (Formulir 2 STITEK) - Overview

Modul Log Book Kegiatan & Konsultasi dirancang khusus untuk memfasilitasi pencatatan aktivitas Kerja Praktek (KP) dan tracking konsultasi bersama berbagai pembimbing/orang berpangkat (atasan/supervisor/mentor) yang berbeda-beda.

---

## 🎯 Tujuan & Integrasi Standar Akademik

- **Replikasi Standar Kampus**: Mengadopsi secara persis format dokumen resmi STITEK Bontang `TI-SOP-17/FM-01` (Formulir 2).
- **Tracking Multi-Pembimbing**: Mengakomodasi kebutuhan konsultasi project magang yang melibatkan lebih dari satu atasan / pembimbing lapangan dengan pangkat/jabatan berbeda.
- **Cetak Presisi Sesuai Docx**: Menghasilkan dokumen cetak resmi A4 lengkap dengan Kop Surat STITEK, tabel log kehadiran, dan blok tanda tangan pembimbing.

---

## 🗃️ Skema Database Supabase (`logbook_entries`)

```sql
CREATE TABLE logbook_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nomor_urut INT NOT NULL,
    tanggal DATE NOT NULL,
    aktivitas_pekerjaan TEXT NOT NULL,
    pembimbing_nama VARCHAR(255) NOT NULL,
    pembimbing_jabatan VARCHAR(255),
    paraf_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```
