import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that don't require authentication
const publicPaths = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  console.log("middleware");
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // If no token, redirect to login with return URL
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
