import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { validateToken } from "@/lib/auth";

export async function GET(request) {
  const url = new URL(request.url);
  const gameid = url.searchParams.get("gameid");

  if (!gameid) {
    return new Response(JSON.stringify({ error: "Missing gameid" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Check authentication
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const token = authHeader.substring(7);

  // Validate token
  const userId = validateToken(token);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired token" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Verify session
  const session = await db.getSession(token);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Session not found" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Get user to check gameid authorization
  const user = await db.getUserById(session.userId);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "User not found" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Check if user is authorized for this gameid
  if (user.gameid && user.gameid !== gameid) {
    return new Response(
      JSON.stringify({ error: "Unauthorized for this game" }), 
      { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "api", "script", `${gameid}.lua`);
    const content = await fs.readFile(filePath, "utf-8");

    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Script not found" }), 
      { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
