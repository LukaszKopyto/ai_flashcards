import type { Ref } from 'vue';
import type { ProposalFlashcardDto } from '../types';
import { FLASHCARD_PROPOSAL_STATE } from '../lib/constants';
import { toast } from 'vue-sonner';

interface FlashcardsManagementOptions {
  lastGenerationId: Ref<string | null>;
  flashcardsList: Ref<ProposalFlashcardDto[]>;
}

export function useFlashcardsManagement(options: FlashcardsManagementOptions) {
  const { lastGenerationId, flashcardsList } = options;

  const createEmptyFlashcard = (): ProposalFlashcardDto => ({
    id: '',
    title: '',
    front: '',
    back: '',
    tags: [],
    source: 'manual',
    state: FLASHCARD_PROPOSAL_STATE.INITIAL,
  });

  const acceptFlashcard = async (flashcard: ProposalFlashcardDto) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...flashcard,
          generation_id: lastGenerationId.value,
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
    flashcardsList.value = flashcardsList.value.filter((f) => f.id !== flashcard.id);
    toast.info('Flashcard rejected');
  };

  return {
    acceptFlashcard,
    saveEditedFlashcard,
    rejectFlashcard,
    createEmptyFlashcard,
  };
}
