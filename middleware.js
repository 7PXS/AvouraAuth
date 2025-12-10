import { NextResponse } from "next/server";

// Import Node APIs carefully: Edge runtime doesn't support 'fs' directly
// So we can only read files at build-time via dynamic import
import path from "path";
import { promises as fs } from "fs";

export async function middleware(request) {
  const { pathname, searchParams } = new URL(request.url);

  // Only handle /api/scripts
  if (pathname === "/api/scripts") {
    const gameid = searchParams.get("gameid");
    if (!gameid) {
      return NextResponse.json({ error: "Missing gameid" }, { status: 400 });
    }

    try {
      // Compute path to your scripts folder
      const scriptsDir = path.join(process.cwd(), "app/api/scripts"); // adjust if needed

      // Build full path to the requested file
      const filePath = path.join(scriptsDir, `${gameid}.js`);

      // Check if file exists
      await fs.access(filePath);

      // Read file contents
      const content = await fs.readFile(filePath, "utf-8");

      // Return content as plain text
      return new Response(content, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } catch (err) {
      // File doesn't exist or other error
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }
  }

  // Allow other requests to pass through
  return NextResponse.next();
}

// Apply middleware only to /api/scripts
export const config = {
  matcher: ["/api/scripts"],
};
