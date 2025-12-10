import { db } from "@/lib/db";
import { validateToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No token provided" }), 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate token format
    const userId = validateToken(token);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }), 
        { status: 401 }
      );
    }

    // Check session exists
    const session = await db.getSession(token);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }), 
        { status: 401 }
      );
    }

    // Get user
    const user = await db.getUserById(session.userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: { id: user.id, email: user.email, gameid: user.gameid }
      }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("Verify error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
}
