import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Current user + profile, redirecting to /login when signed out. */
export async function requireSession() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: (profile ?? null) as Profile | null };
}

/** Current user + profile without redirecting. */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: (profile ?? null) as Profile | null };
}

/** Display name fallback chain. */
export function displayName(profile: Profile | null, email?: string | null) {
  return profile?.nama_lengkap || email?.split("@")[0] || "Pengguna";
}
