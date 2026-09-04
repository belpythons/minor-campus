import { CalendarDays, FileText, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ReportTable } from "@/components/reports/report-table";
import { Stagger } from "@/components/motion/motion-primitives";
import { requireSession } from "@/lib/session";
import { todayISO } from "@/lib/format";
import type { ReportWithAuthor } from "@/lib/types";

export const metadata = { title: "Daftar Kegiatan" };
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("internship_reports")
    .select("*, profiles(nama_lengkap, instansi)")
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });

  const reports = (data ?? []) as ReportWithAuthor[];
  const peserta = new Set(reports.map((r) => r.user_id));
  const today = todayISO();
  const hariIni = reports.filter((r) => r.tanggal === today).length;

  return (
    <>
      <PageHeader
        title="Daftar Kegiatan Magang"
        description="Kegiatan seluruh peserta magang. Anda dapat melihat semua laporan, namun hanya bisa mengubah laporan milik sendiri."
      />

      <div className="space-y-4">
        <Stagger className="grid grid-cols-3 gap-3">
          <StatCard value={reports.length} label="Total Laporan" icon={<FileText />} />
          <StatCard value={peserta.size} label="Peserta Magang" icon={<Users />} tone="navy" />
          <StatCard value={hariIni} label="Laporan Hari Ini" icon={<CalendarDays />} tone="success" />
        </Stagger>

        <ReportTable reports={reports} currentUserId={user.id} showPeserta />
      </div>
    </>
  );
}
