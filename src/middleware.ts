import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Routes reachable without a session. */
const PUBLIC_PATHS = ["/login", "/register", "/auth", "/offline"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Until .env.local holds real Supabase values there is no session to refresh.
  // Let every request through so the app renders its setup notice instead of
  // redirect-looping on a connection that cannot succeed.
  if (!isSupabaseConfigured) return NextResponse.next();

  let result;
  try {
    result = await updateSession(request);
  } catch {
    return NextResponse.next();
  }

  const { response, user } = result;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && !isPublic) {
    // API callers get a status they can branch on; browsers get the login page.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Sesi berakhir. Silakan masuk kembali." },
        { status: 401 },
      );
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Static files, the manifest and the service worker must bypass auth.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|logo.png|.*\.(?:png|jpg|jpeg|svg|gif|webp|ico|webmanifest)$).*)",
  ],
};
