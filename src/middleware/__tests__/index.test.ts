import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { onRequest } from '@/middleware/index';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

type Context = {
  url: { pathname: string };
  redirect: (path: string) => any;
  request: {
    headers: {
      get: (name: string) => string | null;
    };
  };
  cookies: {
    set: (name: string, value: string, options?: any) => void;
  };
  locals: Record<string, any>;
};

type NextFunction = () => any;

type MockSupabaseClient = {
  auth: {
    getSession: Mock;
  };
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
  parseCookieHeader: vi.fn(),
}));

const originalEnv = { ...import.meta.env };

describe('Middleware', () => {
  let context: Context;
  let next: NextFunction;
  let mockSupabaseClient: MockSupabaseClient;

  beforeEach(() => {
    vi.resetAllMocks();
    import.meta.env.SUPABASE_URL = 'https://test-url.supabase.co';
    import.meta.env.SUPABASE_KEY = 'test-key';

    context = {
      url: { pathname: '/test' },
      redirect: vi.fn(() => 'REDIRECTED'),
      request: {
        headers: {
          get: vi.fn().mockReturnValue('cookie=value'),
        },
      },
      cookies: {
        set: vi.fn(),
      },
      locals: {},
    };

    next = vi.fn().mockReturnValue('NEXT');

    mockSupabaseClient = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
        }),
      },
    };

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient);
    
    (parseCookieHeader as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  it('should redirect root path to /generate', async () => {
    context.url.pathname = '/';
    
    const result = await onRequest(context as any, next);
    
    expect(context.redirect).toHaveBeenCalledWith('/generate');
    expect(result).toBe('REDIRECTED');
  });

  it('should throw error if Supabase env variables are missing', async () => {
    import.meta.env.SUPABASE_URL = '';
    
    await expect(onRequest(context as any, next)).rejects.toThrow('Missing Supabase environment variables');
  });

  it('should create Supabase client and store in locals', async () => {
    await onRequest(context as any, next);
    
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test-url.supabase.co',
      'test-key',
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    );
    expect(context.locals.supabase).toBe(mockSupabaseClient);
  });

  it('should skip auth check for API routes', async () => {
    context.url.pathname = '/api/test';
    
    const result = await onRequest(context as any, next);
    
    expect(next).toHaveBeenCalled();
    expect(result).toBe('NEXT');
  });

  it('should redirect unauthenticated users to login from protected pages', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    context.url.pathname = '/protected';
    
    const result = await onRequest(context as any, next);
    
    expect(context.redirect).toHaveBeenCalledWith('/login');
    expect(result).toBe('REDIRECTED');
  });

  it('should allow unauthenticated users to access public pages', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    context.url.pathname = '/login';
    
    const result = await onRequest(context as any, next);
    
    expect(next).toHaveBeenCalled();
    expect(result).toBe('NEXT');
  });

  it('should redirect authenticated users from public pages to /generate', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
    });
    context.url.pathname = '/login';
    
    const result = await onRequest(context as any, next);
    
    expect(context.redirect).toHaveBeenCalledWith('/generate');
    expect(result).toBe('REDIRECTED');
  });

  it('should allow authenticated users to access protected pages', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
    });
    context.url.pathname = '/protected';
    
    const result = await onRequest(context as any, next);
    
    expect(next).toHaveBeenCalled();
    expect(result).toBe('NEXT');
  });

  it('should handle cookie operations correctly', async () => {
    (context.request.headers.get as Mock).mockReturnValue('test-cookie=value');
    (parseCookieHeader as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      { name: 'test-cookie', value: 'value' }
    ]);
    
    await onRequest(context as any, next);
    
    const cookiesConfig = (createServerClient as unknown as ReturnType<typeof vi.fn>).mock.calls[0][2].cookies;
    
    cookiesConfig.getAll();
    expect(context.request.headers.get).toHaveBeenCalledWith('Cookie');
    expect(parseCookieHeader).toHaveBeenCalledWith('test-cookie=value');
    
    cookiesConfig.setAll([{ name: 'test-cookie', value: 'new-value', options: {} }]);
    
    expect(context.cookies.set).toHaveBeenCalledWith('test-cookie', 'new-value', {});
  });
}); 