import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ReportForm } from "@/components/reports/report-form";
import { requireSession } from "@/lib/session";
import type { InternshipReport } from "@/lib/types";

export const metadata = { title: "Ubah Laporan" };
export const dynamic = "force-dynamic";

export default async function EditReportPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("internship_reports")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) notFound();
  const report = data as InternshipReport;

  return (
    <>
      <PageHeader
        title="Ubah Laporan Kegiatan"
        description={report.judul}
        back={{ href: `/reports/${report.id}`, label: "Detail laporan" }}
      />
      <ReportForm userId={user.id} initial={report} />
    </>
  );
}
