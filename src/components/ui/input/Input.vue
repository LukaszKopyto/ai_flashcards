<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  type?: string;
  error?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  class: '',
  error: '',
});

const model = defineModel<string>({ default: '' });

const inputClass = computed(() => {
  return cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    props.error && 'border-red-500 focus-visible:ring-red-500',
    props.class
  );
});
</script>

<template>
  <input v-model="model" :type="type" :class="inputClass" v-bind="$attrs" :data-testid="`${id}-input`" />
  <p v-if="error" class="mt-1 text-sm text-red-500" data-testid="error-message">
    {{ error }}
  </p>
</template>
