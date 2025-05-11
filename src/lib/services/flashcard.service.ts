import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';
import type { CreateFlashcardCommand, FlashcardDto, FlashcardInsert, UpdateFlashcardCommand } from '../../types';

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
}
