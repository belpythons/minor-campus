# 🖨️ Modul Task Report - Fitur Dashboard & Ekspor Cetak PDF (Berdasarkan `template kop.pdf`)

Dokumen ini menjabarkan spesifikasi rekapitulasi data, agregasi statistik, serta fitur ekspor laporan ke format dokumen cetak resmi PT Badak NGL berdasarkan acuan berkas `d:\KOD ING\QOL\template kop.pdf`.

---

## 📊 Dashboard KPI Summary Cards

Pada halaman utama dan dokumen rekap cetak, statistik kegiatan magang disajikan dalam 4 Kartu Metrik Utama:

1. **Card Laporan Kegiatan**: Total kuantitas entri laporan yang tercatat dalam periode.
2. **Card Hari Aktif**: Jumlah hari unik di mana peserta menginputkan kegiatan magang.
3. **Card Total Jam Kegiatan**: Akumulasi durasi selisih waktu (`Jam Selesai` - `Jam Mulai`).
4. **Card Jenis Kategori**: Variasi jumlah kategori pekerjaan yang pernah dilakukan.

---

## 🖨️ Spesifikasi Layout Cetak Dokumen (Print Stylesheet PDF)

Dokumen ekspor mengadopsi 100% tata letak visual dari `template kop.pdf`:

```
===================================================================================
[LOGO BADAK]   PT BADAK NGL
               Program Magang / Praktik Kerja Lapangan · Bontang, Kalimantan Timur
===================================================================================

                            LAPORAN KEGIATAN MAGANG
                  Belva Pranama Sriwibowo · Periode [TGL_AWAL] - s/d [TGL_AKHIR]

-----------------------------------------------------------------------------------
 I. IDENTITAS & PERIODE
-----------------------------------------------------------------------------------
 Nama Peserta         : Belva Pranama Sriwibowo
 Instansi / Sekolah   : Sekolah Tinggi Teknologi Bontang
 Email                : belvapranamasriwibowo@gmail.com
 Username Aplikasi    : belva
 Periode Kegiatan     : [Tgl Awal] s/d [Tgl Akhir]
 Filter Tanggal       : Seluruh periode
 Filter Kategori      : Semua kategori

-----------------------------------------------------------------------------------
 II. RINGKASAN KEGIATAN
-----------------------------------------------------------------------------------
 +---------------------+ +---------------------+ +---------------------+ +---------------------+
 | [ 42 ]              | | [ 28 ]              | | [ 168.0 ]           | | [ 5 ]               |
 | Laporan Kegiatan    | | Hari Aktif          | | Total Jam Kegiatan  | | Jenis Kategori      |
 +---------------------+ +---------------------+ +---------------------+ +---------------------+
 Total durasi tercatat   : 168 Jam
 Rata-rata per hari aktif: 6 Jam / hari
 Kategori terbanyak      : Pekerjaan Utama
 Kegiatan berkendala     : 2 kegiatan
 Kegiatan berfoto        : 15 kegiatan

-----------------------------------------------------------------------------------
 V. DAFTAR KEGIATAN
-----------------------------------------------------------------------------------
 [ Tabel Rincian Kegiatan Magang: Tanggal | Judul & Deskripsi | Kategori | Jam ]

-----------------------------------------------------------------------------------
 VI. PENGESAHAN
-----------------------------------------------------------------------------------

      Peserta Magang,                                 Mengetahui, Pembimbing Lapangan



  Belva Pranama Sriwibowo                                   PT Badak NGL
Sekolah Tinggi Teknologi Bontang

-----------------------------------------------------------------------------------
Dicetak dari aplikasi Task Report Magang · PT Badak NGL | [Timestamp Cetak]
===================================================================================
```

---

## 📥 Format Ekspor yang Didukung:
1. **Official PDF / Print View**: Menggunakan CSS `@media print` khusus A4.
2. **Excel / CSV Download**: Mengunduh seluruh log mentah untuk kebutuhan pengolahan data spreadsheet.
