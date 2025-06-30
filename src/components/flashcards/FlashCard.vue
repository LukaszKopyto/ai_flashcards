<script setup lang="ts">
import { computed } from 'vue';
import type { ProposalFlashcardDto, FlashcardDto } from '@/types';
import { FLASHCARD_PROPOSAL_STATE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Edit } from 'lucide-vue-next';

interface Props {
  flashcard: ProposalFlashcardDto | FlashcardDto;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  accept: [];
  edit: [];
  reject: [];
}>();

const isProposal = computed(() => 'state' in props.flashcard);
const proposalState = computed(() => (isProposal.value ? (props.flashcard as ProposalFlashcardDto).state : null));

const cardClasses = computed(() => {
  if (!isProposal.value) {
    return 'border-slate-200 hover:-translate-y-1 hover:shadow-lg';
  }
  switch (proposalState.value) {
    case FLASHCARD_PROPOSAL_STATE.ACCEPTED:
      return 'border-green-500';
    case FLASHCARD_PROPOSAL_STATE.EDITED:
      return 'border-blue-200';
    default:
      return 'border-gray-200';
  }
});
</script>

<template>
  <Card class="flex w-full flex-col transition-all" :class="cardClasses">
    <CardHeader class="relative">
      <CheckCircle2
        v-if="proposalState === FLASHCARD_PROPOSAL_STATE.ACCEPTED"
        class="absolute top-0 right-6 h-7 w-7 text-green-500"
      />
      <Edit
        v-if="proposalState === FLASHCARD_PROPOSAL_STATE.EDITED"
        class="absolute top-0 right-6 h-7 w-7 text-blue-400"
      />
      <CardTitle
        class="text-lg"
        :class="{
          'text-blue-700': proposalState === FLASHCARD_PROPOSAL_STATE.EDITED,
        }"
      >
        {{ flashcard.title }}
      </CardTitle>
      <CardDescription v-if="flashcard.tags && flashcard.tags.length > 0" class="flex flex-wrap gap-2 pt-2">
        <span
          v-for="(tag, index) in flashcard.tags"
          :key="`tag-${index}`"
          class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          :class="{
            'bg-blue-50': proposalState === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          {{ tag }}
        </span>
      </CardDescription>
    </CardHeader>

    <CardContent class="grid flex-grow gap-4">
      <div>
        <h4
          class="mb-2 text-sm font-medium"
          :class="{
            'text-blue-700': proposalState === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          Front
        </h4>
        <p
          class="text-sm"
          :class="{
            'text-slate-600': !isProposal || proposalState !== FLASHCARD_PROPOSAL_STATE.EDITED,
            'text-blue-600': proposalState === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          {{ flashcard.front }}
        </p>
      </div>
      <div>
        <h4
          class="mb-2 text-sm font-medium"
          :class="{
            'text-blue-700': proposalState === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          Back
        </h4>
        <p
          class="text-sm"
          :class="{
            'text-slate-600': !isProposal || proposalState !== FLASHCARD_PROPOSAL_STATE.EDITED,
            'text-blue-600': proposalState === FLASHCARD_PROPOSAL_STATE.EDITED,
          }"
        >
          {{ flashcard.back }}
        </p>
      </div>
    </CardContent>

    <CardFooter v-if="isProposal" class="flex justify-end gap-2">
      <template v-if="proposalState === FLASHCARD_PROPOSAL_STATE.INITIAL">
        <Button size="sm" @click="emit('accept')"> Accept </Button>
        <Button variant="outline" size="sm" @click="emit('reject')"> Reject </Button>
        <Button variant="outline" size="sm" @click="emit('edit')"> Edit </Button>
      </template>
    </CardFooter>
  </Card>
</template>
