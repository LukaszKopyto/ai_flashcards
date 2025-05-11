import { z } from 'zod';
import type { APIRoute } from 'astro';
import { FlashcardService } from '@/lib/services/flashcard.service';
import { sanitizeGenerationInput } from '@/lib/sanitization/text';

export const prerender = false;

// Schema for update validation
const updateFlashcardSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .transform((val) => sanitizeGenerationInput(val))
    .optional(),
  front: z
    .string()
    .min(1, 'Front content is required')
    .max(200, 'Front content cannot exceed 200 characters')
    .transform((val) => sanitizeGenerationInput(val))
    .optional(),
  back: z
    .string()
    .min(1, 'Back content is required')
    .max(500, 'Back content cannot exceed 500 characters')
    .transform((val) => sanitizeGenerationInput(val))
    .optional(),
  tags: z
    .array(z.string())
    .transform((tags) => tags.map((tag) => sanitizeGenerationInput(tag)).filter((tag) => tag.length > 0))
    .optional(),
});

export const PUT: APIRoute = async ({ request, locals, params }) => {
  try {
    // 1. Validate flashcard ID from URL params
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: [{ message: 'Flashcard ID is required' }],
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Get and validate input data
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

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
    const result = await flashcardService.updateFlashcard(id, validationResult.data, userId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing flashcard update request:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return new Response(
        JSON.stringify({
          error: 'Not found',
          message: 'Flashcard not found or you do not have permission to update it',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
