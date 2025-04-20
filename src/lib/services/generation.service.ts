import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';
import type { StartGenerationCommand, GenerationDto, ParsedResponse } from '../../types';
import { OpenRouterService } from './openRouter.service';

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
  constructor(
    private readonly supabaseClient: SupabaseClient<Database>,
    private readonly openRouterService: OpenRouterService
  ) {}

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

      // 2. Generate flashcard proposals using LLM via OpenRouterService
      const llmResponse = await this.openRouterService.sendChatMessage(command.input_text);
      const flashcardsData = llmResponse.data;
      const proposals = flashcardsData.map((flashcardData: ParsedResponse) => ({
        ...flashcardData,
        id: `llm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: 'ai' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        generation_id: generation.id,
        user_id: userId,
        state: 'initial' as const
      }));

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
