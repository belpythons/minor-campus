import { AppShell } from "@/components/layout/app-shell";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { displayName, requireSession } from "@/lib/session";
import { ORG } from "@/lib/constants";
import { fetchLetterhead } from "@/lib/letterhead";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireSession();
  const letterhead = await fetchLetterhead(supabase, user.id);

  return (
    <AppShell
      nama={displayName(profile, user.email)}
      instansi={profile?.instansi || ORG.kampus}
      logoSrc={letterhead.logoSrc}
      subtitle={letterhead.appSubtitle}
    >
      <div id="konten-utama">{children}</div>
      <InstallPrompt />
    </AppShell>
  );
}
