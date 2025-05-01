import type { MiddlewareHandler } from 'astro';
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
const PUBLIC_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Redirect root path to /generate
  if (context.url.pathname === '/') {
    return context.redirect('/generate');
  }

  if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Add Supabase instance to locals for API routes
  context.locals.supabase = supabase;

  const isApiRoute = context.url.pathname.startsWith('/api/');
  
  // Skip auth check for API routes - they handle their own auth
  if (isApiRoute) {
    return next();
  }

  const isPublicPage = PUBLIC_PAGES.includes(context.url.pathname);

  if (!session && !isPublicPage) {
    return context.redirect('/login');
  }

  // Redirect to generate page if user is logged in and tries to access public pages
  if (session && isPublicPage) {
    return context.redirect('/generate');
  }

  return next();
};
