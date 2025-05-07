import { ref } from 'vue';
import type { ProposalFlashcardDto } from '../types';

interface UseFlashcardsModalsOptions {
  onSaveEdit: (flashcard: ProposalFlashcardDto) => void;
  onConfirmReject: (flashcard: ProposalFlashcardDto) => void;
}

export function useFlashcardsModals(options: UseFlashcardsModalsOptions) {
  const { onSaveEdit, onConfirmReject } = options;

  const isEditModalOpen = ref(false);
  const editingFlashcard = ref<ProposalFlashcardDto | null>(null);

  const isConfirmDialogOpen = ref(false);
  const flashcardToReject = ref<ProposalFlashcardDto | null>(null);

  const openEditModal = (flashcard: ProposalFlashcardDto | null) => {
    editingFlashcard.value = flashcard;
    isEditModalOpen.value = true;
  };

  const handleSaveEditedFlashcard = (flashcard: ProposalFlashcardDto) => {
    onSaveEdit(flashcard);
    isEditModalOpen.value = false;
    editingFlashcard.value = null;
  };

  const handleRejectClick = (flashcard: ProposalFlashcardDto) => {
    flashcardToReject.value = flashcard;
    isConfirmDialogOpen.value = true;
  };

  const handleRejectConfirm = () => {
    if (flashcardToReject.value) {
      onConfirmReject(flashcardToReject.value);
      flashcardToReject.value = null;
    }
    isConfirmDialogOpen.value = false;
  };

  const handleRejectCancel = () => {
    flashcardToReject.value = null;
    isConfirmDialogOpen.value = false;
  };

  return {
    // Edit modal
    isEditModalOpen,
    editingFlashcard,
    openEditModal,
    handleSaveEditedFlashcard,

    // Confirm dialog
    isConfirmDialogOpen,
    handleRejectClick,
    handleRejectConfirm,
    handleRejectCancel,
  };
}
