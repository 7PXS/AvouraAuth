// Simple in-memory database for demo purposes
// In production, use a real database like PostgreSQL, MongoDB, etc.

const users = new Map();
const sessions = new Map();

export const db = {
  // User operations
  createUser: async (userData) => {
    if (users.has(userData.email)) {
      throw new Error("User already exists");
    }
    
    const user = {
      id: crypto.randomUUID(),
      email: userData.email,
      password: userData.password,
      gameid: userData.gameid || null,
      createdAt: new Date().toISOString(),
    };
    
    users.set(userData.email, user);
    return { ...user, password: undefined }; // Don't return password
  },

  getUserByEmail: async (email) => {
    return users.get(email) || null;
  },

  getUserById: async (id) => {
    for (const user of users.values()) {
      if (user.id === id) {
        return { ...user, password: undefined };
      }
    }
    return null;
  },

  updateUser: async (id, updates) => {
    for (const [email, user] of users.entries()) {
      if (user.id === id) {
        const updated = { ...user, ...updates };
        users.set(email, updated);
        return { ...updated, password: undefined };
      }
    }
    return null;
  },

  // Session operations
  createSession: async (userId, token) => {
    const session = {
      id: crypto.randomUUID(),
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    sessions.set(token, session);
    return session;
  },

  getSession: async (token) => {
    const session = sessions.get(token);
    
    if (!session) return null;
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      sessions.delete(token);
      return null;
    }
    
    return session;
  },

  deleteSession: async (token) => {
    return sessions.delete(token);
  },

  // Utility for testing
  clearAll: () => {
    users.clear();
    sessions.clear();
  },

  getAllUsers: () => {
    return Array.from(users.values()).map(u => ({ ...u, password: "***" }));
  }
};
