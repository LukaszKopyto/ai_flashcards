<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

defineProps<{
  isOpen: boolean;
  title: string;
  description: string;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const handleConfirm = () => {
  emit('confirm');
  emit('update:isOpen', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:isOpen', false);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2">
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button variant="destructive" @click="handleConfirm">Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
