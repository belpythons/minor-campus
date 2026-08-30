# 📝 Modul Task Report - Fitur Form Input (Berdasarkan `form.png`)

Dokumen ini menjabarkan spesifikasi antarmuka dan validasi form input laporan harian magang yang di-adaptasi langsung dari `d:\KOD ING\QOL\form.png` (`http://10.10.1.187:8097/reports/new`).

---

## 🎨 Spesifikasi Form & Layout (UI Specification)

Contoh struktur form persis sesuai `form.png`:

```
+-----------------------------------------------------------------------------------+
| Tanggal *              | Jam Mulai               | Jam Selesai                    |
| [ 08/27/2026       📅 ]| [ --:--            🕒 ]| [ --:--                   🕒 ]|
+-----------------------------------------------------------------------------------+
| Kategori                                                                          |
| [ - Pilih kategori -                                                            v]|
+-----------------------------------------------------------------------------------+
| Judul / Nama Kegiatan *                                                           |
| [ mis. Membuat modul input data inventaris                                       ]|
+-----------------------------------------------------------------------------------+
| Deskripsi Kegiatan                                                                |
| [ Jelaskan apa yang dikerjakan...                                                ]|
|                                                                                   |
+-----------------------------------------------------------------------------------+
| Output / Hasil                                                                    |
| [ Hasil yang dicapai / dokumen / progres...                                      ]|
+-----------------------------------------------------------------------------------+
| Kendala (jika ada)                                                                |
| [ Kendala yang dihadapi...                                                       ]|
+-----------------------------------------------------------------------------------+
| Foto (opsional, maks 20MB)                                                       |
| [ Choose File ] No file chosen                                                    |
+-----------------------------------------------------------------------------------+
| [  Simpan Laporan  ]  [ Batal ]                                                   |
+-----------------------------------------------------------------------------------+
```

---

## ⚙️ Detail Spesifikasi Field & Validasi

| Nama Field | Tipe Control | Status | Aturan Validasi / Constraint | Description / Placeholder |
|---|---|---|---|---|
| **Tanggal** | `date` | **Wajib** | Standard format ISO `YYYY-MM-DD`, default: hari ini | Tanggal pelaksanaan kegiatan |
| **Jam Mulai** | `time` | Opsional | Format 24 jam `HH:MM` | Waktu dimulainya kegiatan |
| **Jam Selesai** | `time` | Opsional | Must be `>= Jam Mulai` jika diisi | Waktu berakhirnya kegiatan |
| **Kategori** | `select` | Opsional | Options: Pekerjaan Utama, Meeting/Diskusi, Belajar/Training, Dokumentasi, Kunjungan Lapangan, Lainnya | Kategori jenis aktivitas |
| **Judul / Nama Kegiatan** | `text` | **Wajib** | Max 255 karakter, not empty | `mis. Membuat modul input data inventaris` |
| **Deskripsi Kegiatan** | `textarea` | Opsional | Multi-line text (rows=3) | `Jelaskan apa yang dikerjakan...` |
| **Output / Hasil** | `textarea` | Opsional | Multi-line text (rows=2) | `Hasil yang dicapai / dokumen / progres...` |
| **Kendala** | `textarea` | Opsional | Multi-line text (rows=2) | `Kendala yang dihadapi...` |
| **Foto** | `file` | Opsional | MIME: `image/*`, **Maksimal 20MB** | Validasi client-side size check sebelum unggah |

---

## 🔒 Client-Side File Validation Script (JavaScript)

```javascript
// Client-side file size check to avoid 500 payload errors
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function validatePhotoInput(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > MAX_FILE_SIZE) {
            alert(`Ukuran foto ${(file.size / (1024 * 1024)).toFixed(1)} MB melebihi batas 20 MB.\nSilakan pilih atau kompres foto yang lebih kecil.`);
            fileInput.value = '';
            return false;
        }
    }
    return true;
}
```
