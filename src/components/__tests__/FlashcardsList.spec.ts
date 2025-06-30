import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import flushPromises from 'flush-promises';
import FlashcardsList from '@/components/flashcards/FlashcardsList.vue';
import type { FlashcardDto } from '@/types';

describe('FlashcardsList.vue', () => {
  const mockFlashcards: FlashcardDto[] = [
    {
      id: '1',
      title: 'Vue Basics',
      front: 'What is Vue?',
      back: 'A progressive framework.',
      tags: ['vue', 'frontend'],
      source: 'manual',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      generation_id: 'gen-123',
    },
    {
      id: '2',
      title: 'Astro Basics',
      front: 'What is Astro?',
      back: 'A web framework for content-driven websites.',
      tags: ['astro', 'ssg'],
      source: 'manual',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      generation_id: 'gen-456',
    },
  ];

  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('displays a loading state initially and then renders the list of flashcards', async () => {
    server.use(
      http.get('/api/flashcards', () => {
        return HttpResponse.json({ data: mockFlashcards, pagination: { total: 2 } });
      })
    );

    const wrapper = mount(FlashcardsList);

    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false);

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true);

    await flushPromises();

    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false);
    const cards = wrapper.findAll('[data-testid="flashcard-item"]');
    expect(cards.length).toBe(2);
    expect(cards[0].text()).toContain('Vue Basics');
    expect(cards[1].text()).toContain('Astro Basics');
  });

  it('displays an error message when fetching fails', async () => {
    server.use(
      http.get('/api/flashcards', () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      })
    );

    const wrapper = mount(FlashcardsList);
    await flushPromises();

    expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Oops! Something went wrong.');
    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false);
  });

  it('displays an empty state when there are no flashcards', async () => {
    server.use(
      http.get('/api/flashcards', () => {
        return HttpResponse.json({ data: [], pagination: { total: 0 } });
      })
    );

    const wrapper = mount(FlashcardsList);
    await flushPromises();

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No flashcards yet');
    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="flashcard-item"]').exists()).toBe(false);
  });
});
