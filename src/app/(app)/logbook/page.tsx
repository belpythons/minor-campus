import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, FolderKanban, Plus, Printer, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { LogbookTable } from "@/components/logbook/logbook-table";
import { Stagger } from "@/components/motion/motion-primitives";
import { requireSession } from "@/lib/session";
import { fetchLogbook, fetchSupervisors } from "@/lib/logbook-query";
import { fetchLetterhead } from "@/lib/letterhead";
import { fetchActiveProjects } from "@/lib/project-query";

export const metadata = { title: "Log Book" };
export const dynamic = "force-dynamic";

export default async function LogbookPage() {
  const { supabase, user } = await requireSession();

  const [entries, supervisors, letterhead, projects] = await Promise.all([
    fetchLogbook(supabase, user.id),
    fetchSupervisors(supabase, user.id),
    fetchLetterhead(supabase, user.id),
    fetchActiveProjects(supabase, user.id),
  ]);

  const diparaf = entries.filter((e) => e.paraf_status).length;

  return (
    <>
      <PageHeader
        title="Log Book Kegiatan & Konsultasi"
        description={`Formulir 2 · ${letterhead.kodeSop}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/logbook/projects">
                <FolderKanban aria-hidden />
                Proyek
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/print/formulir2" target="_blank">
                <Printer aria-hidden />
                Cetak Formulir 2
              </Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/logbook/new">
                <Plus aria-hidden />
                Tambah Entri
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard value={entries.length} label="Total Entri" icon={<BookOpen />} />
          <StatCard value={diparaf} label="Sudah Di-paraf" icon={<CheckCircle2 />} tone="success" />
          <StatCard
            value={entries.length - diparaf}
            label="Menunggu Paraf"
            icon={<Clock />}
            tone="warning"
          />
          <StatCard
            value={supervisors.length}
            label="Pembimbing Terdaftar"
            icon={<Users />}
            tone="navy"
          />
        </Stagger>

        <LogbookTable entries={entries} supervisors={supervisors} projects={projects} />
      </div>
    </>
  );
}
