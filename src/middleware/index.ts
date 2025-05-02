import { sequence } from "astro:middleware";
import type { MiddlewareHandler } from 'astro';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

const PUBLIC_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

const redirectRootMiddleware: MiddlewareHandler = async (context, next) => {
  if (context.url.pathname === '/') {
    return context.redirect('/generate');
  }
  return next();
};

const supabaseClientMiddleware: MiddlewareHandler = async (context, next) => {
  if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  const supabase = createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        getAll: () => parseCookieHeader(context.request.headers.get('Cookie') ?? '').map(({ name, value }) => ({ name, value: value ?? '' })),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  context.locals.supabase = supabase;
  return next();
};

const sessionMiddleware: MiddlewareHandler = async (context, next) => {
  const supabase = context.locals.supabase;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  context.locals.session = session;
  return next();
};

const userMiddleware: MiddlewareHandler = async (context, next) => {
  const supabase = context.locals.supabase;
  const { data: { user } } = await supabase.auth.getUser();
  context.locals.user = user;
  return next();
};

const apiChain = sequence(
  supabaseClientMiddleware,
  sessionMiddleware,
  userMiddleware
);

const authRedirectMiddleware: MiddlewareHandler = async (context, next) => {
  const session = context.locals.session;
  const isPublicPage = PUBLIC_PAGES.includes(context.url.pathname);
  if (!session && !isPublicPage) {
    return context.redirect('/login');
  }
  if (session && isPublicPage) {
    return context.redirect('/generate');
  }
  return next();
};

const appChain = sequence(
  redirectRootMiddleware,
  supabaseClientMiddleware,
  sessionMiddleware,
  userMiddleware,
  authRedirectMiddleware
);

export const onRequest: MiddlewareHandler = (context, next) => {
  if (context.url.pathname.startsWith('/api/')) {
    return apiChain(context, next);
  }
  return appChain(context, next);
};
