import type { SkmActivity } from "./types";
import { formatBulanSingkat, formatTanggal } from "./format";
import { aggregateSkm } from "./skm-aggregate";
import { ORG } from "./constants";

export type LinkedInSection = "experience" | "certification" | "award";

export const LINKEDIN_SECTIONS: { value: LinkedInSection; label: string; hint: string }[] = [
  {
    value: "experience",
    label: "Experience / Leadership",
    hint: "Untuk Pengalaman Organisasi & Kepanitiaan Event.",
  },
  {
    value: "certification",
    label: "Licenses & Certifications",
    hint: "Untuk Sertifikasi / Lisensi dan Workshop bersertifikat.",
  },
  {
    value: "award",
    label: "Honors & Awards",
    hint: "Untuk Prestasi / Kejuaraan.",
  },
];

/** The section that best fits an entry's SKM category. */
export function defaultSectionFor(kategori: string): LinkedInSection {
  if (kategori.startsWith("Prestasi")) return "award";
  if (kategori.startsWith("Sertifikasi")) return "certification";
  return "experience";
}

function skillsLine(tags?: string[] | null): string {
  const list = (tags ?? []).map((t) => t.replace(/^#/, "").trim()).filter(Boolean);
  return list.length ? `Skills: ${list.join(" · ")}` : "";
}

/** Renders deskripsi as "• " bullets, one per non-empty line. */
function bullets(deskripsi?: string | null): string {
  const lines = (deskripsi ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  return lines.map((l) => `• ${l}`).join("\n");
}

function dateRange(a: SkmActivity): string {
  const mulai = formatBulanSingkat(a.tanggal_mulai);
  const selesai = a.tanggal_selesai ? formatBulanSingkat(a.tanggal_selesai) : "Sekarang";
  return `${mulai} - ${selesai}`;
}

/**
 * Text blocks ready to paste into LinkedIn.
 * Layout follows modul-skm/03-FITUR-LINKEDIN-ASSISTANT.md exactly.
 */
export function formatForLinkedIn(a: SkmActivity, section: LinkedInSection): string {
  const skills = skillsLine(a.skill_tags);

  if (section === "experience") {
    const lines = [
      `Title: ${a.judul}`,
      `Company: ${a.penyelenggara}`,
      `Dates: ${dateRange(a)}`,
    ];
    const body = bullets(a.deskripsi);
    if (body) lines.push("Description:", body);
    if (skills) lines.push("", skills);
    return lines.join("\n");
  }

  if (section === "certification") {
    const lines = [
      `Name: ${a.judul}`,
      `Issuing Organization: ${a.penyelenggara}`,
      `Issue Date: ${formatTanggal(a.tanggal_mulai).replace(/^\d+\s/, "")}`,
    ];
    if (a.credential_id) lines.push(`Credential ID: ${a.credential_id}`);
    if (a.certificate_url) lines.push(`Credential URL: ${a.certificate_url}`);
    if (skills) lines.push("", skills);
    return lines.join("\n");
  }

  const lines = [
    `Title: ${a.judul}`,
    `Associated with: ${ORG.kampus}`,
    `Issuer: ${a.penyelenggara}`,
    `Issue Date: ${formatTanggal(a.tanggal_mulai).replace(/^\d+\s/, "")}`,
  ];
  if (a.deskripsi?.trim()) lines.push("Description:", a.deskripsi.trim());
  if (skills) lines.push("", skills);
  return lines.join("\n");
}

/** Whole-portfolio Markdown summary — for a personal GitHub README. */
export function portfolioMarkdown(activities: SkmActivity[], nama: string): string {
  const total = aggregateSkm(activities).totalRaw;
  const out: string[] = [
    `# Portofolio Kegiatan — ${nama}`,
    "",
    `Total **${activities.length}** kegiatan · **${total}** poin SKM.`,
    "",
  ];

  const byKategori = new Map<string, SkmActivity[]>();
  for (const a of activities) {
    const list = byKategori.get(a.kategori) ?? [];
    list.push(a);
    byKategori.set(a.kategori, list);
  }

  for (const [kategori, list] of byKategori) {
    out.push(`## ${kategori}`, "");
    for (const a of list) {
      out.push(`### ${a.judul}`);
      out.push(`*${a.penyelenggara} · ${dateRange(a)}*`);
      if (a.deskripsi?.trim()) out.push("", a.deskripsi.trim());
      const tags = (a.skill_tags ?? []).filter(Boolean);
      if (tags.length) out.push("", `\`${tags.join("` `")}\``);
      if (a.certificate_url) out.push("", `[Lihat sertifikat](${a.certificate_url})`);
      out.push("");
    }
  }

  return out.join("\n").trimEnd() + "\n";
}
