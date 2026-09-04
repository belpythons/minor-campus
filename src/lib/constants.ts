import type { ReportKategori, SkmKategori } from "./types";

/** Official activity categories — modul-task-report/01-OVERVIEW-TASK-REPORT.md */
export const REPORT_KATEGORI: ReportKategori[] = [
  "Pekerjaan Utama",
  "Meeting/Diskusi",
  "Belajar/Training",
  "Dokumentasi",
  "Kunjungan Lapangan",
  "Lainnya",
];

/** SKM categories — modul-skm/02-FITUR-PRESTASI-ORGANISASI.md */
export const SKM_KATEGORI: { value: SkmKategori; emoji: string; short: string }[] = [
  { value: "Prestasi / Kejuaraan", emoji: "🥇", short: "Prestasi" },
  { value: "Pengalaman Organisasi", emoji: "🏛️", short: "Organisasi" },
  { value: "Sertifikasi / Lisensi", emoji: "📜", short: "Sertifikasi" },
  { value: "Kepanitiaan Event", emoji: "🎪", short: "Kepanitiaan" },
  { value: "Workshop / Seminar / Pelatihan", emoji: "🎓", short: "Workshop" },
];

/** Graduation requirement used by the SKM progress bar. */
export const SKM_TARGET_POIN = 50;

export const STORAGE_BUCKET_CERTIFICATES = "skm-certificates";
export const STORAGE_BUCKET_PHOTOS = "report-photos";

/** Client-side photo cap — modul-task-report/02-FITUR-FORM-INPUT.md */
export const MAX_PHOTO_SIZE = 20 * 1024 * 1024;
/** Certificate cap (PDF/image) for the SKM module. */
export const MAX_CERTIFICATE_SIZE = 20 * 1024 * 1024;

export const ORG = {
  kampus: "Sekolah Tinggi Teknologi Bontang",
  kampusUpper: "SEKOLAH TINGGI TEKNOLOGI BONTANG",
  prodiUpper: "PROGRAM STUDI TEKNIK INFORMATIKA",
  formulirTitle: "FORM KEHADIRAN DAN AKTIFITAS KERJA PRAKTEK",
  kodeSop: "TI-SOP-17/FM-01",
  perusahaan: "PT BADAK NGL",
  perusahaanMixed: "PT Badak NGL",
  perusahaanSub: "Program Magang / Praktik Kerja Lapangan · Bontang, Kalimantan Timur",
  lokasi: "Bontang",
} as const;
