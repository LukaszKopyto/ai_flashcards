import type { AstroCookies } from 'astro';
import { randomBytes, createHash } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_BYTES = 32;

/**
 * Generates a new CSRF token and sets it in a cookie
 */
export function generateCsrfToken(cookies: AstroCookies): string {
  const token = randomBytes(TOKEN_BYTES).toString('hex');
  const hashedToken = hashToken(token);
  
  cookies.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  });
  
  return token;
}

/**
 * Validates the CSRF token from the request header against the cookie
 */
export function validateCsrfToken(request: Request, cookies: AstroCookies): boolean {
  const cookieToken = cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  const hashedHeaderToken = hashToken(headerToken);
  return cookieToken === hashedHeaderToken;
}

/**
 * Hashes a token using SHA-256
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
} 