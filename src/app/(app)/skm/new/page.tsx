import { PageHeader } from "@/components/shared/page-header";
import { SkmForm } from "@/components/skm/skm-form";
import { requireSession } from "@/lib/session";
import { fetchActivePersona } from "@/lib/skm-preset";

export const metadata = { title: "Tambah Kegiatan SKM" };
export const dynamic = "force-dynamic";

export default async function NewSkmPage() {
  const { supabase, user } = await requireSession();
  const { preset, rules } = await fetchActivePersona(supabase, user.id);

  return (
    <>
      <PageHeader
        title="Tambah Kegiatan SKM"
        description={`Catat prestasi, organisasi, sertifikasi, kepanitiaan, atau pelatihan. Persona: ${preset.nama}.`}
        back={{ href: "/skm", label: "Daftar SKM" }}
      />
      <SkmForm
        userId={user.id}
        rules={rules}
        withJamSosial={preset.target_jam_sosial != null}
      />
    </>
  );
}
