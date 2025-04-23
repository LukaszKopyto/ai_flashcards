/**
 * Sets security headers for API responses
 */
export function setSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Content-Security-Policy', "default-src 'self'");
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS headers
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Creates a secure JSON response with proper headers
 */
export function createSecureJsonResponse(data: unknown, status: number = 200): Response {
  const response = new Response(
    JSON.stringify(data),
    { 
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  return setSecurityHeaders(response);
} 