# 📄 Referensi Template & Dokumen Acuan System QOL

Dokumen ini memuat analisa dan rincian breakdown lengkap dari 3 berkas acuan fisik yang terdapat di direktori `QOL/`:

---

## 1. Breakdown Berkas `Formulir 2  Form Kehadiran dan Aktifitas Kerja Praktek.docx`

Berkas ini merupakan standar resmi Formulir Log Book Kehadiran dan Aktivitas Kerja Praktek dari **Sekolah Tinggi Teknologi Bontang (STITEK)**.

### 🏛️ Header / Kop Surat Resmi
- **Logo**: Logo Resmi STITEK Bontang (`stitek_logo.png`)
- **Institusi**: SEKOLAH TINGGI TEKNOLOGI BONTANG
- **Program Studi**: PROGRAM STUDI TEKNIK INFORMATIKA
- **Nama Dokumen**: FORM KEHADIRAN DAN AKTIFITAS KERJA PRAKTEK
- **Kode SOP**: `TI-SOP-17/FM-01`

### 👤 Data Identitas Mahasiswa & Instansi KP
- **Nama Mahasiswa**: `[Nama Lengkap Mahasiswa]`
- **NIM**: `[Nomor Induk Mahasiswa]`
- **Tempat Kerja Praktek**: `[Nama Perusahaan / Dept Tempat KP]`

### 📋 Struktur Tabel Aktivitas Harian Log Book
| No | Hari / Tanggal | Aktivitas Pekerjaan | Nama dan Paraf Pembimbing Lapangan |
|---|---|---|---|
| 1 | `[dd/mm/yyyy]` | `[Deskripsi detail pekerjaan/kegiatan]` | `[Nama Supervisor & Status Paraf]` |
| 2 | ... | ... | ... |

### ✍️ Blok Pengesahan & Tanda Tangan
- **Lokasi & Tanggal**: `[Lokasi, dd/mm/yyyy]` (contoh: *Bontang, 27 Agustus 2026*)
- **Jabatan Pembimbing Lapangan**: `<<Diisi dengan Jabatan Pembimbing Lapangan>>` (contoh: *Senior Engineer IT*)
- **Tanda Tangan & Cap**: `<<Tanda tangan dan Cap>>`
- **Nama Terang Pembimbing Lapangan**: `(Nama Pembimbing Lapangan)`

---

## 2. Breakdown Berkas `template kop.pdf` (PT Badak NGL)

Berkas ini merupakan acuan format **Hasil Ekspor / Cetak Rekap Laporan Kegiatan Magang** di PT Badak NGL.

### 🏢 Header Dokumen Cetak
- **Logo**: Logo Resmi PT Badak NGL
- **Institusi / Sub-Title**: `PT BADAK NGL - Program Magang / Praktik Kerja Lapangan · Bontang, Kalimantan Timur`
- **Judul Utama Cetak**: `LAPORAN KEGIATAN MAGANG`
- **Sub-Judul**: `[Nama Peserta] · Periode [Mulai] - s/d [Selesai]`

### 📑 Section I: IDENTITAS & PERIODE
- **Nama Peserta**: Belva Pranama Sriwibowo
- **Instansi / Sekolah**: Sekolah Tinggi Teknologi Bontang
- **Email**: `belvapranamasriwibowo@gmail.com`
- **Username Aplikasi**: `belva`
- **Periode Kegiatan**: `[Rentang Tanggal]`
- **Filter Tanggal**: `Seluruh periode` / `Custom Range`
- **Filter Kategori**: `Semua kategori` / `Spesifik Kategori`

### 📊 Section II: RINGKASAN KEGIATAN (KPI Summary Cards)
- **Card 1**: Total Laporan Kegiatan (Count)
- **Card 2**: Hari Aktif (Total Unique Days)
- **Card 3**: Total Jam Kegiatan (Sum of Hours)
- **Card 4**: Jenis Kategori (Count of Categories)
- **Metric Details**:
  - Total durasi tercatat
  - Rata-rata per hari aktif
  - Kategori terbanyak
  - Kegiatan berkendala
  - Kegiatan berfoto

### 📝 Section V: DAFTAR KEGIATAN
- Tabel komprehensif memuat seluruh entri laporan magang yang lolos filter.

### ✒️ Section VI: PENGESAHAN (Dual Signature Block)
- **Kiri**: Peserta Magang (Nama + Sekolah Tinggi Teknologi Bontang)
- **Kanan**: Mengetahui, Pembimbing Lapangan (PT Badak NGL)
- **Footer Metadata**: `Dicetak dari aplikasi Task Report Magang · PT Badak NGL` + Timestamp + User ID.

---

## 3. Breakdown Berkas `form.png` (Task Report Magang UI)

Berkas ini merupakan snapshot antarmuka web pencatatan laporan harian magang di `http://10.10.1.187:8097/reports/new`.

### 📝 Elemen & Spesifikasi Form Input
1. **Tanggal** `[date]` *(Wajib)*: Format `MM/DD/YYYY` / `YYYY-MM-DD`.
2. **Jam Mulai** `[time]` *(Opsional)*: Format `HH:MM`.
3. **Jam Selesai** `[time]` *(Opsional)*: Format `HH:MM`.
4. **Kategori** `[select]` *(Dropdown)*:
   - `Pilih kategori`
   - `Pekerjaan Utama`
   - `Meeting/Diskusi`
   - `Belajar/Training`
   - `Dokumentasi`
   - `Kunjungan Lapangan`
   - `Lainnya`
5. **Judul / Nama Kegiatan** `[text]` *(Wajib)*: Placeholder: `mis. Membuat modul input data inventaris`.
6. **Deskripsi Kegiatan** `[textarea]` *(Opsional)*: Placeholder: `Jelaskan apa yang dikerjakan...`.
7. **Output / Hasil** `[textarea]` *(Opsional)*: Placeholder: `Hasil yang dicapai / dokumen / progres...`.
8. **Kendala (jika ada)** `[textarea]` *(Opsional)*: Placeholder: `Kendala yang dihadapi...`.
9. **Foto** `[file]` *(Opsional, Max 20MB)*: Support format JPG, PNG, WEBP.
10. **Aksi Button**:
    - `Simpan Laporan` (Primary Solid Blue Button)
    - `Batal` (Secondary Outline Button)
