import { z } from 'zod';
import type { APIRoute } from 'astro';
import { FlashcardService } from '@/lib/services/flashcard.service';
import { sanitizeGenerationInput } from '@/lib/sanitization/text';

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
    generation_id: z.string().uuid().nullable(),
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

    const userId = locals?.user?.id ?? '';

    const flashcardService = new FlashcardService(locals.supabase);
    const result = await flashcardService.createFlashcard(validationResult.data, userId);

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
