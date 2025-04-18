import { computed, type Ref } from 'vue';
import { z } from 'zod';

interface TextValidationOptions {
  minChars: number;
  maxChars: number;
}


export function useTextValidation(text: Ref<string>, options: TextValidationOptions) {
    const textSchema = z.string()
    .min(options.minChars, `Please enter at least ${options.minChars} characters`)
    .max(options.maxChars, `Text cannot be longer than ${options.maxChars} characters`);

  const charCount = computed<number>(() => text.value.length);
  const validationResult = computed(() => textSchema.safeParse(text.value));
  
  const isValid = computed<boolean>(() => validationResult.value.success);
  
  const validationMessage = computed<string>(() => {
    if (validationResult.value.success) return '';
    return validationResult.value.error?.errors[0].message ?? '';
  });

  return {
    charCount,
    isValid,
    validationMessage,
  };
} 