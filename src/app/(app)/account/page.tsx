import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/layout/profile-form";
import { LetterheadForm } from "@/components/layout/letterhead-form";
import { requireSession } from "@/lib/session";
import { fetchLetterheadRow } from "@/lib/letterhead";

export const metadata = { title: "Profil & Pengesahan" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { supabase, user, profile } = await requireSession();
  const letterheadRow = await fetchLetterheadRow(supabase, user.id);

  return (
    <>
      <PageHeader
        title="Profil & Pengesahan"
        description="Data di sini mengisi kop surat dan blok tanda tangan pada kedua dokumen cetak."
      />
      <ProfileForm userId={user.id} email={user.email ?? ""} initial={profile} />
      <LetterheadForm userId={user.id} initial={letterheadRow} />
    </>
  );
}
