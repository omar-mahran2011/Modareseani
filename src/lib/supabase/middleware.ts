import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/privacy",
  "/auth/callback",
  "/auth/auth-code-error",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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
  const isAssetOrApi =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (!user && !isPublicPath(pathname) && !isAssetOrApi && pathname !== "/") {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/teachers", request.url));
  }

  // Onboarding gate: a signed-in user with no governorate/city yet must
  // finish onboarding before reaching anything else (this covers Google
  // OAuth sign-ins, which skip the location fields collected on the
  // email/password signup forms).
  const isOnboardingPath = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
  const isResetPasswordPath = pathname === "/reset-password";
  if (
    user &&
    !isOnboardingPath &&
    !isResetPasswordPath &&
    !isPublicPath(pathname) &&
    !isAssetOrApi &&
    pathname !== "/"
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("governorate_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.governorate_id) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return response;
}
