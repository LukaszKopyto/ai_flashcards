import { ref } from 'vue';
import type { ProposalFlashcardDto } from '../types';
import { FLASHCARD_PROPOSAL_STATE } from '../lib/constants';
import { toast } from 'vue-sonner';

export function useFlashcardsBulkOperations() {
  const isSavingBulk = ref(false);

  const bulkSaveFlashcards = async (
    flashcards: ProposalFlashcardDto[],
    generationId: string | null
  ): Promise<boolean> => {
    const flashcardsToSave = flashcards.filter(
      (f) => f.state !== FLASHCARD_PROPOSAL_STATE.ACCEPTED
    );

    if (flashcardsToSave.length === 0) {
      toast.info('No flashcards to save');
      return false;
    }

    try {
      isSavingBulk.value = true;
      toast.loading(`Saving ${flashcardsToSave.length} flashcards...`);

      const results = await Promise.allSettled(
        flashcardsToSave.map((flashcard) =>
          fetch('/api/flashcards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...flashcard,
              generation_id: generationId,
            }),
          })
        )
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed > 0) {
        toast.error(`Failed to save ${failed} flashcards`);
      }
      
      if (successful > 0) {
        toast.success(`Successfully saved ${successful} flashcards`);
      }

      return successful > 0;
    } catch (error) {
      console.error('Error saving flashcards in bulk:', error);
      toast.error('Failed to save flashcards. Please try again.');
      return false;
    } finally {
      isSavingBulk.value = false;
      toast.dismiss();
    }
  };

  return {
    isSavingBulk,
    bulkSaveFlashcards,
  };
} 