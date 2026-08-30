"use server";

import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { ValidationError, vInt, vRequiredStr } from "@/lib/validate";

export interface LetterheadInput {
  kop_baris: string[];
  judul_dokumen: string;
  kampus_upper: string;
  prodi_upper: string;
  formulir_title: string;
  kode_sop: string;
  lokasi_ttd: string;
  logo_url: string | null;
  logo_versi: number;
}

export type ActionResult = { ok: true } | { error: string };

export async function saveLetterhead(input: LetterheadInput): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk kembali." };

  let payload;
  try {
    const kopBaris = Array.isArray(input.kop_baris)
      ? input.kop_baris.map((b) => (typeof b === "string" ? b.trim() : "")).filter(Boolean)
      : [];
    if (kopBaris.length < 1 || kopBaris.length > 4) {
      throw new ValidationError("Kop dokumen harus terdiri dari 1 sampai 4 baris.");
    }
    if (kopBaris.some((b) => b.length > 200)) {
      throw new ValidationError("Tiap baris kop maksimal 200 karakter.");
    }

    let logoUrl: string | null = null;
    if (input.logo_url != null) {
      const ownPrefix = `${SUPABASE_URL}/storage/v1/object/public/org-logos/${user.id}/`;
      if (typeof input.logo_url !== "string" || !input.logo_url.startsWith(ownPrefix)) {
        throw new ValidationError("URL logo tidak valid.");
      }
      logoUrl = input.logo_url;
    }

    payload = {
      user_id: user.id,
      kop_baris: kopBaris,
      judul_dokumen: vRequiredStr(input.judul_dokumen, "Judul dokumen", 160),
      kampus_upper: vRequiredStr(input.kampus_upper, "Nama kampus", 160),
      prodi_upper: vRequiredStr(input.prodi_upper, "Program studi", 160),
      formulir_title: vRequiredStr(input.formulir_title, "Judul formulir", 160),
      kode_sop: vRequiredStr(input.kode_sop, "Kode SOP", 60),
      lokasi_ttd: vRequiredStr(input.lokasi_ttd, "Lokasi tanda tangan", 120),
      logo_url: logoUrl,
      logo_versi: vInt(input.logo_versi, "Versi logo", { min: 0, max: 1000000 }),
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message };
    throw err;
  }

  const { error } = await supabase
    .from("letterhead_settings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return { error: error.message };
  return { ok: true };
}

/** Kembali ke identitas bawaan Badak NGL/STITEK: hapus baris setelan. */
export async function resetLetterhead(): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk kembali." };

  const { error } = await supabase
    .from("letterhead_settings")
    .delete()
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { ok: true };
}
