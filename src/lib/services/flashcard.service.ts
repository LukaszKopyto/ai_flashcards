import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';
import type {
  CreateFlashcardCommand,
  FlashcardDto,
  FlashcardInsert,
  UpdateFlashcardCommand,
  GetFlashcardsCommand,
  PaginatedResponse,
} from '../../types';

export class FlashcardError extends Error {
  constructor(
    message: string,
    public readonly code: 'DATABASE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR',
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'FlashcardError';
  }
}

export class FlashcardService {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  /**
   * Creates a new flashcard
   *
   * @param command - Command containing the flashcard data
   * @param userId - ID of the user creating the flashcard
   * @returns Created flashcard DTO
   */
  async createFlashcard(command: CreateFlashcardCommand, userId: string): Promise<FlashcardDto> {
    try {
      if (!userId) {
        throw new FlashcardError('User ID is required', 'VALIDATION_ERROR');
      }

      // Prepare data for saving
      const flashcardData: FlashcardInsert = {
        ...command,
        user_id: userId,
      };

      // Save to database
      const { data, error } = await this.supabaseClient.from('flashcards').insert(flashcardData).select().single();

      if (error) {
        throw new FlashcardError(`Failed to create flashcard: ${error.message}`, 'DATABASE_ERROR', error);
      }

      if (!data) {
        throw new FlashcardError('Flashcard was not created', 'DATABASE_ERROR');
      }

      // Return DTO
      return {
        id: data.id,
        title: data.title,
        front: data.front,
        back: data.back,
        tags: data.tags,
        source: data.source,
        created_at: data.created_at,
        updated_at: data.updated_at,
        generation_id: data.generation_id,
      };
    } catch (error) {
      console.error('Error in createFlashcard:', error);

      if (error instanceof FlashcardError) {
        throw error;
      }

      throw new FlashcardError('An unexpected error occurred during flashcard creation', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Updates an existing flashcard
   *
   * @param id - ID of the flashcard to update
   * @param command - Command containing the updated flashcard data
   * @param userId - ID of the user updating the flashcard
   * @returns Updated flashcard DTO
   */

  async updateFlashcard(id: string, command: UpdateFlashcardCommand, userId: string): Promise<FlashcardDto> {
    try {
      if (!userId) {
        throw new FlashcardError('User ID is required', 'VALIDATION_ERROR');
      }

      // Save to database
      const { data, error } = await this.supabaseClient
        .from('flashcards')
        .update(command)
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only update their own flashcards
        .select()
        .single();

      if (error) {
        throw new FlashcardError(`Failed to update flashcard: ${error.message}`, 'DATABASE_ERROR', error);
      }

      if (!data) {
        throw new FlashcardError(
          'Flashcard was not found or user does not have permission to update it',
          'DATABASE_ERROR'
        );
      }

      // Return DTO
      return {
        id: data.id,
        title: data.title,
        front: data.front,
        back: data.back,
        tags: data.tags,
        source: data.source,
        created_at: data.created_at,
        updated_at: data.updated_at,
        generation_id: data.generation_id,
      };
    } catch (error) {
      console.error('Error in updateFlashcard:', error);

      if (error instanceof FlashcardError) {
        throw error;
      }

      throw new FlashcardError('An unexpected error occurred during flashcard update', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Retrieves a paginated list of flashcards for a specific user with optional filtering
   *
   * @param command - Command containing pagination and filtering parameters
   * @param userId - ID of the user whose flashcards to retrieve
   * @returns Paginated response with flashcard DTOs
   */
  async getFlashcards(command: GetFlashcardsCommand, userId: string): Promise<PaginatedResponse<FlashcardDto>> {
    if (!userId) {
      throw new FlashcardError('User ID is required', 'VALIDATION_ERROR');
    }
    const { limit, offset, tag } = command;
    try {
      let query = this.supabaseClient
        .from('flashcards')
        .select('id, title, front, back, tags, source, created_at, updated_at, generation_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      const { data: flashcards, error } = await query.range(offset, offset + limit - 1).returns<FlashcardDto[]>();

      if (error) {
        throw new FlashcardError(`Failed to fetch flashcards: ${error.message}`, 'DATABASE_ERROR', error);
      }

      let countQuery = this.supabaseClient
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (tag) {
        countQuery = countQuery.contains('tags', [tag]);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new FlashcardError(`Failed to count flashcards: ${countError.message}`, 'DATABASE_ERROR', countError);
      }

      return {
        data: flashcards || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
        },
      };
    } catch (error) {
      console.error('Error in getFlashcards:', error);

      if (error instanceof FlashcardError) {
        throw error;
      }

      throw new FlashcardError('An unexpected error occurred while retrieving flashcards', 'UNKNOWN_ERROR', error);
    }
  }
}
