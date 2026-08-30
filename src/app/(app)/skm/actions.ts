"use server";

import { createClient } from "@/lib/supabase/server";
import { SKM_KATEGORI } from "@/lib/constants";
import {
  ValidationError,
  vDate,
  vEnum,
  vInt,
  vOptionalDate,
  vOptionalStr,
  vRequiredStr,
  vTags,
} from "@/lib/validate";

export interface SkmActivityInput {
  id?: string;
  judul: string;
  kategori: string;
  penyelenggara: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  poin_skm: number;
  deskripsi: string | null;
  skill_tags: string[] | null;
  certificate_url: string | null;
  credential_id: string | null;
}

export type ActionResult = { ok: true } | { error: string };

const KATEGORI_VALUES = SKM_KATEGORI.map((k) => k.value);

/** Create (no id) or update (with id) an SKM activity, validated server-side. */
export async function saveSkmActivity(input: SkmActivityInput): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk kembali." };

  let payload;
  try {
    const tanggalMulai = vDate(input.tanggal_mulai, "Tanggal mulai");
    const tanggalSelesai = vOptionalDate(input.tanggal_selesai, "Tanggal selesai");
    if (tanggalSelesai && tanggalSelesai < tanggalMulai) {
      throw new ValidationError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
    }
    payload = {
      user_id: user.id,
      judul: vRequiredStr(input.judul, "Judul kegiatan"),
      kategori: vEnum(input.kategori, "Kategori", KATEGORI_VALUES),
      penyelenggara: vRequiredStr(input.penyelenggara, "Penyelenggara"),
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      poin_skm: vInt(input.poin_skm, "Poin SKM", { min: 0, max: 100000 }),
      deskripsi: vOptionalStr(input.deskripsi, "Deskripsi", 10000),
      skill_tags: vTags(input.skill_tags),
      certificate_url: vOptionalStr(input.certificate_url, "URL sertifikat", 2000),
      credential_id: vOptionalStr(input.credential_id, "Credential ID", 120),
    };
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message };
    throw err;
  }

  const { error } = input.id
    ? await supabase
        .from("skm_activities")
        .update(payload)
        .eq("id", input.id)
        .eq("user_id", user.id)
    : await supabase.from("skm_activities").insert(payload);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteSkmActivity(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk kembali." };

  const { error } = await supabase
    .from("skm_activities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { ok: true };
}
