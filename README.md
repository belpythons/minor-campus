# Student Hub & Internship Logbook

Implementasi dari spesifikasi di `D:\KOD ING\QOL\` — tiga modul dalam satu aplikasi Next.js 14:

1. **Satuan Kegiatan Mahasiswa (SKM) & LinkedIn Assistant** → [docs/FITUR-MODUL-SKM.md](docs/FITUR-MODUL-SKM.md)
2. **Task Report Magang / PKL (PT Badak NGL)** → [docs/FITUR-MODUL-TASK-REPORT.md](docs/FITUR-MODUL-TASK-REPORT.md)
3. **Log Book Kegiatan & Konsultasi (STITEK `TI-SOP-17/FM-01`)** → [docs/FITUR-MODUL-LOGBOOK.md](docs/FITUR-MODUL-LOGBOOK.md)

Audit UX/QA beserta seluruh bug yang ditemukan dan diperbaiki:
→ [docs/UX-QA-AUDIT.md](docs/UX-QA-AUDIT.md)

---

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) · React 18 · TypeScript |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS · Poppins |
| Ikon | Lucide — set ikon resmi shadcn |
| Animasi | Framer Motion — seluruhnya menghormati `prefers-reduced-motion` |
| Tema | `next-themes` — Terang / Gelap / Ikuti sistem |
| Notifikasi | Sonner (toast) |
| Database / Auth / Storage | Supabase (PostgreSQL 15, JWT Auth, Storage Buckets) |
| Ekspor Excel | ExcelJS |
| Cetak PDF | HTML + `@media print` A4 |
| PWA | Manifest + service worker tulis-tangan |

### Sistem Token

`src/app/globals.css` memuat **dua lapis** token, dan pembagian ini penting:

1. **Token semantik shadcn (HSL)** — `--background`, `--primary`,
   `--muted-foreground`, dan seterusnya. Punya nilai terang dan gelap. Semua
   komponen membaca dari sini.
2. **Token brand (hex)** — `--navy #001e41` · `--blue #0057a8` ·
   `--red #e3001b` · `--amber #f9a330`, diambil dari sistem referensi
   `http://10.10.1.187:8097`. **Dipatok ke nilai terang di kedua tema**, karena
   `src/app/print/print.css` bergantung padanya dan hasil PDF tidak boleh
   berubah mengikuti tema tampilan.

Kontras teks memenuhi WCAG AA: `--muted-foreground` 5.9:1 pada tema terang,
6.1:1 pada tema gelap.

---

## Menjalankan

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

### Konfigurasi Supabase

`.env.local` (tidak masuk git) harus berisi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Dua variabel berikut **opsional** dan hanya dipakai skrip pemeliharaan di `scripts/`, bukan oleh aplikasi:

```env
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres
```

> Host `db.<ref>.supabase.co` pada halaman *Direct connection* Supabase kini hanya menyediakan alamat IPv6. Bila jaringan Anda IPv4-only, pakai **Session pooler** (`aws-0-<region>.pooler.supabase.com:5432`, user `postgres.<ref>`) — itulah nilai yang tersimpan di `.env.local`.

### Menyiapkan Database

Jalankan `supabase/schema.sql` satu kali. Dua cara:

```bash
node scripts/apply-schema.mjs      # butuh SUPABASE_DB_URL
```

atau salin isinya ke **SQL Editor** pada dashboard Supabase lalu jalankan.

Skrip itu idempoten (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`) sehingga aman dijalankan ulang. Isinya:

- 6 tabel: `profiles`, `skm_activities`, `internship_reports`, `report_comments`, `supervisors`, `logbook_entries`
- Trigger `on_auth_user_created` — membuat baris `profiles` otomatis saat pendaftaran
- Kebijakan Row Level Security untuk setiap tabel
- Bucket Storage `skm-certificates` dan `report-photos` beserta kebijakan aksesnya

Empat tabel inti mengikuti `QOL/README.md` apa adanya. Kolom dan tabel tambahan diberi komentar `-- EXTENSION:` beserta modul yang membutuhkannya.

### Pengaturan Auth

Pada dashboard Supabase → **Authentication → Providers → Email**: matikan *Confirm email* bila ingin pendaftaran langsung bisa masuk tanpa verifikasi email. Bila dibiarkan menyala, halaman `/register` menampilkan pesan untuk mengecek email lebih dahulu.

---

## Skrip Pemeliharaan

| Skrip | Fungsi |
|---|---|
| `node scripts/apply-schema.mjs` | Menjalankan `supabase/schema.sql` ke database |
| `node scripts/seed-test-user.mjs` | Membuat akun uji `belva.test@stitek.local` / `Test1234!` (sudah terkonfirmasi) |
| `node scripts/seed-demo-data.mjs` | Mengisi 6 laporan, 2 pembimbing, 4 entri log book untuk akun uji |
| `node scripts/generate-pwa-icons.mjs` | Membangkitkan seluruh ikon PWA dari `public/logo.png` |
| `node scripts/ingest-branding-kb.mjs` | Meng-embed korpus `docs/branding-kb/*.md` ke tabel `branding_chunks` (butuh `GEMINI_API_KEY`) |
| `node scripts/_qa.mjs <outDir>` | Harness QA: login sungguhan, tangkapan layar, pemeriksaan perilaku |
| `node scripts/_pdf.mjs <outDir>` | Mencetak dokumen resmi (formulir2, rekap, briefing) ke PDF pada tema terang dan gelap |

Skrip Supabase memakai `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_DB_URL` dan
**tidak** pernah dijalankan oleh aplikasi. Hapus akun uji lewat dashboard
Supabase sebelum dipakai sungguhan.

Dua skrip berawalan `_` butuh server `npm run dev` yang sedang berjalan.
Lokasi Chrome dicari otomatis lintas-OS (Windows/macOS/Linux) dan dapat
di-override dengan env `CHROME_PATH`; kredensial uji dengan `QA_EMAIL` /
`QA_PASSWORD`.

---

## Peta Rute

```
/login · /register                     autentikasi
/offline                               fallback service worker (statis, tanpa sesi)
/dashboard                             ringkasan tiga modul
/account                               profil + blok pengesahan (mengisi kedua kop surat)

/skm · /skm/new · /skm/[id]/edit       portofolio SKM (persona kampus: ITS/UNAIR/Tel-U/BINUS/Kustom)
/skm/linkedin                          generator teks LinkedIn & Markdown (+ AI RAG bila GEMINI_API_KEY diset)
/api/skm/linkedin (+/status)           route AI server-only (Gemini; fallback template tanpa key)

/reports/feed                          daftar kegiatan seluruh peserta
/reports · /reports/new                laporan sendiri
/reports/[id] · /reports/[id]/edit     detail + komentar · ubah
/reports/export                        panel filter ekspor
/print/rekap-magang                    dokumen cetak A4 (kop mengikuti setelan "Kop Surat & Logo")
/api/export/xlsx · /api/export/csv     unduhan data (?dataset=logbook untuk log book)

/logbook · /logbook/new                log book kerja praktek (+ select proyek opsional)
/logbook/[id] · /logbook/[id]/edit     detail entri · ubah
/logbook/supervisors                   kelola pembimbing (persona: peran, prioritas, bidang)
/logbook/rekap                         rekap konsultasi per atasan
/logbook/projects · /projects/[id]     proyek konsultasi multi-persona + papan saran ADR
/logbook/projects/[id]/briefing        Briefing Pack SBAR (layar)
/print/formulir2                       dokumen cetak A4 Formulir 2 (kop mengikuti setelan)
/print/briefing?project=<id>           dokumen cetak A4 Briefing Pack SBAR
```

Seluruh rute memerlukan sesi; `src/middleware.ts` menyegarkan cookie Supabase,
mengalihkan peramban yang belum masuk ke `/login`, dan membalas **401 JSON**
untuk `/api/*` agar pemanggil API tidak menerima halaman HTML. Manifest, service
worker, dan folder ikon dikecualikan dari matcher.

### Filter tersimpan di URL

Setiap filter dan nomor halaman ditulis ke query string, sehingga tampilan bisa
di-*refresh*, ditelusuri dengan tombol Back/Forward, dan dibagikan sebagai
tautan:

```
/reports?q=Handover&kategori=Dokumentasi&page=2
/logbook?pembimbing=<uuid>&paraf=belum
/skm?tahun=2025%2F2026
```

---

## Struktur Direktori

```
app/
├─ docs/                    dokumentasi fitur per modul
├─ scripts/                 skrip pemeliharaan & QA (bukan bagian aplikasi)
├─ supabase/schema.sql      skema, RLS, bucket
├─ public/
│  ├─ logo.png              identitas & kop kedua dokumen cetak
│  ├─ manifest.webmanifest  PWA manifest + shortcut
│  ├─ sw.js                 service worker
│  └─ icons/                ikon PWA hasil generate
├─ components.json          konfigurasi shadcn/ui
└─ src/
   ├─ middleware.ts
   ├─ hooks/                use-url-filters · use-unsaved-changes
   ├─ app/
   │  ├─ (app)/             halaman ber-sidebar (+ loading.tsx, error.tsx)
   │  ├─ print/             dokumen cetak + print.css
   │  ├─ offline/           fallback offline
   │  ├─ api/export/
   │  └─ login/ · register/ · auth/
   ├─ components/
   │  ├─ ui/                20 primitive shadcn/ui
   │  ├─ shared/            field · confirm-dialog · filter-bar · pagination ·
   │  │                     file-picker · stat-card · skeletons · empty-state ·
   │  │                     unsaved-bar · page-header · error-view
   │  ├─ motion/            primitive Framer Motion
   │  ├─ pwa/               service-worker-registrar · install-prompt
   │  └─ layout/ skm/ reports/ logbook/ print/
   └─ lib/
      ├─ supabase/          client · server · middleware · config
      ├─ types.ts           cerminan schema.sql
      ├─ constants.ts       kategori resmi, batas ukuran, teks institusi
      ├─ format.ts          tanggal/jam Bahasa Indonesia
      ├─ skm-points.ts      tabel bobot poin SKM
      ├─ linkedin-format.ts tiga format LinkedIn + Markdown
      ├─ report-stats.ts    agregasi Section II–IV
      ├─ report-query.ts    filter + query bersama cetak/ekspor
      ├─ logbook-query.ts
      ├─ export.ts          baris & escaping CSV
      ├─ upload.ts          Storage helper + progress unggahan
      ├─ navigation.ts      sumber kebenaran navigasi
      ├─ notify.ts          toast + penerjemah pesan error
      └─ utils.ts           cn()
```

---

## Deploy ke Vercel

1. Push repository ke GitHub.
2. Vercel → **Import Repository**. Bila `app/` bukan akar repo, set **Root Directory** ke `app`.
3. Tambahkan Environment Variables: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Deploy**.
5. Di Supabase → **Authentication → URL Configuration**, tambahkan domain Vercel ke *Site URL* dan *Redirect URLs*.

Variabel `SUPABASE_SERVICE_ROLE_KEY` dan `SUPABASE_DB_URL` **tidak perlu** dipasang di Vercel — keduanya hanya dipakai skrip lokal.

---

## Menyimpan Dokumen sebagai PDF

Buka `/print/rekap-magang` atau `/print/formulir2`, tekan **Cetak / Simpan PDF**,
lalu pada dialog cetak browser pilih tujuan **Save as PDF**. Toolbar tidak ikut
tercetak; ukuran kertas sudah dikunci A4 portrait lewat `@page`.

Kedua halaman cetak **selalu terang**, apa pun tema tampilan yang dipakai. Ini
diverifikasi otomatis: `scripts/_pdf.mjs` mencetak keduanya pada tema terang dan
gelap, dan hasilnya identik byte-per-byte.

---

## PWA

Aplikasi bisa dipasang ke layar utama. `public/sw.js` ditulis tangan, bukan
dibangkitkan, karena ada satu aturan keras: **data per-pengguna tidak pernah
disajikan dari cache** — menyajikan log book peserta lain dari cache basi lebih
buruk daripada sekadar offline.

| Jenis permintaan | Strategi |
|---|---|
| Navigasi halaman | Network-first, jatuh ke `/offline` |
| `/_next/static/*` | Cache-first (nama berkas ber-hash) |
| Ikon & manifest | Stale-while-revalidate |
| Supabase, `/api/*`, `/auth/*`, `/print/*`, payload RSC | Tidak disentuh sama sekali |

Perbarui ikon setelah mengganti `public/logo.png`:

```bash
node scripts/generate-pwa-icons.mjs
```
