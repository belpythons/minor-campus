/**
 * Creates (or reuses) a confirmed test account for end-to-end verification.
 *   node scripts/seed-test-user.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "belva.test@stitek.local";
const PASSWORD = "Test1234!";

const { data: list } = await admin.auth.admin.listUsers();
const existing = list.users.find((u) => u.email === EMAIL);

if (existing) {
  console.log("reusing", EMAIL, existing.id);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      nama_lengkap: "Belva Pranama Sriwibowo",
      nim: "21.02.0001",
      instansi: "Sekolah Tinggi Teknologi Bontang",
      tempat_kp: "PT Badak NGL",
    },
  });
  if (error) { console.error("FAILED:", error.message); process.exit(1); }
  console.log("created", EMAIL, data.user.id);
}
