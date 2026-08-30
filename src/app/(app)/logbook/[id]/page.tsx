import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderKanban, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ParafBadge } from "@/components/logbook/logbook-table";
import { requireSession } from "@/lib/session";
import { formatHariTanggal, formatTanggal } from "@/lib/format";
import { FadeIn } from "@/components/motion/motion-primitives";
import type { Advice, LogbookEntry, Project } from "@/lib/types";

export const metadata = { title: "Detail Entri Log Book" };
export const dynamic = "force-dynamic";

function Section({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground">
        {value}
      </dd>
    </div>
  );
}

export default async function LogbookDetailPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("logbook_entries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) notFound();
  const entry = data as LogbookEntry;

  const [{ data: projectRow }, { data: adviceRows }] = await Promise.all([
    entry.project_id
      ? supabase.from("projects").select("*").eq("id", entry.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("advice").select("*").eq("entry_id", entry.id).order("created_at"),
  ]);
  const project = (projectRow ?? null) as Project | null;
  const advice = (adviceRows ?? []) as Advice[];

  return (
    <>
      <PageHeader
        title={`Entri No. ${entry.nomor_urut}`}
        description={formatHariTanggal(entry.tanggal)}
        back={{ href: "/logbook", label: "Log Book" }}
        actions={
          <Button asChild variant="gradient">
            <Link href={`/logbook/${entry.id}/edit`}>
              <Pencil aria-hidden />
              Ubah Entri
            </Link>
          </Button>
        }
      />

      <FadeIn>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <ParafBadge ok={entry.paraf_status} />
              {project && (
                <Button asChild variant="outline" size="xs">
                  <Link href={`/logbook/projects/${project.id}`}>
                    <FolderKanban aria-hidden />
                    {project.judul}
                  </Link>
                </Button>
              )}
            </div>

            <dl className="space-y-4">
              <Section label="Aktivitas Pekerjaan / Topik Konsultasi" value={entry.aktivitas_pekerjaan} />
              <Section label="Hasil & Tindak Lanjut" value={entry.hasil_tindak_lanjut} />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Pembimbing Lapangan
                </dt>
                <dd className="mt-1 text-[13.5px] text-foreground">
                  {entry.pembimbing_nama}
                  {entry.pembimbing_jabatan && (
                    <span className="text-muted-foreground"> · {entry.pembimbing_jabatan}</span>
                  )}
                </dd>
              </div>
              <Section
                label="Terakhir diubah"
                value={entry.updated_at ? formatTanggal(entry.updated_at.slice(0, 10)) : null}
              />
            </dl>

            {advice.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Saran yang lahir dari sesi ini ({advice.length})
                </p>
                <ul className="mt-2 space-y-2">
                  {advice.map((a) => (
                    <li key={a.id} className="rounded-md border border-border p-2.5 text-[13px]">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <b>{a.area}</b>
                        <Badge variant="outline">{a.status}</Badge>
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">{a.isi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </>
  );
}
