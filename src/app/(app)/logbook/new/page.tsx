import { PageHeader } from "@/components/shared/page-header";
import { LogbookForm } from "@/components/logbook/logbook-form";
import { requireSession } from "@/lib/session";
import { fetchLogbook, fetchSupervisors, nextNomorUrut } from "@/lib/logbook-query";
import { fetchActiveProjects } from "@/lib/project-query";

export const metadata = { title: "Tambah Entri Log Book" };
export const dynamic = "force-dynamic";

export default async function NewLogbookPage({
  searchParams,
}: {
  searchParams: { project?: string };
}) {
  const { supabase, user } = await requireSession();

  const [entries, supervisors, projects] = await Promise.all([
    fetchLogbook(supabase, user.id),
    fetchSupervisors(supabase, user.id),
    fetchActiveProjects(supabase, user.id),
  ]);

  const defaultProjectId =
    projects.find((p) => p.id === searchParams.project)?.id ?? null;

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
        projects={projects}
        defaultProjectId={defaultProjectId}
      />
    </>
  );
}
