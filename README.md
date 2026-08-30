# 🚀 System Specification & Documentation: Student Hub & Internship Logbook

Selamat datang di dokumentasi resmi **Sistem Terpadu SKM, Task Report Magang, dan Log Book Konsultasi**. Sistem ini dikembangkan untuk mengintegrasikan 3 kebutuhan utama mahasiswa dan peserta magang dalam satu platform web modern:

1. **Modul Satuan Kegiatan Mahasiswa (SKM) & LinkedIn Assistant**
2. **Modul Tracking Task Report Magang / PKL (Standard PT Badak NGL)**
3. **Modul Log Book Kegiatan & Konsultasi (Standard STITEK Bontang `TI-SOP-17/FM-01`)**

---

## 📐 General System Architecture & Tech Stack

Aplikasi dirancang menggunakan arsitektur **Jamstack Serverless** modern yang dioptimalkan untuk performa tinggi, keamanan data, dan **kemudahan deployment tanpa biaya (Vercel Free Plan)**.

```mermaid
graph TD
    A[Client User Interface - React / Next.js 14] --> B[Vercel Serverless Platform]
    A --> C[Supabase PostgreSQL Database]
    A --> D[Supabase Storage Buckets]
    A --> E[Supabase Auth Engine]
    
    subgraph Frontend Layer
        A
    end
    
    subgraph Backend & Storage Layer (Supabase)
        C
        D
        E
    end
```

### 💻 Stack Teknologi

| Layer | Teknologi | Alasan Pemilihan & Keunggulan |
|---|---|---|
| **Frontend Framework** | React 18 / Next.js 14 (App Router) | Render cepat, mendukung SSR & Static Generation, ramah SEO, dan ekosistem React yang matang. |
| **Styling & UI Components** | Vanilla CSS + Tailwind CSS + Lucide Icons | Desain premium, modern glassmorphism, fully responsive, hemat ukuran bundle. |
| **Database** | Supabase (PostgreSQL 15+) | Relasional DB tangguh, gratis hingga 500MB, mendukung query JSONB dan RLS (Row Level Security). |
| **Backend & Authentication** | Supabase Auth (JWT) | Autentikasi email/password langsung aktif tanpa perlu mengelola server auth manual. |
| **File Storage** | Supabase Storage Buckets | Menyimpan lampiran foto kegiatan magang (hingga 50MB) dan sertifikat SKM. |
| **Deployment & Hosting** | Vercel Free Plan | Integration 1-click CI/CD via GitHub, global CDN, ssl gratis, 100% tanpa biaya server. |
| **Document Export Engine** | HTML-to-Print / PDF Renderer | Mencetak dokumen resmi Formulir 2 STITEK dan Laporan Rekap PT Badak NGL secara presisi (pixel-perfect). |

---

## 🗄️ Unified Database Schema (Supabase PostgreSQL)

Berikut adalah skema tabel relasional yang digunakan di Supabase:

```sql
-- 1. Tabel Profil Mahasiswa / User Profile
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    nim VARCHAR(50) NOT NULL,
    prodi VARCHAR(100) DEFAULT 'Teknik Informatika',
    instansi VARCHAR(255) DEFAULT 'Sekolah Tinggi Teknologi Bontang',
    tempat_kp VARCHAR(255) DEFAULT 'PT Badak NGL',
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Tabel SKM & Prestasi Mahasiswa
CREATE TABLE skm_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) NOT NULL, -- Prestasi, Organisasi, Sertifikasi, Kepanitiaan, Workshop
    penyelenggara VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    poin_skm INT DEFAULT 0,
    deskripsi TEXT,
    skill_tags TEXT[], -- Array tag keahlian untuk LinkedIn (misal: ['React', 'Python', 'Data Analysis'])
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Tabel Task Report Magang (Standard PT Badak NGL)
CREATE TABLE internship_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_mulai TIME,
    jam_selesai TIME,
    kategori VARCHAR(100) NOT NULL, -- Pekerjaan Utama, Meeting/Diskusi, Belajar/Training, Dokumentasi, Kunjungan Lapangan, Lainnya
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    output TEXT,
    kendala TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Tabel Logbook Kegiatan & Konsultasi (Formulir 2 STITEK)
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

---

## 📁 Struktur Direktori Dokumentasi per Modul

Dokumentasi lengkap dibagikan ke dalam subfolder khusus per modul di direktori `QOL/`:

```
d:\KOD ING\QOL\
├── README.md                           <- System Specification & Setup Guide (File Ini)
├── TEMPLATES_REFERENCE.md              <- Breakdown Referensi Template (Docx, PDF Kop, Form PNG)
├── modul-skm/                          <- Dokumentasi Modul SKM & LinkedIn
│   ├── 01-OVERVIEW-SKM.md
│   ├── 02-FITUR-PRESTASI-ORGANISASI.md
│   └── 03-FITUR-LINKEDIN-ASSISTANT.md
├── modul-task-report/                  <- Dokumentasi Modul Task Report Magang
│   ├── 01-OVERVIEW-TASK-REPORT.md
│   ├── 02-FITUR-FORM-INPUT.md
│   └── 03-FITUR-DASHBOARD-EXPORT.md
└── modul-logbook/                      <- Dokumentasi Modul Logbook Konsultasi STITEK
    ├── 01-OVERVIEW-LOGBOOK.md
    ├── 02-FITUR-FORMULIR2-TEMPLATE.md
    └── 03-FITUR-MULTI-SUPERVISOR.md
```

---

## 🛠️ Panduan Implementasi & Deployment ke Vercel

1. **Inisialisasi Project Frontend**:
   ```bash
   npx create-next-app@latest skm-logbook-app --typescript --tailwind --app
   ```
2. **Koneksi Supabase**:
   Buat file `.env.local` pada project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. **Deploy ke Vercel**:
   - Push repository ke GitHub.
   - Buka dashboard Vercel, pilih `Import Repository`.
   - Masukkan Environment Variables (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - Klik **Deploy**. Aplikasi aktif dalam waktu kurang dari 1 menit!
