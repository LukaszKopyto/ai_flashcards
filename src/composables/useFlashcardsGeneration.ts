import { ref } from 'vue';
import type { ProposalFlashcardDto } from '../types';
import { toast } from 'vue-sonner';

export function useFlashcardsGeneration() {
  const isGenerating = ref(false);
  const lastGenerationId = ref<string | null>(null);
  const flashcardsList = ref<ProposalFlashcardDto[]>([]);

  const generateFlashcards = async (inputText: string) => {
    toast.info('Generating flashcards...');
    try {
      isGenerating.value = true;
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: inputText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      lastGenerationId.value = data.id;
      flashcardsList.value = data.flashcards_proposals;
      toast.success('Successfully generated flashcards');
      return data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards. Please try again.');
      return null;
    } finally {
      isGenerating.value = false;
    }
  };

  return {
    isGenerating,
    flashcardsList,
    lastGenerationId,
    generateFlashcards,
  };
} 