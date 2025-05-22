import type { Database } from '@/db/database.types';
import { FLASHCARD_PROPOSAL_STATE } from '@/lib/constants';

// Base entity types
export type Flashcard = Database['public']['Tables']['flashcards']['Row'];
export type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert'];
export type FlashcardUpdate = Database['public']['Tables']['flashcards']['Update'];

export type Generation = Database['public']['Tables']['generations']['Row'];

export type GenerationErrorLog = Database['public']['Tables']['generation_error_logs']['Row'];

// Generic pagination interfaces
export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// 1. Flashcards

// DTO for flashcard returned by GET /flashcards and GET /flashcards/{flashcardId}
export type FlashcardDto = Pick<
  Flashcard,
  'id' | 'title' | 'front' | 'back' | 'tags' | 'source' | 'created_at' | 'updated_at' | 'generation_id'
>;

// Command model for creating a flashcard (POST /flashcards)
// We omit fields automatically managed by the system and enforce source as 'manual'
export interface CreateFlashcardCommand extends Omit<FlashcardInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'> {
  source: Source;
  generation_id?: string | null; // Optional for 'ai' and 'ai_edited', can be null
}

// Command model for updating a flashcard (PUT /flashcards/{flashcardId})
// All fields are optional as per the API specification
export type UpdateFlashcardCommand = Partial<Pick<FlashcardUpdate, 'title' | 'front' | 'back' | 'tags'>>;

// Command model for retrieving flashcards (GET /flashcards)
// Contains query parameters for pagination and filtering
export interface GetFlashcardsCommand {
  limit: number;
  offset: number;
  tag?: string;
}

// 2. Generations

export type Source = 'ai' | 'ai_edited' | 'manual';

export type FlashcardProposalState = ValueOf<typeof FLASHCARD_PROPOSAL_STATE>;

// DTO for a flashcard proposal within a generation session
// These proposals are not stored in the flashcards table and have a fixed source value of 'ai'
export type ProposalFlashcardDto = Pick<Flashcard, 'id' | 'title' | 'front' | 'back' | 'tags' | 'source'> & {
  state: FlashcardProposalState;
};

// DTO for a generation session returned by GET /generations/{generationId}
// We omit the user_id field as it is not exposed in the API response
export type GenerationDto = Omit<Generation, 'user_id'> & {
  flashcards_proposals: ProposalFlashcardDto[];
};

export type ValueOf<T> = T[keyof T];

// Command model for starting a generation session (POST /generations)
// Accepts the input text and optional metadata; the processing of generation_duration and counts is handled internally
export interface StartGenerationCommand {
  input_text: string;
  metadata?: Record<string, unknown>;
}

// 3. Generation Error Logs

// DTO for error logs returned by GET /generations/{generationId}/error_logs
export type GenerationErrorLogDto = Pick<GenerationErrorLog, 'id' | 'error_details' | 'created_at'>;

// New types for OpenRouterService
export interface ModelConfig {
  modelName: string;
  parameters: {
    max_tokens: number;
    [key: string]: unknown;
  };
}

export interface FlashcardResponse {
  flashcards: {
    title: string;
    front: string;
    back: string;
    tags: string[];
    relevance: number;
  }[];
}

export interface APIResponse {
  type: string;
  data: FlashcardResponse['flashcards'];
}

export interface ParsedResponse {
  title: string;
  front: string;
  back: string;
  tags: string[];
  relevance: number;
}
