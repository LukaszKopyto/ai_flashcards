<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { type ButtonVariants, buttonVariants } from '.';
import { Loader2 } from 'lucide-vue-next';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loading: false,
});
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :disabled="props.loading || $attrs.disabled"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <template v-if="props.loading">
      <Loader2 class="mr-2 inline-block animate-spin" :size="16" />
      <span><slot /></span>
    </template>
    <template v-else>
      <slot />
    </template>
  </Primitive>
</template>
