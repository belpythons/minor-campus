import { PageHeader } from "@/components/shared/page-header";
import { ExportPanel } from "./export-panel";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Ekspor / Rekap" };
export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const { supabase, user } = await requireSession();

  // Only the bounds are needed here, not the rows — keeps the payload tiny.
  const [{ data: first }, { data: last }, { count }] = await Promise.all([
    supabase
      .from("internship_reports")
      .select("tanggal")
      .eq("user_id", user.id)
      .order("tanggal", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("internship_reports")
      .select("tanggal")
      .eq("user_id", user.id)
      .order("tanggal", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("internship_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Ekspor & Rekap Laporan Magang"
        description="Cetak dokumen resmi PT Badak NGL atau unduh data mentah untuk diolah di spreadsheet."
        back={{ href: "/reports", label: "Laporan Saya" }}
      />
      <ExportPanel
        earliest={first?.tanggal ?? null}
        latest={last?.tanggal ?? null}
        totalReports={count ?? 0}
      />
    </>
  );
}
