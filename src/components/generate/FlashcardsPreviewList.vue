<script setup lang="ts">
import type { ProposalFlashcardDto } from '../../types';
import FlashcardCard from './FlashcardCard.vue';

interface Props {
  flashcards: ProposalFlashcardDto[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'accept', flashcard: ProposalFlashcardDto): void;
  (e: 'edit', flashcard: ProposalFlashcardDto): void;
  (e: 'reject', flashcard: ProposalFlashcardDto): void;
}>();
</script>

<template>
  <div v-if="flashcards.length > 0" class="space-y-6">
    <h2 class="text-xl font-semibold">Generated Flashcards</h2>
    <div class="grid gap-4">
      <FlashcardCard
        v-for="flashcard in flashcards"
        :key="flashcard.id"
        :flashcard="flashcard"
        @accept="emit('accept', flashcard)"
        @edit="emit('edit', flashcard)"
        @reject="emit('reject', flashcard)"
      />
    </div>
  </div>
</template>
