import { PageHeader } from "@/components/shared/page-header";
import { ReportForm } from "@/components/reports/report-form";
import { requireSession } from "@/lib/session";
import { fetchLetterhead } from "@/lib/letterhead";

export const metadata = { title: "Buat Laporan" };
export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const { supabase, user, profile } = await requireSession();
  const letterhead = await fetchLetterhead(supabase, user.id);

  return (
    <>
      <PageHeader
        title="Form Laporan Kegiatan"
        description={`Catat kegiatan magang harian Anda di ${profile?.tempat_kp ?? letterhead.orgNama}.`}
        back={{ href: "/reports", label: "Laporan Saya" }}
      />
      <ReportForm userId={user.id} />
    </>
  );
}
