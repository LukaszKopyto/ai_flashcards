import type { User, Session, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { loginSchema } from '@/schemas/auth';
import { ZodError } from 'zod';

// Insert custom error class for authentication errors
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  async getSession(): Promise<Session | null> {
    const response = await fetch('/api/auth/session');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get session');
    }
    
    return data.session;
  }

  async signInWithPassword(email: string, password: string): Promise<AuthTokenResponsePassword> {
    try {
      const validatedData = loginSchema.parse({ email, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }
      
      return data;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new AuthError(`Validation failed: ${validationErrors}`);
      }
      if (error instanceof Error) {
        throw new AuthError(error.message);
      }
      throw new AuthError('An unexpected error occurred during sign in');
    }
  }

  async signOut(): Promise<{ success: boolean; error?: unknown }> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign out');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session?.user;
  }
} 