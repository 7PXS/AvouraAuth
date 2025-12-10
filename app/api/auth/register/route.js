import { db } from "../../../../lib/db.js";
import { 
  hashPassword, 
  sanitizeInput, 
  isValidEmail, 
  isValidPassword,
  checkRateLimit,
  TESTING_MODE 
} from "../../../../lib/auth.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, gameid } = body;

    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`register:${clientIp}`, 3, 60 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ 
          error: "Too many registration attempts. Please try again later." 
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

    if (!isValidEmail(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }), 
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      const message = TESTING_MODE 
        ? "Password must be at least 1 character"
        : "Password must be at least 8 characters with uppercase, lowercase, and number";
      
      return new Response(
        JSON.stringify({ error: message }), 
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const user = await db.createUser({
      email: sanitizedEmail,
      password: hashedPassword,
      gameid: gameid ? sanitizeInput(gameid) : null,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        user,
        testingMode: TESTING_MODE 
      }), 
      { 
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    if (err.message === "User already exists") {
      return new Response(
        JSON.stringify({ error: "User already exists" }), 
        { status: 409 }
      );
    }

    console.error("Registration error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
}
