import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { useMyFlashcards } from '../useMyFlashcards';
import type { FlashcardDto, PaginatedResponse } from '../../types';

vi.mock('vue-sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useMyFlashcards', () => {
  const mockFlashcards: FlashcardDto[] = [
    {
      id: '1',
      title: 'Test 1',
      front: 'Front 1',
      back: 'Back 1',
      tags: ['tag1'],
      source: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      generation_id: 'gen-123',
    },
    {
      id: '2',
      title: 'Test 2',
      front: 'Front 2',
      back: 'Back 2',
      tags: ['tag2'],
      source: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      generation_id: 'gen-456',
    },
  ];

  const mockPaginatedResponse: PaginatedResponse<FlashcardDto> = {
    data: mockFlashcards,
    pagination: {
      total: 2,
      limit: 10,
      offset: 0,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch flashcards successfully', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPaginatedResponse),
    });

    const { flashcards, isLoading, error, fetchFlashcards } = useMyFlashcards();

    expect(isLoading.value).toBe(false);
    const fetchPromise = fetchFlashcards();
    expect(isLoading.value).toBe(true);

    await fetchPromise;

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(null);
    expect(flashcards.value).toEqual(mockFlashcards);
    expect(fetch).toHaveBeenCalledWith('/api/flashcards');
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch';
    (fetch as Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    });

    const { toast } = await import('vue-sonner');
    const { flashcards, isLoading, error, fetchFlashcards } = useMyFlashcards();

    await fetchFlashcards();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(errorMessage);
    expect(flashcards.value).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network failure');
    (fetch as Mock).mockRejectedValue(networkError);

    const { toast } = await import('vue-sonner');
    const { flashcards, isLoading, error, fetchFlashcards } = useMyFlashcards();

    await fetchFlashcards();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(networkError.message);
    expect(flashcards.value).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith(networkError.message);
  });
});
