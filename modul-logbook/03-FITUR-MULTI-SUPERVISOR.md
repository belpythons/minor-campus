# 👥 Modul Logbook - Fitur Tracking Multi-Supervisor & Konsultasi

Dokumen ini menjabarkan spesifikasi fitur pencatatan konsultasi bersama berbagai atasan, supervisor, atau pejabat departemen yang berbeda-beda (*Multi-Supervisor Consultation Tracking*).

---

## 💡 Latar Belakang & Masalah Yang Diselesaikan

Dalam pelaksanaan Kerja Praktek / Magang di industri (seperti di PT Badak NGL), proyek mahasiswa sering kali membutuhkan diskusi & konsultasi lintas fungsi dengan orang berpangkat atau pejabat dari departemen berbeda (misal: *Manager IT, Lead Engineer Production Planning, Senior Supervisor SHE-Q, Specialist Data*).

Modul ini memastikan setiap sesi diskusi/konsultasi tersebut tercatat rapi dengan kejelasan:
1. **Siapa yang dikonsultasikan** (Nama & Jabatan/Pangkat).
2. **Topik / Arahan Konsultasi**.
3. **Hasil & Tindak Lanjut**.
4. **Status Paraf / Persetujuan Digital**.

---

## 🛠️ Fitur & Form Input Konsultasi Multi-Supervisor

```
+-----------------------------------------------------------------------+
| Form Tambah Konsultasi / Log Book                                     |
+-----------------------------------------------------------------------+
| Tanggal Konsultasi : [ 08/26/2026 📅 ]                                |
|                                                                       |
| Pembimbing / Atasan: [ Select / Type Name                          v ]|
|   - Pak Rizky (Senior Specialist SHE-Q)                               |
|   - Pak Saleh (Superintendent IT Planning)                            |
|   - + Tambah Supervisor Baru                                          |
|                                                                       |
| Aktivitas / Topik  : [ Diskusi Prosedur Perhitungan Safety Man Hour  ]|
|                        [ untuk PKWTT & Tamu Zone 1                   ]|
|                                                                       |
| Status Paraf       : [x] Sudah Di-paraf / Disetujui                   |
+-----------------------------------------------------------------------+
```

---

## 📊 Tampilan Rekap Konsultasi per Atasan / Supervisor

Sistem menyediakan filter peratasan sehingga mahasiswa dapat melihat history berapa kali telah melakukan konsultasi dengan atasan tertentu:

```text
[ Filter Atasan: Pak Saleh (Superintendent IT Planning) ]

---------------------------------------------------------------------------------
Tanggal      Topik Konsultasi                           Status Paraf
---------------------------------------------------------------------------------
2026-07-07   Meeting SHE-Q Safety Man Hour              [ Verified ✓ ]
2026-07-08   Diskusi Rencana Automasi Daily Report      [ Verified ✓ ]
2026-08-15   Review Staging Database Exaquantum         [ Pending    ]
---------------------------------------------------------------------------------
```
