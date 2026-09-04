import { PageHeader } from "@/components/shared/page-header";
import { LinkedInAssistant } from "@/components/skm/linkedin-assistant";
import { displayName, requireSession } from "@/lib/session";
import type { SkmActivity } from "@/lib/types";

export const metadata = { title: "LinkedIn Assistant" };
export const dynamic = "force-dynamic";

export default async function LinkedInPage() {
  const { supabase, user, profile } = await requireSession();

  const { data } = await supabase
    .from("skm_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("tanggal_mulai", { ascending: false });

  return (
    <>
      <PageHeader
        title="LinkedIn & Resume Assistant"
        description="Ubah riwayat kegiatan menjadi teks profesional siap-paste ke LinkedIn atau CV."
        back={{ href: "/skm", label: "Daftar SKM" }}
      />
      <LinkedInAssistant
        activities={(data ?? []) as SkmActivity[]}
        nama={displayName(profile, user.email)}
      />
    </>
  );
}
