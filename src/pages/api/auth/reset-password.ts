import type { APIRoute } from 'astro';
import { resetPasswordSchema } from '@/schemas/auth';
import { validateCsrfToken } from '@/lib/csrf';
import { createSecureJsonResponse } from '@/lib/security';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Validate CSRF token
    if (!validateCsrfToken(request, cookies)) {
      return createSecureJsonResponse(
        { error: 'Invalid request token' },
        403
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return createSecureJsonResponse({ 
        error: 'Invalid request data',
        details: validationResult.error.errors 
      }, 400);
    }

    const { newPassword, hash } = validationResult.data;

    // First verify the recovery token
    const { error: verifyError, data } = await locals.supabase.auth.verifyOtp({
      token_hash: hash,
      type: 'recovery'
    });

    if (verifyError) {
      console.error('Password reset verification failed:', {
        error: verifyError.message,
        timestamp: new Date().toISOString()
      });

      return createSecureJsonResponse({ 
        error: 'Invalid or expired reset link. Please request a new password reset.'
      }, 400);
    }

    // Then update the password
    const { error: updateError } = await locals.supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Password update failed:', {
        error: updateError.message,
        timestamp: new Date().toISOString()
      });

      return createSecureJsonResponse({ 
        error: 'Failed to reset password. Please try again or contact support.'
      }, 500);
    }

    // Sign out all other sessions
    const { error: signOutError } = await locals.supabase.auth.signOut({
      scope: 'global'
    });

    if (signOutError) {
      console.warn('Failed to sign out all sessions:', {
        error: signOutError.message,
        timestamp: new Date().toISOString()
      });
    }

    // Log successful password reset (without sensitive data)
    console.info('Password reset successful', {
      timestamp: new Date().toISOString()
    });

    return createSecureJsonResponse({
      message: 'Password reset successfully. Please log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return createSecureJsonResponse({ 
      error: 'An unexpected error occurred. Please try again later.'
    }, 500);
  }
} 