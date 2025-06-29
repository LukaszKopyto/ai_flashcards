import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { GET } from './index';
import { FlashcardService } from '@/lib/services/flashcard.service';
import type { PaginatedResponse, FlashcardDto } from '@/types';

vi.mock('@/lib/services/flashcard.service');

describe('GET /api/flashcards', () => {
  let mockFlashcardService: {
    getFlashcards: MockedFunction<(command: unknown, userId: string) => Promise<PaginatedResponse<FlashcardDto>>>;
  };
  let mockSupabase: Record<string, unknown>;
  let mockLocals: Record<string, unknown>;
  let mockUrl: URL;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFlashcardService = {
      getFlashcards: vi.fn(),
    };

    (FlashcardService as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockFlashcardService);

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    };

    mockUrl = new URL('http://localhost:4321/api/flashcards');
  });

  describe('Authorization', () => {
    it('should return 500 when supabase is unavailable', async () => {
      mockLocals = {
        supabase: null,
        session: null,
      };

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(body).toMatchInlineSnapshot(`
        {
          "error": "Authentication service unavailable",
        }
      `);
    });

    it('should return 401 when session is missing', async () => {
      mockLocals = {
        supabase: mockSupabase,
        session: null,
        user: null,
      };

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(body).toMatchInlineSnapshot(`
        {
          "error": "Unauthorized",
        }
      `);
    });

    it('should proceed when both supabase and session are available', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      mockLocals = {
        supabase: mockSupabase,
        session: mockSession,
      };

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 10,
          offset: 0,
          tag: undefined,
        },
        'user-123'
      );
    });
  });

  describe('Query Parameter Validation', () => {
    beforeEach(() => {
      mockLocals = {
        supabase: mockSupabase,
        session: { user: { id: 'user-123' } },
      };
    });

    it('should use default values when no query parameters provided', async () => {
      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 10,
          offset: 0,
          tag: undefined,
        },
        'user-123'
      );
    });

    it('should parse valid query parameters correctly', async () => {
      mockUrl.searchParams.set('limit', '20');
      mockUrl.searchParams.set('offset', '5');
      mockUrl.searchParams.set('tag', 'javascript');

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 20,
          offset: 5,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 20,
          offset: 5,
          tag: 'javascript',
        },
        'user-123'
      );
    });

    it('should coerce string numbers to integers', async () => {
      mockUrl.searchParams.set('limit', '15');
      mockUrl.searchParams.set('offset', '10');

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 15,
          offset: 10,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      const _response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 15,
          offset: 10,
          tag: undefined,
        },
        'user-123'
      );
    });

    it('should return 400 for negative limit', async () => {
      mockUrl.searchParams.set('limit', '-5');

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid query parameters');
      expect(body.details).toBeDefined();
    });

    it('should return 400 for negative offset', async () => {
      mockUrl.searchParams.set('offset', '-1');

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid query parameters');
      expect(body.details).toBeDefined();
    });

    it('should return 400 for zero limit', async () => {
      mockUrl.searchParams.set('limit', '0');

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid query parameters');
      expect(body.details).toBeDefined();
    });

    it('should return 400 for non-numeric limit', async () => {
      mockUrl.searchParams.set('limit', 'invalid');

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid query parameters');
      expect(body.details).toBeDefined();
    });

    it('should handle empty tag parameter', async () => {
      mockUrl.searchParams.set('tag', '');

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 10,
          offset: 0,
          tag: '',
        },
        'user-123'
      );
    });
  });

  describe('Business Logic', () => {
    beforeEach(() => {
      mockLocals = {
        supabase: mockSupabase,
        session: { user: { id: 'user-123' } },
      };
    });

    it('should return paginated flashcards successfully', async () => {
      // Arrange
      const mockFlashcards: FlashcardDto[] = [
        {
          id: '1',
          title: 'Test Card 1',
          front: 'Question 1',
          back: 'Answer 1',
          tags: ['tag1'],
          source: 'manual',
          generation_id: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Test Card 2',
          front: 'Question 2',
          back: 'Answer 2',
          tags: ['tag2'],
          source: 'ai',
          generation_id: 'gen-123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: mockFlashcards,
        pagination: {
          total: 25,
          limit: 10,
          offset: 0,
        },
      };

      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      // Act
      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(body).toEqual(mockResponse);
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledTimes(1);
    });

    it('should pass correct parameters to FlashcardService', async () => {
      // Arrange
      mockUrl.searchParams.set('limit', '5');
      mockUrl.searchParams.set('offset', '15');
      mockUrl.searchParams.set('tag', 'programming');

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 5,
          offset: 15,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      // Act
      await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      // Assert
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 5,
          offset: 15,
          tag: 'programming',
        },
        'user-123'
      );
    });

    it('should create FlashcardService with correct supabase client', async () => {
      // Arrange
      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      // Act
      await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      // Assert
      expect(FlashcardService).toHaveBeenCalledWith(mockSupabase);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockLocals = {
        supabase: mockSupabase,
        session: { user: { id: 'user-123' } },
      };
    });

    it('should handle FlashcardService errors gracefully', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockFlashcardService.getFlashcards.mockRejectedValue(serviceError);

      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Act
      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(body).toMatchInlineSnapshot(`
        {
          "error": "Internal server error",
          "message": "Database connection failed",
        }
      `);
      expect(consoleSpy).toHaveBeenCalledWith('Error in GET /flashcards:', serviceError);

      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should handle unknown errors gracefully', async () => {
      // Arrange
      mockFlashcardService.getFlashcards.mockRejectedValue('Unknown error');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Act
      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(body).toMatchInlineSnapshot(`
        {
          "error": "Internal server error",
          "message": "Unknown error occurred",
        }
      `);

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockLocals = {
        supabase: mockSupabase,
        session: { user: { id: 'user-123' } },
      };
    });

    it('should handle very large limit values', async () => {
      // Arrange
      mockUrl.searchParams.set('limit', '999999');

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 999999,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      // Act
      await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      // Assert
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 999999,
          offset: 0,
          tag: undefined,
        },
        'user-123'
      );
    });

    it('should handle special characters in tag parameter', async () => {
      // Arrange
      const specialTag = 'tag with spaces & symbols!@#$%';
      mockUrl.searchParams.set('tag', specialTag);

      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      // Act
      await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);

      // Assert
      expect(mockFlashcardService.getFlashcards).toHaveBeenCalledWith(
        {
          limit: 10,
          offset: 0,
          tag: specialTag,
        },
        'user-123'
      );
    });

    it('should handle empty response from service', async () => {
      // Arrange
      const mockResponse: PaginatedResponse<FlashcardDto> = {
        data: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
        },
      };
      mockFlashcardService.getFlashcards.mockResolvedValue(mockResponse);

      // Act
      const response = await GET({ locals: mockLocals, url: mockUrl } as unknown as Parameters<typeof GET>[0]);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });
});
