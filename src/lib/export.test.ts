import { describe, expect, it } from "vitest";
import { EXPORT_HEADERS, buildCsv, exportFilename, toExportRow } from "./export";
import type { InternshipReport } from "./types";

function report(overrides: Partial<InternshipReport> = {}): InternshipReport {
  return {
    id: "r1",
    user_id: "u1",
    tanggal: "2026-08-27",
    jam_mulai: "08:00:00",
    jam_selesai: "16:30:00",
    kategori: "Pekerjaan Utama",
    judul: "Instalasi panel",
    deskripsi: null,
    output: null,
    kendala: null,
    foto_url: null,
    created_at: "2026-08-27T00:00:00Z",
    ...overrides,
  };
}

describe("toExportRow", () => {
  it("maps a report to the 10 export columns", () => {
    const row = toExportRow(report({ deskripsi: "desc", output: "out" }));
    expect(row).toEqual([
      "2026-08-27", "08:00", "16:30", 8.5,
      "Pekerjaan Utama", "Instalasi panel", "desc", "out", "", "",
    ]);
    expect(row).toHaveLength(EXPORT_HEADERS.length);
  });

  it("computes night-shift duration across midnight", () => {
    const row = toExportRow(report({ jam_mulai: "22:00:00", jam_selesai: "06:00:00" }));
    expect(row[3]).toBe(8);
  });
});

describe("buildCsv", () => {
  it("starts with a UTF-8 BOM and CRLF-joins header + rows", () => {
    const csv = buildCsv([report()]);
    expect(csv.startsWith("﻿")).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe(EXPORT_HEADERS.join(","));
    expect(lines[1]).toContain("Instalasi panel");
    expect(lines.at(-1)).toBe("");
  });

  it("escapes commas, quotes, and newlines per RFC 4180", () => {
    const csv = buildCsv([
      report({ judul: 'a "b", c', deskripsi: "baris1\nbaris2" }),
    ]);
    expect(csv).toContain('"a ""b"", c"');
    expect(csv).toContain('"baris1\nbaris2"');
  });
});

describe("exportFilename", () => {
  it("uses the laporan-magang prefix with a local date stamp", () => {
    expect(exportFilename("csv")).toMatch(/^laporan-magang-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
