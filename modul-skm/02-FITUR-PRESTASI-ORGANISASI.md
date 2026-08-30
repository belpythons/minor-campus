# 🏆 Modul SKM - Fitur Pencatatan Prestasi, Organisasi & Sertifikasi

Dokumen ini menjabarkan spesifikasi fitur pencatatan dan pengelolaan portofolio kegiatan mahasiswa pada Modul SKM.

---

## 📋 Spesifikasi Form Input SKM

### 1. Elemen Field Input
- **Kategori Kegiatan** `[select]` *(Wajib)*:
  - 🥇 `Prestasi / Kejuaraan` (Juara 1/2/3, Finalis, Participant)
  - 🏛️ `Pengalaman Organisasi` (Ketua, Sekretaris, Anggota, BEM/HIMA)
  - 📜 `Sertifikasi / Lisensi` (BNSP, AWS, Dicoding, Google, dsb.)
  - 🎪 `Kepanitiaan Event` (Project Officer, Sie Acara, Humas, dsb.)
  - 🎓 `Workshop / Seminar / Pelatihan`
- **Judul Kegiatan / Peran** `[text]` *(Wajib)*: Contoh: *Juara 1 Hackathon Nasional IT / Ketua Divisi Humas HIMA*.
- **Penyelenggara / Instansi** `[text]` *(Wajib)*: Contoh: *Kementerian Kominfo / Dicoding Indonesia / HMTI STITEK*.
- **Tanggal Mulai & Tanggal Selesai** `[date]` *(Wajib)*.
- **Bobot Poin SKM** `[number]` *(Opsional)*: Input manual atau hitung otomatis berdasarkan aturan SKM kampus.
- **Skill Tags** `[multi-select / tag input]` *(Opsional)*: Contoh: `#React`, `#ProjectManagement`, `#PublicSpeaking`.
- **Deskripsi Pencapaian & Tanggung Jawab** `[textarea]` *(Opsional)*: Detail tugas, dampak, dan output yang dicapai.
- **Upload Bukti Sertifikat / SK** `[file input]` *(Opsional)*: Mengunggah file PDF/Gambar bukti ke Supabase Storage `skm-certificates`.

---

## 📊 Dashboard SKM & Visual Stat Target

```
+-----------------------------------------------------------------------+
|  TOTAL POIN SKM: 45 / 50 Poin (Syarat Kelulusan Terpenuhi 90%)         |
+-----------------------------------------------------------------------+
| [ Prestasi: 2 ] [ Organisasi: 3 ] [ Sertifikasi: 5 ] [ Workshop: 8 ]  |
+-----------------------------------------------------------------------+
```

### Fitur Filtering & Pencarian:
- Search bar berbasis kata kunci judul, penyelenggara, atau skill tag.
- Filter berdasarkan rentang tahun akademik.
- Preview cepat sertifikat dalam modal lightbox.
