import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** UI menyembunyikan tombol AI bila key tidak dikonfigurasi (dok 02 §3.4). */
export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.GEMINI_API_KEY) });
}
