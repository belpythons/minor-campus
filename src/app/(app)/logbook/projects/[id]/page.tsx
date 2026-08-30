import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileText, Pencil, Plus, Printer, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/logbook/project-form";
import { AdvisorPicker } from "@/components/logbook/advisor-picker";
import { AdviceBoard } from "@/components/logbook/advice-board";
import { requireSession } from "@/lib/session";
import { fetchProjectDetail } from "@/lib/project-query";
import { fetchSupervisors } from "@/lib/logbook-query";
import { formatTanggal } from "@/lib/format";
import { FadeIn } from "@/components/motion/motion-primitives";

export const metadata = { title: "Detail Proyek" };
export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireSession();

  const [detail, supervisors] = await Promise.all([
    fetchProjectDetail(supabase, user.id, params.id),
    fetchSupervisors(supabase, user.id),
  ]);
  if (!detail) notFound();
  const { project, advisors, entries, advice, relations } = detail;

  return (
    <>
      <PageHeader
        title={project.judul}
        description={`${project.jenis}${project.fase ? ` · ${project.fase}` : ""}${
          project.target_tanggal ? ` · target ${formatTanggal(project.target_tanggal)}` : ""
        }`}
        back={{ href: "/logbook/projects", label: "Proyek" }}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/logbook/projects/${project.id}/briefing`}>
                <FileText aria-hidden />
                Briefing Pack
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/print/briefing?project=${project.id}`} target="_blank">
                <Printer aria-hidden />
                Cetak Briefing
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <FadeIn>
          <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="size-4 text-muted-foreground" aria-hidden />
                    Info Proyek
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 text-[13px]">
                    <p>
                      Status: <Badge variant="outline">{project.status}</Badge>
                    </p>
                    {project.deskripsi && (
                      <p className="text-muted-foreground">{project.deskripsi}</p>
                    )}
                    {project.pertanyaan_baru && (
                      <p className="text-muted-foreground">
                        <b className="text-foreground">Pertanyaan berikutnya:</b>{" "}
                        {project.pertanyaan_baru}
                      </p>
                    )}
                  </div>
                  <details className="mt-3">
                    <summary className={buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer list-none [&::-webkit-details-marker]:hidden" })}>
                      <Pencil aria-hidden />
                      Ubah Proyek
                    </summary>
                    <div className="mt-3">
                      <ProjectForm initial={project} />
                    </div>
                  </details>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" aria-hidden />
                    Konsultan Terlibat ({advisors.length})
                  </CardTitle>
                  <CardDescription>
                    Prioritas kecil = lebih otoritatif — dipakai sebagai rekomendasi
                    tie-break saat saran bentrok.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvisorPicker
                    projectId={project.id}
                    supervisors={supervisors}
                    selectedIds={advisors.map((a) => a.id)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
                    Timeline Konsultasi ({entries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {entries.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">
                      Belum ada sesi tercatat untuk proyek ini.
                    </p>
                  ) : (
                    entries.map((e) => (
                      <Link
                        key={e.id}
                        href={`/logbook/${e.id}/edit`}
                        className="block rounded-md border border-border p-2.5 text-[13px] transition-colors hover:border-primary/60"
                      >
                        <span className="font-semibold">{formatTanggal(e.tanggal)}</span>
                        <span className="text-muted-foreground"> · {e.pembimbing_nama}</span>
                        <span className="mt-0.5 block truncate text-muted-foreground">
                          {e.aktivitas_pekerjaan}
                        </span>
                      </Link>
                    ))
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/logbook/new?project=${project.id}`}>
                      <Plus aria-hidden />
                      Catat Sesi Baru
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <AdviceBoard
              projectId={project.id}
              advice={advice}
              relations={relations}
              advisors={advisors.length ? advisors : supervisors}
            />
          </div>
        </FadeIn>
      </div>
    </>
  );
}
