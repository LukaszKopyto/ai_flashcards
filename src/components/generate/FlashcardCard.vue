<script setup lang="ts">
import type { ProposalFlashcardDto } from '../../types';
import { FLASHCARD_PROPOSAL_STATE } from '../../lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Edit } from 'lucide-vue-next';

interface Props {
  flashcard: ProposalFlashcardDto;
}

defineProps<Props>();

const emit = defineEmits<{
  accept: [];
  edit: [];
  reject: [];
}>();
</script>

<template>
  <Card
    class="w-full transition-colors"
    :class="{
      'border-green-500': flashcard.state === FLASHCARD_PROPOSAL_STATE.ACCEPTED,
      'border-blue-200': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
      'border-gray-200': flashcard.state === FLASHCARD_PROPOSAL_STATE.INITIAL,
    }"
  >
    <CardHeader class="relative">
      <CheckCircle2
        v-if="flashcard.state === FLASHCARD_PROPOSAL_STATE.ACCEPTED"
        class="absolute top-0 right-6 h-7 w-7 text-green-500"
      />
      <Edit
        v-if="flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED"
        class="absolute top-0 right-6 h-7 w-7 text-blue-400"
      />
      <CardTitle
        class="text-lg"
        :class="{
          'text-blue-700': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
        }"
      >
        {{ flashcard.title }}
      </CardTitle>
      <CardDescription v-if="flashcard.tags.length > 0" class="flex gap-2">
        <span
          v-for="(tag, index) in flashcard.tags"
          :key="`tag-${index}`"
          class="rounded bg-slate-100 px-2 py-1 text-xs"
          :class="{
            'bg-blue-50': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          {{ tag }}
        </span>
      </CardDescription>
    </CardHeader>

    <CardContent class="grid gap-4">
      <div>
        <h4
          class="mb-2 text-sm font-medium"
          :class="{
            'text-blue-700': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          Front
        </h4>
        <p
          class="text-sm"
          :class="{
            'text-slate-600':
              flashcard.state === FLASHCARD_PROPOSAL_STATE.INITIAL ||
              flashcard.state === FLASHCARD_PROPOSAL_STATE.ACCEPTED,
            'text-blue-600': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          {{ flashcard.front }}
        </p>
      </div>
      <div>
        <h4
          class="mb-2 text-sm font-medium"
          :class="{
            'text-blue-700': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          Back
        </h4>
        <p
          class="text-sm"
          :class="{
            'text-slate-600':
              flashcard.state === FLASHCARD_PROPOSAL_STATE.INITIAL ||
              flashcard.state === FLASHCARD_PROPOSAL_STATE.ACCEPTED,
            'text-blue-600': flashcard.state === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          {{ flashcard.back }}
        </p>
      </div>
    </CardContent>

    <CardFooter class="flex justify-end gap-2">
      <template v-if="flashcard.state === FLASHCARD_PROPOSAL_STATE.INITIAL">
        <Button size="sm" @click="emit('accept')"> Accept </Button>
        <Button variant="outline" size="sm" @click="emit('reject')"> Reject </Button>
        <Button variant="outline" size="sm" @click="emit('edit')"> Edit </Button>
      </template>
    </CardFooter>
  </Card>
</template>
