import type { APIRoute } from 'astro';
import { updatePasswordSchema } from '@/schemas/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get current session
    const session = await locals.supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please log in' }),
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        }),
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Verify current password
    const { error: verifyError } = await locals.supabase.auth.signInWithPassword({
      email: session.data.session?.user?.email ?? '',
      password: currentPassword,
    });

    if (verifyError) {
      return new Response(
        JSON.stringify({ error: 'Current password is incorrect' }),
        { status: 400 }
      );
    }

    // Update password
    const { error: updateError } = await locals.supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Password updated successfully' }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Password update error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
