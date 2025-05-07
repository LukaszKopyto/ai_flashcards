import type { APIRoute } from 'astro';
import { emailSchema } from '@/schemas/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = emailSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.SITE}/reset-password`,
    });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to send reset password email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Password reset instructions sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
