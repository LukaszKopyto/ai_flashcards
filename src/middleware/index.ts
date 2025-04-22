import { defineMiddleware } from 'astro:middleware';
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { AuthService } from '@/lib/services/auth.service';
const PUBLIC_PAGES = ['/login', '/register', '/forgot-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  console.log('👀 ✅  URL: ', import.meta.env.SUPABASE_URL);
  console.log('👀 ✅  ANON KEY: ', import.meta.env.SUPABASE_KEY);

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
  console.log('👀 ✅ Session: ', session);


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
});
