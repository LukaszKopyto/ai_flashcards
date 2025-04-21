<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import type { ProposalFlashcardDto, UpdateFlashcardCommand } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFormValidation } from '@/composables/useFormValidation';

const MAX_TITLE_LENGTH = 100;
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

const flashcardSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`)
    .trim(),
  front: z
    .string()
    .min(1, 'Front content is required')
    .max(MAX_FRONT_LENGTH, `Front content must be less than ${MAX_FRONT_LENGTH} characters`)
    .trim(),
  back: z
    .string()
    .min(1, 'Back content is required')
    .max(MAX_BACK_LENGTH, `Back content must be less than ${MAX_BACK_LENGTH} characters`)
    .trim(),
  tags: z.string().optional(),
});

const props = defineProps<{
  isOpen: boolean;
  flashcard: ProposalFlashcardDto | null;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'save', flashcard: ProposalFlashcardDto): void;
}>();

type FlashcardFormData = z.infer<typeof flashcardSchema>;

const formData = ref<FlashcardFormData>({
  title: '',
  front: '',
  back: '',
  tags: '',
});

const { validationErrors, resetForm, setFieldTouched, handleSubmit } = useFormValidation(flashcardSchema, formData);

watch(
  () => props.flashcard,
  (newFlashcard) => {
    if (!newFlashcard) return;
    formData.value = {
      title: newFlashcard.title,
      front: newFlashcard.front,
      back: newFlashcard.back,
      tags: newFlashcard.tags.join(', '),
    };
  },
  { immediate: true }
);

const handleSave = () => {
  if (!handleSubmit() || !props.flashcard) return;

  const tags =
    formData.value.tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];

  emit('save', {
    ...props.flashcard,
    title: formData.value.title,
    front: formData.value.front,
    back: formData.value.back,
    tags,
  });
};

const handleClose = () => {
  emit('update:isOpen', false);
  resetForm();
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ flashcard?.id ? 'Edit Flashcard' : 'Create New Flashcard' }}</DialogTitle>
        <DialogDescription>
          {{ flashcard?.id ? 'Make changes to your flashcard here.' : 'Create a new flashcard manually.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Textarea
            id="title"
            v-model="formData.title"
            placeholder="Enter flashcard title"
            @blur="setFieldTouched('title')"
          />
          <span v-if="validationErrors.title" class="text-sm text-red-500">
            {{ validationErrors.title[0] }}
          </span>
        </div>

        <div class="grid gap-2">
          <Label for="front">Front Content</Label>
          <Textarea
            id="front"
            v-model="formData.front"
            placeholder="Enter front content"
            @blur="setFieldTouched('front')"
          />
          <span v-if="validationErrors.front" class="text-sm text-red-500">
            {{ validationErrors.front[0] }}
          </span>
        </div>

        <div class="grid gap-2">
          <Label for="back">Back Content</Label>
          <Textarea
            id="back"
            v-model="formData.back"
            placeholder="Enter back content"
            @blur="setFieldTouched('back')"
          />
          <span v-if="validationErrors.back" class="text-sm text-red-500">
            {{ validationErrors.back[0] }}
          </span>
        </div>

        <div class="grid gap-2">
          <Label for="tags">Tags (comma-separated)</Label>
          <Textarea
            id="tags"
            v-model="formData.tags"
            placeholder="Enter tags, separated by commas"
            @blur="setFieldTouched('tags')"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button type="submit" @click="handleSave"> Save </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
