import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredReports, parseFilters, periodeLabel } from "@/lib/report-query";
import { EXPORT_HEADERS, exportFilename, toExportRow } from "@/lib/export";
import { computeStats, recapByKategori } from "@/lib/report-stats";
import { ORG } from "@/lib/constants";
import { pluralJam } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NAVY = "FF001E41";
const HEAD_BG = "FFEEF2F7";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap, instansi, email, tempat_kp")
    .eq("id", user.id)
    .maybeSingle();

  const filters = parseFilters(new URL(request.url).searchParams);
  const reports = await fetchFilteredReports(supabase, user.id, filters);
  const nama = profile?.nama_lengkap || user.email?.split("@")[0] || "Peserta";

  const wb = new ExcelJS.Workbook();
  wb.creator = "Task Report Magang";
  wb.created = new Date();

  /* ------------------------------ Sheet 1: data ------------------------------ */
  const ws = wb.addWorksheet("Laporan Kegiatan", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { width: 12 },
    { width: 10 },
    { width: 11 },
    { width: 12 },
    { width: 20 },
    { width: 44 },
    { width: 56 },
    { width: 40 },
    { width: 32 },
    { width: 44 },
  ];

  const head = ws.addRow([...EXPORT_HEADERS]);
  head.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
  head.alignment = { vertical: "middle" };
  head.height = 22;
  head.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  });

  for (const r of reports) {
    const row = ws.addRow(toExportRow(r));
    row.alignment = { vertical: "top", wrapText: true };
    row.getCell(4).numFmt = "0.00";
  }

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: EXPORT_HEADERS.length } };

  /* ---------------------------- Sheet 2: ringkasan ---------------------------- */
  const stats = computeStats(reports);
  const sum = wb.addWorksheet("Ringkasan");
  sum.columns = [{ width: 30 }, { width: 40 }];

  const title = sum.addRow(["LAPORAN KEGIATAN MAGANG", ""]);
  title.font = { bold: true, size: 13, color: { argb: NAVY } };
  sum.addRow([ORG.perusahaanSub, ""]).font = { size: 9, color: { argb: "FF45566E" } };
  sum.addRow([]);

  const info: [string, string | number][] = [
    ["Nama Peserta", nama],
    ["Instansi / Sekolah", profile?.instansi || ORG.kampus],
    ["Email", profile?.email || user.email || "-"],
    ["Tempat Kerja Praktek", profile?.tempat_kp || ORG.perusahaanMixed],
    ["Periode Kegiatan", periodeLabel(filters, reports)],
    ["Filter Kategori", filters.kategori || "Semua kategori"],
    ["", ""],
    ["Laporan Kegiatan", stats.totalLaporan],
    ["Hari Aktif", stats.hariAktif],
    ["Total Jam Kegiatan", Number(stats.totalJam.toFixed(2))],
    ["Jenis Kategori", stats.jenisKategori],
    ["Rata-rata per hari aktif", stats.rataPerHari ? pluralJam(stats.rataPerHari) : "-"],
    ["Kategori terbanyak", stats.kategoriTerbanyak ?? "-"],
    ["Kegiatan berkendala", stats.kegiatanBerkendala],
    ["Kegiatan berfoto", stats.kegiatanBerfoto],
  ];

  for (const [k, v] of info) {
    const row = sum.addRow([k, v]);
    row.getCell(1).font = { bold: true, size: 10 };
  }

  sum.addRow([]);
  const katHead = sum.addRow(["Rekap per Kategori", "Jumlah / Durasi"]);
  katHead.font = { bold: true, color: { argb: NAVY } };
  katHead.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEAD_BG } };
  });

  for (const k of recapByKategori(reports)) {
    sum.addRow([k.kategori, `${k.jumlah} kegiatan · ${k.jam ? pluralJam(k.jam) : "-"} · ${k.porsi.toFixed(1)}%`]);
  }

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${exportFilename("xlsx")}"`,
    },
  });
}
