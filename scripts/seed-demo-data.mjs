/**
 * Inserts a handful of demo reports + logbook rows for the test account so the
 * recap and Formulir 2 print views can be verified with real content.
 *   node scripts/seed-demo-data.mjs
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

const { data: list } = await admin.auth.admin.listUsers();
const user = list.users.find((u) => u.email === "belva.test@stitek.local");
if (!user) { console.error("test user missing — run seed-test-user.mjs first"); process.exit(1); }
const uid = user.id;

const reports = [
  ["2026-07-06", "07:30", "16:00", "Pekerjaan Utama", "Setup Environment & Orientasi Sistem IT", "Instalasi tooling dan pengenalan arsitektur aplikasi internal.", "Environment siap dipakai.", null],
  ["2026-07-07", "08:00", "15:30", "Meeting/Diskusi", "Meeting SHE-Q Safety Man Hour", "Diskusi prosedur perhitungan safety man hour untuk PKWTT & tamu Zone 1.", "Notulen dan rumus perhitungan disepakati.", "Data historis 2024 belum lengkap."],
  ["2026-07-08", "07:30", "16:00", "Belajar/Training", "Diskusi Rencana Automasi Daily Report", "Mempelajari struktur data laporan harian existing.", "Draft rancangan automasi.", null],
  ["2026-08-03", "07:30", "16:00", "Pekerjaan Utama", "Pengembangan Modul Rekap Laporan", "Implementasi agregasi statistik dan halaman cetak A4.", "Modul rekap berjalan di staging.", null],
  ["2026-08-15", "08:00", "12:00", "Kunjungan Lapangan", "Kunjungan ke Ruang Server Pabrik Zona 2", "Peninjauan infrastruktur jaringan dan rack server.", "Dokumentasi foto dan catatan topologi.", "Akses zona terbatas, perlu izin SHE."],
  ["2026-08-20", "07:30", "16:00", "Dokumentasi", "Penyusunan Handover Documentation", "Menyusun dokumen serah terima aplikasi.", "Draft handover selesai.", null],
];

const { error: e1 } = await admin.from("internship_reports").insert(
  reports.map(([tanggal, jam_mulai, jam_selesai, kategori, judul, deskripsi, output, kendala]) => ({
    user_id: uid, tanggal, jam_mulai, jam_selesai, kategori, judul, deskripsi, output, kendala,
  })),
);
if (e1) { console.error("reports:", e1.message); process.exit(1); }

const { data: sup, error: e2 } = await admin.from("supervisors").insert([
  { user_id: uid, nama: "Rizky Ramadhan", jabatan: "Senior Specialist SHE-Q", departemen: "SHE-Q" },
  { user_id: uid, nama: "Saleh Nurdin", jabatan: "Superintendent IT Planning", departemen: "IT" },
]).select();
if (e2) { console.error("supervisors:", e2.message); process.exit(1); }

const [rizky, saleh] = sup;
const entries = [
  [1, "2026-07-07", "Meeting SHE-Q: pembahasan prosedur perhitungan Safety Man Hour untuk PKWTT & tamu Zone 1.", rizky, true, "Rumus disepakati, menunggu data historis 2024."],
  [2, "2026-07-08", "Diskusi rencana automasi Daily Report Departemen IT.", saleh, true, "Disetujui untuk lanjut ke tahap prototipe."],
  [3, "2026-08-03", "Konsultasi rancangan modul rekap laporan dan format cetak A4.", saleh, true, "Layout kop surat mengikuti standar perusahaan."],
  [4, "2026-08-15", "Review hasil kunjungan ruang server Zona 2 dan catatan topologi jaringan.", rizky, false, "Menunggu verifikasi dokumen SHE."],
];

const { error: e3 } = await admin.from("logbook_entries").insert(
  entries.map(([nomor_urut, tanggal, aktivitas_pekerjaan, s, paraf_status, hasil_tindak_lanjut]) => ({
    user_id: uid, nomor_urut, tanggal, aktivitas_pekerjaan,
    supervisor_id: s.id, pembimbing_nama: s.nama, pembimbing_jabatan: s.jabatan,
    paraf_status, hasil_tindak_lanjut,
  })),
);
if (e3) { console.error("logbook:", e3.message); process.exit(1); }

const { error: e4 } = await admin.from("profiles").update({
  pembimbing_nama: "Saleh Nurdin",
  pembimbing_jabatan: "Superintendent IT Planning",
  lokasi_ttd: "Bontang",
  periode_mulai: "2026-07-06",
  periode_selesai: "2026-08-28",
}).eq("id", uid);
if (e4) { console.error("profile:", e4.message); process.exit(1); }

console.log(`seeded ${reports.length} reports, 2 supervisors, ${entries.length} logbook entries`);
