import { ref } from 'vue';
import type { FlashcardDto, PaginatedResponse, GetFlashcardsCommand } from '../types';
import { toast } from 'vue-sonner';

export function useMyFlashcards() {
  const flashcards = ref<FlashcardDto[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchFlashcards = async ({ limit = 10, offset = 0, tag = '' }: GetFlashcardsCommand) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`/api/flashcards?limit=${limit}&offset=${offset}&tag=${tag}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch flashcards');
      }
      const data: PaginatedResponse<FlashcardDto> = await response.json();
      flashcards.value = data.data;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      error.value = message;
      toast.error(message);
      console.error('Error fetching flashcards:', e);
    } finally {
      isLoading.value = false;
    }
  };

  return { flashcards, isLoading, error, fetchFlashcards };
}
