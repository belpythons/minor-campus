import { AppShell } from "@/components/layout/app-shell";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { displayName, requireSession } from "@/lib/session";
import { ORG } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireSession();

  return (
    <AppShell nama={displayName(profile, user.email)} instansi={profile?.instansi || ORG.kampus}>
      <div id="konten-utama">{children}</div>
      <InstallPrompt />
    </AppShell>
  );
}
