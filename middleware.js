import { NextResponse } from "next/server";

export function middleware(request) {
  // Example: simple logging middleware
  console.log("Middleware triggered for:", request.url);

  // Always return a response or NextResponse.next()
  return NextResponse.next();
}

// Specify routes to match (optional)
export const config = {
  matcher: ["/home/:path*"], // Only run on /home
};
