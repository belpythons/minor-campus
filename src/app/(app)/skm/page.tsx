import Link from "next/link";
import { ClipboardCopy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SkmProgress } from "@/components/skm/skm-progress";
import { SkmList } from "@/components/skm/skm-list";
import { PersonaPicker } from "@/components/skm/persona-picker";
import { requireSession } from "@/lib/session";
import { aggregateSkm } from "@/lib/skm-aggregate";
import { fetchActivePersona, fetchAllPresets } from "@/lib/skm-preset";
import type { SkmActivity } from "@/lib/types";

export const metadata = { title: "Daftar SKM" };
export const dynamic = "force-dynamic";

export default async function SkmPage() {
  const { supabase, user } = await requireSession();

  const [{ data }, { preset, rules }, presets] = await Promise.all([
    supabase
      .from("skm_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("tanggal_mulai", { ascending: false }),
    fetchActivePersona(supabase, user.id),
    fetchAllPresets(supabase),
  ]);

  const activities = (data ?? []) as SkmActivity[];
  const agg = aggregateSkm(activities, rules);

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
        {presets.length > 0 && <PersonaPicker presets={presets} active={preset} />}
        <SkmProgress
          totalPoin={agg.totalEfektif}
          countByKategori={agg.countByKategori}
          target={preset.target_poin}
          targetJamSosial={preset.target_jam_sosial}
          totalJamSosial={agg.totalJamSosial}
          perKategori={agg.perKategori}
        />
        <SkmList activities={activities} />
      </div>
    </>
  );
}
