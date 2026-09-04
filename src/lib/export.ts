import { durasiJam, formatJam } from "./format";
import type { InternshipReport } from "./types";

export const EXPORT_HEADERS = [
  "Tanggal",
  "Jam Mulai",
  "Jam Selesai",
  "Durasi (Jam)",
  "Kategori",
  "Judul / Nama Kegiatan",
  "Deskripsi Kegiatan",
  "Output / Hasil",
  "Kendala",
  "URL Foto",
] as const;

export type ExportRow = [
  string, string, string, number, string, string, string, string, string, string,
];

export function toExportRow(r: InternshipReport): ExportRow {
  return [
    r.tanggal,
    formatJam(r.jam_mulai),
    formatJam(r.jam_selesai),
    Number(durasiJam(r.jam_mulai, r.jam_selesai).toFixed(2)),
    r.kategori,
    r.judul,
    r.deskripsi ?? "",
    r.output ?? "",
    r.kendala ?? "",
    r.foto_url ?? "",
  ];
}

/** RFC 4180 escaping. */
function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV with a UTF-8 BOM so Excel on Windows reads the accents correctly. */
export function buildCsv(reports: InternshipReport[]): string {
  const lines = [
    EXPORT_HEADERS.join(","),
    ...reports.map((r) => toExportRow(r).map(csvCell).join(",")),
  ];
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/** "laporan-magang-2026-08-27.xlsx" */
export function exportFilename(ext: string): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `laporan-magang-${stamp}.${ext}`;
}
