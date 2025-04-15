import { z } from 'zod';
import type { APIRoute } from 'astro';
import { FlashcardService } from '../../lib/services/flashcard.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';
import { sanitizeGenerationInput } from '../../lib/sanitization/text';

export const prerender = false;

// Schema for input validation
const createFlashcardSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .transform((val) => sanitizeGenerationInput(val)),
    front: z
      .string()
      .min(1, 'Front content is required')
      .max(200, 'Front content cannot exceed 200 characters')
      .transform((val) => sanitizeGenerationInput(val)),
    back: z
      .string()
      .min(1, 'Back content is required')
      .max(500, 'Back content cannot exceed 500 characters')
      .transform((val) => sanitizeGenerationInput(val)),
    tags: z
      .array(z.string())
      .default([])
      .transform((tags) => tags.map((tag) => sanitizeGenerationInput(tag)).filter((tag) => tag.length > 0)),
    source: z.enum(['ai', 'ai_edited', 'manual']),
    generation_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      // If source is 'ai' or 'ai_edited', generation_id is required
      if (['ai', 'ai_edited'].includes(data.source) && !data.generation_id) {
        return false;
      }
      return true;
    },
    {
      message: "generation_id is required when source is 'ai' or 'ai_edited'",
      path: ['generation_id'],
    }
  );

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Get and validate input data
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

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

    // 2. Use DEFAULT_USER_ID instead of authentication
    const userId = DEFAULT_USER_ID;

    // 3. Create flashcard using service
    const flashcardService = new FlashcardService(locals.supabase);
    const result = await flashcardService.createFlashcard(validationResult.data, userId);

    // 4. Return response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing flashcard creation request:', error);

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
