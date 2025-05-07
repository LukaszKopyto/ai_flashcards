import { computed, ref, type Ref } from 'vue';
import { z } from 'zod';

export function useFormValidation<T extends z.ZodType>(schema: T, formData: Ref<z.infer<T>>) {
  if (typeof formData.value !== 'object' || formData.value === null) {
    throw new Error('formData must be an object');
  }

  type FormData = z.infer<T>;
  type FieldKeys = FormData extends object ? keyof FormData : never;

  const touchedFields = ref(new Set<string>());
  const isSubmitted = ref(false);

  const _validationErrors = computed(() => {
    const result = schema.safeParse(formData.value);
    if (!result.success) {
      return result.error.flatten().fieldErrors;
    }
    return {};
  });

  const visibleErrors = computed(() => {
    if (!isSubmitted.value && touchedFields.value.size === 0) {
      return {};
    }

    const errors: Record<string, string[]> = {};
    Object.entries(_validationErrors.value).forEach(([field, fieldErrors]) => {
      if (isSubmitted.value || touchedFields.value.has(field)) {
        errors[field] = fieldErrors as string[];
      }
    });
    return errors;
  });

  const isValid = computed(() => Object.keys(_validationErrors.value).length === 0);

  const setFieldTouched = (field: FieldKeys) => {
    touchedFields.value.add(field as string);
  };

  const _resetTouched = () => {
    touchedFields.value.clear();
    isSubmitted.value = false;
  };

  const resetForm = () => {
    if (schema instanceof z.ZodObject) {
      Object.keys(schema.shape).forEach((key) => {
        (formData.value as z.infer<T>)[key] = '';
      });
    }
    _resetTouched();
  };

  const handleSubmit = () => {
    isSubmitted.value = true;
    return isValid.value;
  };

  return {
    validationErrors: visibleErrors,
    isValid,
    resetForm,
    setFieldTouched,
    handleSubmit,
  };
}
