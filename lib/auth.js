import crypto from "crypto";

// Toggle testing mode here
export const TESTING_MODE = true;

// Hash password with salt (production mode)
export function hashPassword(password) {
  if (TESTING_MODE) {
    return password; // No hashing in testing mode
  }
  
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Verify password against hash
export function verifyPassword(password, hashedPassword) {
  if (TESTING_MODE) {
    return password === hashedPassword; // Plain comparison in testing mode
  }
  
  const [salt, hash] = hashedPassword.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}

// Generate secure token
export function generateToken(userId) {
  if (TESTING_MODE) {
    return `test_token_${userId}`; // Simple token in testing mode
  }
  
  const token = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now();
  return `${userId}:${timestamp}:${token}`;
}

// Validate token
export function validateToken(token) {
  if (TESTING_MODE) {
    // In testing mode, extract userId from simple token
    if (token.startsWith("test_token_")) {
      return token.replace("test_token_", "");
    }
    return null;
  }
  
  try {
    const [userId, timestamp, tokenHash] = token.split(":");
    const age = Date.now() - parseInt(timestamp);
    
    // Token expires after 24 hours
    if (age > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return userId;
  } catch {
    return null;
  }
}

// Rate limiting (simple in-memory store)
const rateLimitStore = new Map();

export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  if (TESTING_MODE) {
    return true; // No rate limiting in testing mode
  }
  
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { attempts: 0, resetAt: now + windowMs };
  
  // Reset if window expired
  if (now > record.resetAt) {
    record.attempts = 0;
    record.resetAt = now + windowMs;
  }
  
  record.attempts++;
  rateLimitStore.set(identifier, record);
  
  return record.attempts <= maxAttempts;
}

// Sanitize input to prevent injection attacks
export function sanitizeInput(input) {
  if (TESTING_MODE) {
    return input; // No sanitization in testing mode
  }
  
  if (typeof input !== "string") return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/['";]/g, "") // Remove quotes and semicolons
    .trim()
    .slice(0, 255); // Limit length
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password) {
  if (TESTING_MODE) {
    return password.length >= 1; // Lenient in testing mode
  }
  
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
