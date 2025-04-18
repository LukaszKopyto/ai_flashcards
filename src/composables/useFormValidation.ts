import { computed, ref } from 'vue'
import type { z } from 'zod'

export function useFormValidation<T extends z.ZodType>(schema: T) {
  type FormData = z.infer<T>
  type FieldKeys = Extract<keyof FormData, string>

  const formData = ref<FormData>({} as FormData)
  const touchedFields = ref(new Set<string>())
  const isSubmitted = ref(false)

  const _validationErrors = computed(() => {
    const result = schema.safeParse(formData.value)
    if (!result.success) {
      return result.error.flatten().fieldErrors
    }
    return {}
  })

  const visibleErrors = computed(() => {
    if (!isSubmitted.value && touchedFields.value.size === 0) {
      return {}
    }

    const errors: Record<string, string[]> = {}
    Object.entries(_validationErrors.value).forEach(([field, fieldErrors]) => {
      if (isSubmitted.value || touchedFields.value.has(field)) {
        errors[field] = fieldErrors as string[]
      }
    })
    return errors
  })

  const isValid = computed(() => Object.keys(_validationErrors.value).length === 0)

  const setFieldTouched = (field: FieldKeys) => {
    touchedFields.value.add(field)
  }

  const _resetTouched = () => {
    touchedFields.value.clear()
    isSubmitted.value = false
  }

  const resetForm = (defaultValues?: Partial<FormData>) => {
    formData.value = defaultValues ? { ...defaultValues } as FormData : {} as FormData
    _resetTouched()
  }

  const handleSubmit = () => {
    isSubmitted.value = true
    return isValid.value
  }

  return {
    formData,
    validationErrors: visibleErrors,
    isValid,
    resetForm,
    setFieldTouched,
    handleSubmit,
  }
} 