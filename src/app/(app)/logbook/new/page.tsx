import { PageHeader } from "@/components/shared/page-header";
import { LogbookForm } from "@/components/logbook/logbook-form";
import { requireSession } from "@/lib/session";
import { fetchLogbook, fetchSupervisors, nextNomorUrut } from "@/lib/logbook-query";

export const metadata = { title: "Tambah Entri Log Book" };
export const dynamic = "force-dynamic";

export default async function NewLogbookPage() {
  const { supabase, user } = await requireSession();

  const [entries, supervisors] = await Promise.all([
    fetchLogbook(supabase, user.id),
    fetchSupervisors(supabase, user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Tambah Konsultasi / Log Book"
        description="Catat aktivitas kerja praktek dan sesi konsultasi dengan pembimbing lapangan."
        back={{ href: "/logbook", label: "Log Book" }}
      />
      <LogbookForm
        userId={user.id}
        supervisors={supervisors}
        nextNomor={nextNomorUrut(entries)}
        usedNomor={entries.map((e) => e.nomor_urut)}
      />
    </>
  );
}
