import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/layout/profile-form";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Profil & Pengesahan" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { user, profile } = await requireSession();

  return (
    <>
      <PageHeader
        title="Profil & Pengesahan"
        description="Data di sini mengisi kop surat dan blok tanda tangan pada kedua dokumen cetak."
      />
      <ProfileForm userId={user.id} email={user.email ?? ""} initial={profile} />
    </>
  );
}
