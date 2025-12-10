import { db } from "../../../../lib/db.js";
import { 
  verifyPassword, 
  generateToken, 
  sanitizeInput,
  checkRateLimit,
  TESTING_MODE
} from "../../../../lib/auth.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ 
          error: "Too many login attempts. Please try again in 15 minutes." 
        }), 
        { status: 429 }
      );
    }

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }), 
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Get user
    const user = await db.getUserByEmail(sanitizedEmail);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }), 
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }), 
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id);

    // Create session
    await db.createSession(user.id, token);

    return new Response(
      JSON.stringify({ 
        success: true,
        token,
        user: { id: user.id, email: user.email, gameid: user.gameid },
        testingMode: TESTING_MODE
      }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("Login error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
}
