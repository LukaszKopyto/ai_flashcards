import { ref } from 'vue';
import type { GenerationDto, ProposalFlashcardDto } from '../types';
import { FLASHCARD_PROPOSAL_STATE } from '../lib/constants';
import { toast } from 'vue-sonner';

export function useFlashcards() {
  const isGenerating = ref(false);
  const generationResponse = ref<GenerationDto | null>(null);
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
      generationResponse.value = data;
      flashcardsList.value = data.flashcards_proposals;
      toast.success('Successfully generated flashcards');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      isGenerating.value = false;
    }
  };

  const acceptFlashcard = async (flashcard: ProposalFlashcardDto) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...flashcard,
          generation_id: generationResponse.value?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flashcard');
      }

      // Mark flashcard as accepted
      flashcardsList.value = flashcardsList.value.map((f) =>
        f.id === flashcard.id ? { ...f, state: FLASHCARD_PROPOSAL_STATE.ACCEPTED } : f
      );
      toast.success('Flashcard saved successfully');
    } catch (error) {
      console.error('Error saving flashcard:', error);
      toast.error('Failed to save flashcard. Please try again.');
    }
  };

  const saveEditedFlashcard = (updatedFlashcard: ProposalFlashcardDto) => {
    flashcardsList.value = flashcardsList.value.map((f) =>
      f.id === updatedFlashcard.id ? { ...updatedFlashcard, state: FLASHCARD_PROPOSAL_STATE.EDITED } : f
    );
    toast.success('Flashcard updated successfully');
  };

  const rejectFlashcard = (flashcard: ProposalFlashcardDto) => {
    flashcardsList.value = flashcardsList.value.map((f) =>
      f.id === flashcard.id ? { ...f, state: FLASHCARD_PROPOSAL_STATE.REJECTED } : f
    );
    toast.info('Flashcard rejected');
  };

  return {
    isGenerating,
    flashcardsList,
    generateFlashcards,
    acceptFlashcard,
    saveEditedFlashcard,
    rejectFlashcard,
  };
}
