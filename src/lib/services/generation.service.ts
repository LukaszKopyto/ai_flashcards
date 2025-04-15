import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';
import type { StartGenerationCommand, GenerationDto, ProposalFlashcardDto } from '../../types';

// Mock AI-generated flashcards for development
const mockFlashcardProposals: ProposalFlashcardDto[] = [
  {
    title: 'Sample Flashcard 1',
    front: 'What is the capital of France?',
    back: 'Paris is the capital of France',
    tags: ['geography', 'europe', 'capitals'],
    source: 'ai_full',
  },
  {
    title: 'Sample Flashcard 2',
    front: 'What is the largest planet in our solar system?',
    back: 'Jupiter is the largest planet in our solar system',
    tags: ['astronomy', 'planets', 'solar system'],
    source: 'ai_full',
  },
];

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'DATABASE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR',
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export class GenerationService {
  constructor(private readonly supabaseClient: SupabaseClient<Database>) {}

  async startGeneration(command: StartGenerationCommand, userId: string): Promise<GenerationDto> {
    try {
      const startTime = Date.now();

      // 1. Initialize generation session in database
      const { data: generation, error: insertError } = await this.supabaseClient
        .from('generations')
        .insert({
          user_id: userId,
          generated_count: 0,
          accepted_unedited_count: 0,
          accepted: 0,
          edited_count: 0,
          generation_duration: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw new GenerationError(`Failed to create generation: ${insertError.message}`, 'DATABASE_ERROR', insertError);
      }

      if (!generation) {
        throw new GenerationError('Generation record was not created', 'DATABASE_ERROR');
      }

      // 2. Mock AI service response
      const proposals = mockFlashcardProposals;
      const endTime = Date.now();
      const generationDuration = endTime - startTime;

      // 3. Update generation record with results
      const { error: updateError } = await this.supabaseClient
        .from('generations')
        .update({
          generated_count: proposals.length,
          generation_duration: generationDuration,
        })
        .eq('id', generation.id);

      if (updateError) {
        throw new GenerationError(`Failed to update generation: ${updateError.message}`, 'DATABASE_ERROR', updateError);
      }

      return {
        ...generation,
        flashcards_proposals: proposals,
      };
    } catch (error) {
      console.error('Error in startGeneration:', error);

      if (error instanceof GenerationError) {
        throw error;
      }

      throw new GenerationError('An unexpected error occurred during generation', 'UNKNOWN_ERROR', error);
    }
  }
}
