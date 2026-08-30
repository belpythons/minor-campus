import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredReports, parseFilters } from "@/lib/report-query";
import { fetchLogbook } from "@/lib/logbook-query";
import { fetchActiveProjects } from "@/lib/project-query";
import {
  LOGBOOK_EXPORT_HEADERS,
  buildCsv,
  buildCsvFromRows,
  exportFilename,
  toLogbookExportRow,
} from "@/lib/export";
import { fetchLetterhead } from "@/lib/letterhead";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(request.url);

  // Audit P2-2: export log book — dataset kedua di route yang sama.
  if (url.searchParams.get("dataset") === "logbook") {
    const [entries, projects] = await Promise.all([
      fetchLogbook(supabase, user.id),
      fetchActiveProjects(supabase, user.id),
    ]);
    const byId = new Map(projects.map((p) => [p.id, p.judul]));
    const csv = buildCsvFromRows(
      LOGBOOK_EXPORT_HEADERS,
      entries.map((e) => toLogbookExportRow(e, e.project_id ? byId.get(e.project_id) ?? "" : "")),
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportFilename("csv", "log-book")}"`,
      },
    });
  }

  const filters = parseFilters(url.searchParams);
  const [reports, letterhead] = await Promise.all([
    fetchFilteredReports(supabase, user.id, filters),
    fetchLetterhead(supabase, user.id),
  ]);

  return new NextResponse(buildCsv(reports), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename("csv", letterhead.exportFilePrefix)}"`,
    },
  });
}
