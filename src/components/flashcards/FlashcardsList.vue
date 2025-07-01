<script setup lang="ts">
import { onMounted } from 'vue';
import { useMyFlashcards } from '../../composables/useMyFlashcards';
import { Loader2, ServerCrash, Inbox } from 'lucide-vue-next';
import FlashcardCard from './FlashCard.vue';
import { Button } from '@/components/ui/button';
import { useVirtualList, useInfiniteScroll } from '@vueuse/core';

const { flashcards, isLoading, error, hasMore, isFetchingMore, loadMoreFlashcards } = useMyFlashcards();

onMounted(() => {
  loadMoreFlashcards();
});

const { list, containerProps, wrapperProps } = useVirtualList(flashcards, {
  itemHeight: 274,
  overscan: 5,
});

useInfiniteScroll(
  containerProps.ref,
  () => {
    loadMoreFlashcards();
  },
  {
    distance: 10,
    canLoadMore: () => hasMore.value && !isFetchingMore.value,
  }
);
</script>

<template>
  <div>
    <div
      v-if="isLoading"
      data-testid="loading-state"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <Loader2 class="h-12 w-12 animate-spin text-slate-400" />
      <p class="mt-4 text-lg text-slate-600">Loading your flashcards...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-state"
      class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-8 text-red-700"
    >
      <ServerCrash class="mb-4 h-12 w-12" />
      <h3 class="text-xl font-semibold">Oops! Something went wrong.</h3>
      <p>{{ error }}</p>
      <Button
        class="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        :disabled="isFetchingMore || !hasMore"
        @click="loadMoreFlashcards"
      >
        Try Again
      </Button>
    </div>

    <div
      v-else-if="flashcards.length === 0"
      data-testid="empty-state"
      class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center"
    >
      <Inbox class="mb-4 h-16 w-16 text-slate-400" />
      <h2 class="mb-2 text-2xl font-semibold text-slate-700">No flashcards yet</h2>
      <p class="text-slate-600">It looks like you haven't created any flashcards.</p>
      <a href="/generate" class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >Create your first flashcard!</a
      >
    </div>

    <div v-else v-bind="containerProps" class="h-[calc(100vh-200px)] overflow-y-auto" data-testid="flashcard-list">
      <div v-bind="wrapperProps">
        <div v-for="{ data: card } in list" :key="card.id" class="px-1 pb-6">
          <FlashcardCard :flashcard="card" data-testid="flashcard-item" class="h-[250px]" />
        </div>
        <div v-if="isFetchingMore" class="flex items-center justify-center p-4">
          <Loader2 class="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    </div>
  </div>
</template>
