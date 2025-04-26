import { expect, describe, it, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { z } from 'zod'
import { useFormValidation } from '../useFormValidation'

describe('useFormValidation', () => {
  const testSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
    age: z.number().min(18, 'Must be at least 18 years old'),
  })

  type TestFormData = z.infer<typeof testSchema>

  let formData: Ref<TestFormData>

  beforeEach(() => {
    formData = ref<TestFormData>({
      name: '',
      email: '',
      age: 0,
    })
  })

  it('should initialize with no visible errors', () => {
    const { validationErrors } = useFormValidation(testSchema, formData)
    expect(validationErrors.value).toEqual({})
  })

  it('should detect validation errors but not show them initially', () => {
    const { validationErrors, isValid } = useFormValidation(testSchema, formData)
    
    expect(validationErrors.value).toEqual({})
    expect(isValid.value).toBe(false)
  })

  it('should show errors for touched fields', () => {
    const { validationErrors, setFieldTouched } = useFormValidation(testSchema, formData)
    
    setFieldTouched('name')
    
    expect(validationErrors.value).toHaveProperty('name')
    expect(validationErrors.value.name).toEqual(['Name must be at least 3 characters'])
    expect(Object.keys(validationErrors.value)).toHaveLength(1)
  })

  it('should show all errors after form submission', () => {
    const { validationErrors, handleSubmit } = useFormValidation(testSchema, formData)
    
    handleSubmit()
    
    expect(validationErrors.value).toHaveProperty('name')
    expect(validationErrors.value).toHaveProperty('email')
    expect(validationErrors.value).toHaveProperty('age')
  })

  it('should return valid status correctly when form data is valid', () => {
    formData.value = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    }
    
    const { isValid } = useFormValidation(testSchema, formData)
    
    expect(isValid.value).toBe(true)
  })

  it('should handle form submission correctly when valid', () => {
    formData.value = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    }
    
    const { handleSubmit } = useFormValidation(testSchema, formData)
    
    expect(handleSubmit()).toBe(true)
  })

  it('should handle form submission correctly when invalid', () => {
    const { handleSubmit } = useFormValidation(testSchema, formData)
    
    expect(handleSubmit()).toBe(false)
  })

  it('should properly execute callbacks on form submission', () => {
    formData.value = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    }
    
    const onSubmitValid = vi.fn()
    const onSubmitInvalid = vi.fn()
    
    const { handleSubmit } = useFormValidation(testSchema, formData)
    
    const isValid = handleSubmit()
    
    if (isValid) {
      onSubmitValid()
    } else {
      onSubmitInvalid()
    }
    
    expect(onSubmitValid).toHaveBeenCalledTimes(1)
    expect(onSubmitInvalid).not.toHaveBeenCalled()
    
    formData.value.name = ''
    
    const isInvalid = !handleSubmit()
    
    if (isInvalid) {
      onSubmitInvalid()
    } else {
      onSubmitValid()
    }
    
    expect(onSubmitValid).toHaveBeenCalledTimes(1)
    expect(onSubmitInvalid).toHaveBeenCalledTimes(1)
  })

  it('should reset form data correctly', () => {
    formData.value = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    }
    
    const { resetForm } = useFormValidation(testSchema, formData)
    
    resetForm()
    
    expect(formData.value.name).toBe('')
    expect(formData.value.email).toBe('')
    expect(formData.value.age).toBe('')
  })

  it('should handle complex schema types during reset', () => {
    const complexSchema = z.object({
      name: z.string(),
      isActive: z.boolean(),
      count: z.number(),
      tags: z.array(z.string()),
      nested: z.object({
        key: z.string()
      })
    })
    
    type ComplexFormData = z.infer<typeof complexSchema>
    
    const complexFormData = ref<ComplexFormData>({
      name: 'Test',
      isActive: true,
      count: 42,
      tags: ['one', 'two'],
      nested: { key: 'value' }
    })
    
    const { resetForm } = useFormValidation(complexSchema, complexFormData)
    
    resetForm()
    
    expect(complexFormData.value.name).toBe('')
    expect(complexFormData.value.isActive).toBe('')
    expect(complexFormData.value.count).toBe('')
    expect(complexFormData.value.tags).toBe('')
    expect(complexFormData.value.nested).toBe('')
  })

  it('should clear validation state after form submission', () => {
    const { handleSubmit, validationErrors, resetForm } = useFormValidation(testSchema, formData)
    
    handleSubmit()
    expect(Object.keys(validationErrors.value).length).toBeGreaterThan(0)
    
    resetForm()
    
    expect(Object.keys(validationErrors.value)).toHaveLength(0)
  })

  it('should clear touched fields on reset', () => {
    const { setFieldTouched, resetForm, validationErrors } = useFormValidation(testSchema, formData)
    
    setFieldTouched('name')
    expect(validationErrors.value).toHaveProperty('name')
    
    resetForm()
    expect(validationErrors.value).toEqual({})
  })

  it('should throw error for non-object form data', () => {
    const invalidFormData = ref('not an object')
    
    // @ts-expect-error - Intentionally testing invalid type
    expect(() => useFormValidation(testSchema, invalidFormData)).toThrow('formData must be an object')
  })

  it('should handle null form data case', () => {
    const nullFormData = ref(null)
    
    // @ts-expect-error - Intentionally testing null
    expect(() => useFormValidation(testSchema, nullFormData)).toThrow('formData must be an object')
  })
}) 