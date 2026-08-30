import { PageHeader } from "@/components/shared/page-header";
import { SupervisorManager } from "@/components/logbook/supervisor-manager";
import { requireSession } from "@/lib/session";
import { fetchLogbook, fetchSupervisors } from "@/lib/logbook-query";

export const metadata = { title: "Pembimbing" };
export const dynamic = "force-dynamic";

export default async function SupervisorsPage() {
  const { supabase, user } = await requireSession();

  const [supervisors, entries] = await Promise.all([
    fetchSupervisors(supabase, user.id),
    fetchLogbook(supabase, user.id),
  ]);

  const rows = supervisors.map((s) => ({
    ...s,
    jumlahKonsultasi: entries.filter((e) => e.supervisor_id === s.id).length,
  }));

  return (
    <>
      <PageHeader
        title="Pembimbing / Atasan"
        description="Daftar orang berpangkat yang Anda ajak konsultasi selama kerja praktek."
        back={{ href: "/logbook", label: "Log Book" }}
      />
      <SupervisorManager rows={rows} />
    </>
  );
}
