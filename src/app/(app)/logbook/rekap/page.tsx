import Link from "next/link";
import { NotebookPen, Plus, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ParafBadge } from "@/components/logbook/logbook-table";
import { requireSession } from "@/lib/session";
import { fetchLogbook, fetchSupervisors } from "@/lib/logbook-query";
import { formatTanggal } from "@/lib/format";
import { FadeIn } from "@/components/motion/motion-primitives";

export const metadata = { title: "Rekap Konsultasi" };
export const dynamic = "force-dynamic";

export default async function RekapKonsultasiPage() {
  const { supabase, user } = await requireSession();

  const [supervisors, entries] = await Promise.all([
    fetchSupervisors(supabase, user.id),
    fetchLogbook(supabase, user.id),
  ]);

  const groups = supervisors
    .map((s) => ({
      supervisor: s,
      items: entries
        .filter((e) => e.supervisor_id === s.id)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length);

  return (
    <>
      <PageHeader
        title="Rekap Konsultasi per Atasan"
        description="Riwayat berapa kali dan kapan Anda berkonsultasi dengan setiap pembimbing."
        back={{ href: "/logbook", label: "Log Book" }}
      />

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="Belum ada konsultasi yang tercatat"
            description="Tambahkan entri log book dan pilih pembimbingnya untuk melihat rekap per atasan di sini."
            action={
              <Button asChild variant="gradient">
                <Link href="/logbook/new">
                  <Plus aria-hidden />
                  Tambah Entri
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(({ supervisor, items }, i) => {
            const verified = items.filter((x) => x.paraf_status).length;
            return (
              <FadeIn key={supervisor.id} delay={i * 0.05}>
                <Card className="overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{supervisor.nama}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {[supervisor.jabatan, supervisor.departemen].filter(Boolean).join(" · ") ||
                          "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{items.length} konsultasi</Badge>
                      <Badge variant={verified === items.length ? "success" : "warning"}>
                        {verified} di-paraf
                      </Badge>
                      <Button asChild variant="outline" size="xs">
                        <Link href={`/print/formulir2?pembimbing=${supervisor.id}`} target="_blank">
                          <Printer aria-hidden />
                          Cetak Formulir 2
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* --- Mobile list --- */}
                  <ul className="divide-y divide-border lg:hidden">
                    {items.map((e) => (
                      <li key={e.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[11.5px] font-semibold text-muted-foreground">
                            {formatTanggal(e.tanggal)}
                          </p>
                          <ParafBadge ok={e.paraf_status} />
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed">
                          {e.aktivitas_pekerjaan}
                        </p>
                        {e.hasil_tindak_lanjut && (
                          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                            <span className="font-semibold">Tindak lanjut:</span>{" "}
                            {e.hasil_tindak_lanjut}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* --- Desktop table --- */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-40">Tanggal</TableHead>
                          <TableHead>Topik Konsultasi</TableHead>
                          <TableHead className="w-36">Status Paraf</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatTanggal(e.tanggal)}
                            </TableCell>
                            <TableCell>
                              <p className="whitespace-pre-line leading-relaxed">
                                {e.aktivitas_pekerjaan}
                              </p>
                              {e.hasil_tindak_lanjut && (
                                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                                  <span className="font-semibold">Tindak lanjut:</span>{" "}
                                  {e.hasil_tindak_lanjut}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <ParafBadge ok={e.paraf_status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      )}
    </>
  );
}
