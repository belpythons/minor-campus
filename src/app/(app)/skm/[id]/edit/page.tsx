import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { SkmForm } from "@/components/skm/skm-form";
import { requireSession } from "@/lib/session";
import { fetchActivePersona } from "@/lib/skm-preset";
import type { SkmActivity } from "@/lib/types";

export const metadata = { title: "Ubah Kegiatan SKM" };
export const dynamic = "force-dynamic";

export default async function EditSkmPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("skm_activities")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) notFound();
  const activity = data as SkmActivity;
  const { preset, rules } = await fetchActivePersona(supabase, user.id);

  return (
    <>
      <PageHeader
        title="Ubah Kegiatan SKM"
        description={activity.judul}
        back={{ href: "/skm", label: "Daftar SKM" }}
      />
      <SkmForm
        userId={user.id}
        initial={activity}
        rules={rules}
        withJamSosial={preset.target_jam_sosial != null}
      />
    </>
  );
}
