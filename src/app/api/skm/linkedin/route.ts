import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import {
  DAILY_GENERATION_LIMIT,
  LINKEDIN_AI_BAHASA,
  LINKEDIN_AI_SECTIONS,
  buildInputHash,
  buildPrompt,
  buildRetrievalQuery,
  type LinkedInAiBahasa,
  type LinkedInAiSection,
} from "@/lib/linkedin-ai";
import type { SkmActivity } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMBED_MODEL = "gemini-embedding-001";
const GEN_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const TIMEOUT_MS = 20_000;

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
    ),
  ]);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Fitur AI belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sesi berakhir." }, { status: 401 });
  }

  let body: { activity_id?: string; seksi?: string; bahasa?: string; force?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const seksi = body.seksi as LinkedInAiSection;
  const bahasa = (body.bahasa ?? "id") as LinkedInAiBahasa;
  if (
    typeof body.activity_id !== "string" ||
    !LINKEDIN_AI_SECTIONS.includes(seksi) ||
    !LINKEDIN_AI_BAHASA.includes(bahasa)
  ) {
    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  }

  // Aktivitas milik sendiri (RLS ikut menjaga) + profil untuk konteks.
  const [{ data: activityRow }, { data: profileRow }] = await Promise.all([
    supabase
      .from("skm_activities")
      .select("*")
      .eq("id", body.activity_id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("nama_lengkap, prodi, instansi")
      .eq("id", user.id)
      .maybeSingle(),
  ]);
  if (!activityRow) {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan." }, { status: 404 });
  }
  const activity = activityRow as SkmActivity;
  const profile = {
    nama: profileRow?.nama_lengkap || user.email?.split("@")[0] || "Mahasiswa",
    prodi: profileRow?.prodi ?? null,
    instansi: profileRow?.instansi ?? null,
  };

  const inputHash = buildInputHash(activity, seksi, bahasa, profile);

  // Cache: permintaan identik memakai ulang draft tanpa memanggil model.
  if (!body.force) {
    const { data: cached } = await supabase
      .from("linkedin_drafts")
      .select("id, draft, model, created_at")
      .eq("user_id", user.id)
      .eq("activity_id", activity.id)
      .eq("seksi", seksi)
      .eq("input_hash", inputHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cached) {
      return NextResponse.json({ draft: cached.draft, cached: true, id: cached.id });
    }
  }

  // Rate limit per-user per-hari (hitung baris draft hari ini, UTC).
  const todayUtc = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("linkedin_drafts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${todayUtc}T00:00:00Z`);
  if ((count ?? 0) >= DAILY_GENERATION_LIMIT) {
    return NextResponse.json(
      { error: `Batas ${DAILY_GENERATION_LIMIT} generasi per hari tercapai. Coba lagi besok.` },
      { status: 429 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const embedRes = await withTimeout(
      ai.models.embedContent({
        model: EMBED_MODEL,
        contents: buildRetrievalQuery(activity, seksi, bahasa),
        config: { taskType: "RETRIEVAL_QUERY", outputDimensionality: 768 },
      }),
    );
    const embedding = embedRes.embeddings?.[0]?.values;
    if (!embedding) throw new Error("Embedding kosong.");

    const { data: chunks, error: matchErr } = await supabase.rpc(
      "match_branding_chunks",
      {
        query_embedding: embedding,
        match_count: 4,
        filter_seksi: seksi,
        filter_bahasa: bahasa,
      },
    );
    if (matchErr) throw matchErr;

    const prompt = buildPrompt({
      chunks: (chunks ?? []) as { konten: string; sumber: string }[],
      activity,
      seksi,
      bahasa,
      profile,
    });

    const genRes = await withTimeout(
      ai.models.generateContent({ model: GEN_MODEL, contents: prompt }),
    );
    const draft = (genRes.text ?? "").trim();
    if (!draft) throw new Error("Model tidak mengembalikan teks.");

    const { data: saved } = await supabase
      .from("linkedin_drafts")
      .insert({
        user_id: user.id,
        activity_id: activity.id,
        seksi,
        input_hash: inputHash,
        draft,
        model: GEN_MODEL,
      })
      .select("id")
      .maybeSingle();

    return NextResponse.json({
      draft,
      cached: false,
      id: saved?.id ?? null,
      sumber_chunk: ((chunks ?? []) as { sumber: string }[]).map((c) => c.sumber),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /timeout/i.test(message) ? 504 : 502;
    return NextResponse.json(
      { error: `Generasi AI gagal: ${message}` },
      { status },
    );
  }
}
