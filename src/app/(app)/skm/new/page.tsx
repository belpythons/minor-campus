import { PageHeader } from "@/components/shared/page-header";
import { SkmForm } from "@/components/skm/skm-form";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Tambah Kegiatan SKM" };
export const dynamic = "force-dynamic";

export default async function NewSkmPage() {
  const { user } = await requireSession();

  return (
    <>
      <PageHeader
        title="Tambah Kegiatan SKM"
        description="Catat prestasi, organisasi, sertifikasi, kepanitiaan, atau pelatihan."
        back={{ href: "/skm", label: "Daftar SKM" }}
      />
      <SkmForm userId={user.id} />
    </>
  );
}
