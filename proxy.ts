import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/webhook(.*)",
  "/api/webhooks(.*)",
  "/api/payments/phonepe/callback(.*)",
  "/payments/success(.*)",
  "/payments/failed(.*)",
  "/payments/phonepe-mock(.*)",
  "/landing(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, PWA files, and browser system paths
    "/((?!_next|static|manifest\\.json|sw\\.js|favicon\\.ico|\\.well-known|.*\\.png|.*\\.svg|.*\\.ico|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.otf).*)",
    "/api/(.*)",
  ],
};
