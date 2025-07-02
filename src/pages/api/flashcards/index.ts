import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { PaginatedResponse, FlashcardDto, GetFlashcardsCommand } from '@/types';
import { FlashcardService } from '@/lib/services/flashcard.service';

export const prerender = false;

// Schema for input validation
const createFlashcardSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    front: z.string().min(1, 'Front content is required').max(200, 'Front content cannot exceed 200 characters'),
    back: z.string().min(1, 'Back content is required').max(500, 'Back content cannot exceed 500 characters'),
    tags: z.array(z.string()).default([]),
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

const QuerySchema = z.object({
  limit: z.coerce.number().positive().default(10),
  offset: z.coerce.number().nonnegative().default(0),
  tag: z.string().optional(),
});

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const supabase = locals?.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Authentication service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const session = locals?.session;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;

    const searchParams = Object.fromEntries(url.searchParams);
    const result = QuerySchema.safeParse(searchParams);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid query parameters',
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const command: GetFlashcardsCommand = {
      limit: result.data.limit,
      offset: result.data.offset,
      tag: result.data.tag,
    };

    const flashcardService = new FlashcardService(supabase);
    const response: PaginatedResponse<FlashcardDto> = await flashcardService.getFlashcards(command, userId);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET /flashcards:', error);

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
