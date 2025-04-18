<script setup lang="ts">
import { ref } from 'vue';
import type { ProposalFlashcardDto } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import TextArea from '@/components/ui/textarea/Textarea.vue';
import FlashcardsPreviewList from '@/components/generate/FlashcardsPreviewList.vue';
import EditModal from '@/components/generate/EditModal.vue';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'vue-sonner';
import { useTextValidation } from '@/composables/useTextValidation';
import { useFlashcardsGeneration } from '@/composables/useFlashcardsGeneration';
import { useFlashcardsManagement } from '@/composables/useFlashcardsManagement';
import { useFlashcardsBulkOperations } from '@/composables/useFlashcardsBulkOperations';
import ConfirmDialog from '@/components/generate/ConfirmDialog.vue';
import { useFlashcardsModals } from '@/composables/useFlashcardsModals';

const rawInput = ref('');
const { charCount, isValid, validationMessage } = useTextValidation(rawInput, {
  minChars: 1000,
  maxChars: 10000,
});
const { isGenerating, flashcardsList, lastGenerationId, generateFlashcards } = useFlashcardsGeneration();
const handleGenerate = () => generateFlashcards(rawInput.value);

const { acceptFlashcard, saveEditedFlashcard, rejectFlashcard, createEmptyFlashcard } = useFlashcardsManagement({
  lastGenerationId,
  flashcardsList,
});

const handleSave = (flashcard: ProposalFlashcardDto) => {
  if (flashcardsList.value.find((f) => f.id === flashcard.id)) {
    saveEditedFlashcard(flashcard);
  } else {
    acceptFlashcard(flashcard);
  }
};

const {
  isEditModalOpen,
  editingFlashcard,
  openEditModal,
  handleSaveEditedFlashcard,
  isConfirmDialogOpen,
  handleRejectClick,
  handleRejectConfirm,
  handleRejectCancel,
} = useFlashcardsModals({
  onSaveEdit: handleSave,
  onConfirmReject: rejectFlashcard,
});

const handleEditFlashcard = (flashcard: ProposalFlashcardDto) => {
  openEditModal(flashcard);
};

const handleAddNewFlashcard = () => {
  openEditModal(createEmptyFlashcard());
};

const handleClearFlashcards = () => {
  flashcardsList.value = [];
};

const { isSavingBulk, bulkSaveFlashcards } = useFlashcardsBulkOperations();
const handleBulkSave = async () => {
  const success = await bulkSaveFlashcards(flashcardsList.value, lastGenerationId.value);
  if (success) {
    rawInput.value = '';
    toast.success('All flashcards have been saved successfully');
    flashcardsList.value = [];
  } else {
    toast.error('Some flashcards could not be saved. Please try again or save them individually.');
  }
};
</script>

<template>
  <div class="container mx-auto space-y-8 py-8">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <Label for="input-text" class="text-lg font-semibold">Enter your text (1000-10000 characters)</Label>
        <div class="text-sm text-gray-500">{{ charCount }} characters</div>
      </div>
      <TextArea
        id="input-text"
        v-model="rawInput"
        placeholder="Paste your text here (minimum 1000 characters)"
        class="h-56"
      />
      <div class="flex items-center justify-between">
        <span v-if="!isValid && charCount > 0" class="text-sm text-red-500">
          {{ validationMessage }}
        </span>
        <span v-else class="invisible"><!-- Placeholder to maintain layout --></span>
        <div class="ml-auto flex gap-4">
          <Button @click="handleAddNewFlashcard" variant="outline"> Add Flashcard </Button>
          <Button
            @click="handleGenerate"
            :disabled="!isValid || isGenerating"
            :class="{ 'cursor-not-allowed opacity-50': !isValid || isGenerating }"
          >
            {{ isGenerating ? 'Generating...' : 'Generate Flashcards' }}
          </Button>
        </div>
      </div>
    </div>

    <FlashcardsPreviewList
      v-if="flashcardsList.length > 0"
      :flashcards="flashcardsList"
      @accept="acceptFlashcard"
      @edit="handleEditFlashcard"
      @reject="handleRejectClick"
    />

    <div v-if="flashcardsList.length > 0" class="flex justify-end">
      <Button @click="handleBulkSave" :disabled="isSavingBulk" variant="default" class="w-full sm:w-auto">
        {{ isSavingBulk ? 'Saving...' : 'Save All' }}
      </Button>
    </div>

    <EditModal v-model:isOpen="isEditModalOpen" :flashcard="editingFlashcard" @save="handleSaveEditedFlashcard" />

    <ConfirmDialog
      v-model:isOpen="isConfirmDialogOpen"
      title="Reject Flashcard"
      description="Are you sure you want to reject this flashcard? This action cannot be undone."
      @confirm="handleRejectConfirm"
      @cancel="handleRejectCancel"
    />

    <Toaster position="top-center" rich-colors close-button />
  </div>
</template>
