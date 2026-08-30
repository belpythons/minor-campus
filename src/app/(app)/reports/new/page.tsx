import { PageHeader } from "@/components/shared/page-header";
import { ReportForm } from "@/components/reports/report-form";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Buat Laporan" };
export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const { user, profile } = await requireSession();

  return (
    <>
      <PageHeader
        title="Form Laporan Kegiatan"
        description={`Catat kegiatan magang harian Anda di ${profile?.tempat_kp ?? "PT Badak NGL"}.`}
        back={{ href: "/reports", label: "Laporan Saya" }}
      />
      <ReportForm userId={user.id} />
    </>
  );
}
