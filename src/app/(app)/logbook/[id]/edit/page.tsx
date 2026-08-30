import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { LogbookForm } from "@/components/logbook/logbook-form";
import { requireSession } from "@/lib/session";
import { fetchLogbook, fetchSupervisors } from "@/lib/logbook-query";
import type { LogbookEntry } from "@/lib/types";

export const metadata = { title: "Ubah Entri Log Book" };
export const dynamic = "force-dynamic";

export default async function EditLogbookPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireSession();

  const [{ data }, supervisors, entries] = await Promise.all([
    supabase
      .from("logbook_entries")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    fetchSupervisors(supabase, user.id),
    fetchLogbook(supabase, user.id),
  ]);

  if (!data) notFound();
  const entry = data as LogbookEntry;

  return (
    <>
      <PageHeader
        title="Ubah Entri Log Book"
        description={`Entri No. ${entry.nomor_urut} · ${entry.pembimbing_nama}`}
        back={{ href: "/logbook", label: "Log Book" }}
      />
      <LogbookForm
        userId={user.id}
        supervisors={supervisors}
        nextNomor={entry.nomor_urut}
        usedNomor={entries.map((e) => e.nomor_urut)}
        initial={entry}
      />
    </>
  );
}
