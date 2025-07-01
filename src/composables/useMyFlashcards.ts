import { ref } from 'vue';
import type { FlashcardDto, PaginatedResponse } from '../types';
import { toast } from 'vue-sonner';

const PAGE_SIZE = 20;

export function useMyFlashcards() {
  const flashcards = ref<FlashcardDto[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const hasMore = ref<boolean>(true);
  const isFetchingMore = ref<boolean>(false);

  const loadMoreFlashcards = async (tag?: string) => {
    if (isFetchingMore.value || !hasMore.value) return;
    // Use the main isLoading flag only for the very first fetch
    const isInitialLoad = flashcards.value.length === 0;
    if (isInitialLoad) {
      isLoading.value = true;
    } else {
      isFetchingMore.value = true;
    }
    error.value = null;

    try {
      const offset = flashcards.value.length;
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: offset.toString(),
      });
      if (typeof tag === 'string' && tag) {
        params.append('tag', tag);
      }
      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch flashcards');
      }
      const data: PaginatedResponse<FlashcardDto> = await response.json();
      flashcards.value.push(...data.data);

      if (flashcards.value.length >= data.pagination.total) {
        hasMore.value = false;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      error.value = message;
      toast.error(message);
      console.error('Error fetching flashcards:', e);
    } finally {
      if (isInitialLoad) {
        isLoading.value = false;
      } else {
        isFetchingMore.value = false;
      }
    }
  };

  return { flashcards, isLoading, error, hasMore, isFetchingMore, loadMoreFlashcards };
}
