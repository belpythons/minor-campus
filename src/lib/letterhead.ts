import type { SupabaseClient } from "@supabase/supabase-js";
import { ORG } from "./constants";

/** Row shape of letterhead_settings (supabase/schema.sql). */
export interface LetterheadSettings {
  user_id: string;
  kop_baris: string[];
  judul_dokumen: string;
  kampus_upper: string;
  prodi_upper: string;
  formulir_title: string;
  kode_sop: string;
  lokasi_ttd: string;
  logo_url: string | null;
  logo_versi: number;
  updated_at: string | null;
}

/** Resolved letterhead — never null; defaults are the legacy ORG identity. */
export interface Letterhead {
  /** 1–4 baris kop rekap; baris pertama dirender sebagai h1. */
  kopBaris: string[];
  judulDokumen: string;
  kampusUpper: string;
  prodiUpper: string;
  formulirTitle: string;
  kodeSop: string;
  lokasiTtd: string;
  /** "/logo.png" bawaan atau URL publik bucket org-logos. */
  logoSrc: string;
  customLogo: boolean;
  /** Nama organisasi untuk teks UI ("dokumen resmi X", fallback tempat KP). */
  orgNama: string;
  /** Subtitle sidebar; default literal existing agar tampilan lama utuh. */
  appSubtitle: string;
  exportFilePrefix: string;
  footerText: string;
}

const DEFAULT_JUDUL = "LAPORAN KEGIATAN MAGANG";
const DEFAULT_PREFIX = "laporan-magang";

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || DEFAULT_PREFIX
  );
}

export const DEFAULT_LETTERHEAD: Letterhead = Object.freeze({
  kopBaris: [ORG.perusahaan, ORG.perusahaanSub],
  judulDokumen: DEFAULT_JUDUL,
  kampusUpper: ORG.kampusUpper,
  prodiUpper: ORG.prodiUpper,
  formulirTitle: ORG.formulirTitle,
  kodeSop: ORG.kodeSop,
  lokasiTtd: ORG.lokasi,
  logoSrc: "/logo.png",
  customLogo: false,
  orgNama: ORG.perusahaanMixed,
  appSubtitle: "STITEK · PT Badak NGL",
  exportFilePrefix: DEFAULT_PREFIX,
  footerText: `Dicetak dari aplikasi Task Report Magang · ${ORG.perusahaanMixed}`,
});

/**
 * Satu pintu identitas kop (dok 03 §2.3): tanpa baris settings hasilnya
 * identik dengan konstanta ORG lama, sehingga output cetak existing tidak
 * berubah sedikit pun.
 */
export function resolveLetterhead(
  settings: LetterheadSettings | null | undefined,
): Letterhead {
  if (!settings) return DEFAULT_LETTERHEAD;

  const kopBaris = (settings.kop_baris ?? [])
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (!kopBaris.length) kopBaris.push(...DEFAULT_LETTERHEAD.kopBaris);

  const judul = settings.judul_dokumen?.trim() || DEFAULT_JUDUL;

  return {
    kopBaris,
    judulDokumen: judul,
    kampusUpper: settings.kampus_upper?.trim() || ORG.kampusUpper,
    prodiUpper: settings.prodi_upper?.trim() || ORG.prodiUpper,
    formulirTitle: settings.formulir_title?.trim() || ORG.formulirTitle,
    kodeSop: settings.kode_sop?.trim() || ORG.kodeSop,
    lokasiTtd: settings.lokasi_ttd?.trim() || ORG.lokasi,
    logoSrc: settings.logo_url || "/logo.png",
    customLogo: Boolean(settings.logo_url),
    orgNama: kopBaris[0],
    appSubtitle: `${settings.kampus_upper?.trim() || ORG.kampusUpper} · ${kopBaris[0]}`,
    // Filename hanya berubah bila judul benar-benar diganti — pengguna yang
    // cuma mengunggah logo tetap mendapat nama file lama.
    exportFilePrefix: judul === DEFAULT_JUDUL ? DEFAULT_PREFIX : slugify(judul),
    footerText: `Dicetak dari aplikasi Task Report Magang · ${kopBaris[0]}`,
  };
}

export async function fetchLetterheadRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<LetterheadSettings | null> {
  const { data } = await supabase
    .from("letterhead_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data ?? null) as LetterheadSettings | null;
}

export async function fetchLetterhead(
  supabase: SupabaseClient,
  userId: string,
): Promise<Letterhead> {
  return resolveLetterhead(await fetchLetterheadRow(supabase, userId));
}
