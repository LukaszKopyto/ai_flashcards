import type { AstroCookies } from 'astro';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_BYTES = 32;

/**
 * Generates a new CSRF token and sets it in a cookie
 */
export async function generateCsrfToken(cookies: AstroCookies): Promise<string> {
  const buffer = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(buffer);
  const token = Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const hashedToken = await hashToken(token);

  cookies.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Validates the CSRF token from the request header against the cookie
 */
export async function validateCsrfToken(request: Request, cookies: AstroCookies): Promise<boolean> {
  const cookieToken = cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  const hashedHeaderToken = await hashToken(headerToken);
  return cookieToken === hashedHeaderToken;
}

/**
 * Hashes a token using SHA-256 with Web Crypto API
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
