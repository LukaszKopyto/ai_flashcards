import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { GenerationDto } from '../../types';
import { supabaseClient, DEFAULT_USER_ID } from '../../db/supabase.client';
import { GenerationService } from '../../lib/services/generation.service';
import { sanitizeGenerationInput } from '../../lib/sanitization/text';

// Schema for input validation
const startGenerationSchema = z.object({
  input_text: z
    .string()
    .min(1000, 'Input text must be at least 1000 characters long')
    .max(10000, 'Input text cannot exceed 10000 characters')
    .transform((text) => sanitizeGenerationInput(text)),
  metadata: z.record(z.unknown()).optional(),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Validate request body
    const body = await request.json();
    const validationResult = startGenerationSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { input_text, metadata } = validationResult.data;
    const generationService = new GenerationService(supabaseClient);

    const result = await generationService.startGeneration({ input_text, metadata }, DEFAULT_USER_ID);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing generation request:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
