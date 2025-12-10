import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = new URL(request.url);

  // Only log requests to /api/script
  if (pathname.startsWith("/api/script")) {
    console.log("Script request:", request.url);
  }

  // Allow all requests to continue
  return NextResponse.next();
}

// Apply middleware only to /api/script
export const config = {
  matcher: ["/api/script/:path*"],
};
