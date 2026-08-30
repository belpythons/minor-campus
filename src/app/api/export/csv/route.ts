import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredReports, parseFilters } from "@/lib/report-query";
import { buildCsv, exportFilename } from "@/lib/export";
import { fetchLetterhead } from "@/lib/letterhead";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const filters = parseFilters(new URL(request.url).searchParams);
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
