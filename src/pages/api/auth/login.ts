import type { APIRoute } from 'astro';
import { loginSchema } from '@/schemas/auth';
import { ZodError } from 'zod';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, password } = await request.json();
    const validatedData = loginSchema.parse({ email, password });

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return new Response(
        JSON.stringify({
          error: `Validation failed: ${validationErrors}`,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      { status: 500 }
    );
  }
};
