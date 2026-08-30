import Link from "next/link";
import { CalendarCheck, Clock, FileText, Layers, Plus, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ReportTable } from "@/components/reports/report-table";
import { Stagger } from "@/components/motion/motion-primitives";
import { requireSession } from "@/lib/session";
import { computeStats } from "@/lib/report-stats";
import type { ReportWithAuthor } from "@/lib/types";

export const metadata = { title: "Laporan Saya" };
export const dynamic = "force-dynamic";

export default async function MyReportsPage() {
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("internship_reports")
    .select("*, profiles(nama_lengkap, instansi)")
    .eq("user_id", user.id)
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });

  const reports = (data ?? []) as ReportWithAuthor[];
  const stats = computeStats(reports);

  return (
    <>
      <PageHeader
        title="Laporan Saya"
        description="Seluruh laporan kegiatan magang yang Anda buat."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/reports/export">
                <Printer aria-hidden />
                Ekspor
              </Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/reports/new">
                <Plus aria-hidden />
                Buat Laporan
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard value={stats.totalLaporan} label="Laporan Kegiatan" icon={<FileText />} />
          <StatCard value={stats.hariAktif} label="Hari Aktif" icon={<CalendarCheck />} tone="navy" />
          <StatCard
            value={stats.totalJam}
            decimals={1}
            label="Total Jam Kegiatan"
            detail={stats.rataPerHari ? `${stats.rataPerHari.toFixed(1)} jam / hari aktif` : undefined}
            icon={<Clock />}
          />
          <StatCard
            value={stats.jenisKategori}
            label="Jenis Kategori"
            detail={stats.kategoriTerbanyak ?? undefined}
            icon={<Layers />}
            tone="navy"
          />
        </Stagger>

        <ReportTable reports={reports} currentUserId={user.id} />
      </div>
    </>
  );
}
