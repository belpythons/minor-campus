# 📋 Modul Logbook - Breakdown Template Resmi `Formulir 2 STITEK`

Dokumen ini memuat breakdown penulisan bersih dan mudah dibaca dari berkas acuan `d:\KOD ING\QOL\Formulir 2  Form Kehadiran dan Aktifitas Kerja Praktek.docx` (`TI-SOP-17/FM-01`).

---

## 🏛️ Template Dokumen Cetak / Preview (Formulir 2)

```markdown
===================================================================================
[ LOGO STITEK ]    SEKOLAH TINGGI TEKNOLOGI BONTANG
                   PROGRAM STUDI TEKNIK INFORMATIKA
                   FORM KEHADIRAN DAN AKTIFITAS KERJA PRAKTEK
                   Kode SOP: TI-SOP-17/FM-01
===================================================================================

Nama Mahasiswa        : {{ NAMA_MAHASISWA }}
NIM                   : {{ NIM }}
Tempat Kerja Praktek  : {{ TEMPAT_KERJA_PRAKTEK }}

-----------------------------------------------------------------------------------
TABEL AKTIVITAS WORK & KONSULTASI
-----------------------------------------------------------------------------------

| No | Hari / Tanggal | Aktivitas Pekerjaan / Konsultasi | Nama & Paraf Pembimbing Lapangan |
|:--:|:--------------:|:---------------------------------|:---------------------------------|
| 1  | {{ TANGGAL_1 }}| {{ AKTIVITAS_1 }}                | {{ PEMBIMBING_1 }} ( {{ PARAF }} )|
| 2  | {{ TANGGAL_2 }}| {{ AKTIVITAS_2 }}                | {{ PEMBIMBING_2 }} ( {{ PARAF }} )|
| 3  | {{ TANGGAL_3 }}| {{ AKTIVITAS_3 }}                | {{ PEMBIMBING_3 }} ( {{ PARAF }} )|
| Dst| ...            | ...                              | ...                              |

-----------------------------------------------------------------------------------
PENGESAHAN & TANDA TANGAN
-----------------------------------------------------------------------------------

                                       {{ LOKASI }}, {{ TANGGAL_TTD }}

                                       Pembimbing Lapangan,
                                       {{ JABATAN_PEMBIMBING }}




                                       << Tanda Tangan & Cap >>




                                       ( {{ NAMA_PEMBIMBING_UTAMA }} )
===================================================================================
```

---

## 🎨 Spesifikasi Elemen Layout HTML/CSS Print

1. **Header Border**: Garis ganda tebal tipis khas Kop Surat Resmi Kampus.
2. **Font & Size**: Font `Times New Roman` atau `Arial` dengan ukuran 12pt (Header 14pt Bold).
3. **Ukuran Kertas**: A4 Portrait dengan Margin `Top: 2.5cm`, `Left: 2.5cm`, `Right: 2.5cm`, `Bottom: 2.5cm`.
4. **Border Tabel**: Border hitam solid 1px dengan padding sel 6px 8px.
