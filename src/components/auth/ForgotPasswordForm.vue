<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { Toaster } from '@/components/ui/sonner';
import { useFormValidation } from '@/composables/useFormValidation';
import { emailSchema, type EmailFormData } from '@/schemas/auth';

const formData = ref<EmailFormData>({
  email: '',
});

const {
  validationErrors,
  isValid,
  setFieldTouched,
  handleSubmit: validateForm,
} = useFormValidation(emailSchema, formData);

const isLoading = ref(false);
const isEmailSent = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset instructions');
    }

    isEmailSent.value = true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'An error occurred while sending reset instructions');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto max-w-md space-y-8 py-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Reset Password</h1>
      <p class="text-gray-500" v-if="!isEmailSent">
        Enter your email address and we'll send you instructions to reset your password
      </p>
      <p class="text-green-600" v-else>
        If an account exists for {{ formData.email }}, you will receive password reset instructions
      </p>
    </div>

    <form v-if="!isEmailSent" @submit="handleSubmit" class="space-y-6">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Enter your email"
          :error="validationErrors.email?.[0]"
          @blur="setFieldTouched('email')"
          required
        />
        <p v-if="validationErrors.email?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.email[0] }}
        </p>
      </div>

      <Button type="submit" :disabled="isLoading" :loading="isLoading" class="w-full"> Send Reset Instructions </Button>

      <div class="text-center text-sm">
        Remember your password?
        <a href="/login" class="text-blue-600 hover:text-blue-800"> Back to login </a>
      </div>
    </form>

    <div v-else class="text-center">
      <a href="/login">
        <Button variant="outline" class="mt-4"> Return to Login </Button>
      </a>
    </div>

    <Toaster position="top-center" rich-colors close-button />
  </div>
</template>
