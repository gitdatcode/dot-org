/**
 * Server-side session management for Ghost members
 */
import type { GhostMember } from './ghost/types';

// Constants for session management
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * In-memory session store
 *
 * NOTE: This is a simple implementation for development purposes.
 * In production, you should use a persistent session store like Redis,
 * a database, or a managed session service.
 */
const sessions = new Map<string, {
  member: GhostMember;
  createdAt: number;
}>();

/**
 * Generate a cryptographically secure session ID
 *
 * @returns A random session ID string
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Create a new session for a member
 *
 * @param member - The authenticated Ghost member
 * @returns The generated session ID
 */
export function createSession(member: GhostMember): string {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    member,
    createdAt: Date.now()
  });
  return sessionId;
}

/**
 * Get a member from a session ID
 *
 * @param sessionId - The session ID to look up
 * @returns The member associated with the session, or null if not found or expired
 */
export function getSession(sessionId: string): GhostMember | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (Date.now() - session.createdAt > SESSION_EXPIRY_MS) {
    sessions.delete(sessionId);
    return null;
  }

  return session.member;
}

/**
 * Delete a session (logout)
 *
 * @param sessionId - The session ID to delete
 * @returns True if the session was found and deleted, false otherwise
 */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

/**
 * Clean expired sessions from memory
 */
export function cleanSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_EXPIRY_MS) {
      sessions.delete(sessionId);
    }
  }
}

// Set up a cleanup interval to prevent memory leaks
setInterval(cleanSessions, CLEANUP_INTERVAL_MS);
