import type { APIRoute } from 'astro'
import { registerSchema } from '@/schemas/auth'
import { ZodError } from 'zod'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, password, confirmPassword } = await request.json()
    const validatedData = registerSchema.parse({ email, password, confirmPassword })

    const { data, error } = await locals.supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      }
    })

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation = !data.session

    return new Response(
      JSON.stringify({
        user: data.user,
        session: data.session,
        requiresEmailConfirmation
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return new Response(
        JSON.stringify({
          error: `Validation failed: ${validationErrors}`,
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 