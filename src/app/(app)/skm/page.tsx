import Link from "next/link";
import { ClipboardCopy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SkmProgress } from "@/components/skm/skm-progress";
import { SkmList } from "@/components/skm/skm-list";
import { requireSession } from "@/lib/session";
import type { SkmActivity } from "@/lib/types";

export const metadata = { title: "Daftar SKM" };
export const dynamic = "force-dynamic";

export default async function SkmPage() {
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("skm_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("tanggal_mulai", { ascending: false });

  const activities = (data ?? []) as SkmActivity[];
  const totalPoin = activities.reduce((s, a) => s + (a.poin_skm ?? 0), 0);
  const countByKategori = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.kategori] = (acc[a.kategori] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Satuan Kegiatan Mahasiswa"
        description="Track record prestasi, organisasi, sertifikasi, kepanitiaan, dan pelatihan."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/skm/linkedin">
                <ClipboardCopy aria-hidden />
                LinkedIn
              </Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/skm/new">
                <Plus aria-hidden />
                Tambah Kegiatan
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <SkmProgress totalPoin={totalPoin} countByKategori={countByKategori} />
        <SkmList activities={activities} />
      </div>
    </>
  );
}
