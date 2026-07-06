import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin";
const GATED_PREFIXES = [
  "/activities",
  "/accommodations",
  "/gallery",
  "/about",
  "/contact",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);
  const needsApprovedContent = GATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!needsApprovedContent && !needsAdmin && pathname !== "/waiver") {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", user.id)
    .single();

  if (needsAdmin) {
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  const { data: activeVersion } = await supabase
    .from("waiver_versions")
    .select("id")
    .eq("is_active", true)
    .single();

  let hasAccepted = true;
  if (activeVersion) {
    const { data: acceptance } = await supabase
      .from("waiver_acceptances")
      .select("id")
      .eq("profile_id", user.id)
      .eq("waiver_version_id", activeVersion.id)
      .maybeSingle();
    hasAccepted = Boolean(acceptance);
  }

  if (pathname === "/waiver") {
    return response;
  }

  if (!hasAccepted) {
    return NextResponse.redirect(new URL("/waiver", request.url));
  }

  if (profile?.status === "revoked") {
    return NextResponse.redirect(new URL("/revoked", request.url));
  }

  if (profile?.status !== "approved") {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
