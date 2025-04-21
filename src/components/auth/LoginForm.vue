<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { Toaster } from '@/components/ui/sonner';
import { z } from 'zod';
import { useFormValidation } from '@/composables/useFormValidation';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const {
  formData,
  validationErrors,
  isValid,
  setFieldTouched,
  handleSubmit: validateForm,
} = useFormValidation(loginSchema);

const isLoading = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    isLoading.value = true;
    // Backend integration will be implemented later
    console.log('Form submitted:', formData.value);
  } catch (error) {
    toast.error('An error occurred while logging in');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto max-w-md space-y-8 py-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Welcome back</h1>
      <p class="text-gray-500">Enter your credentials to access your account</p>
    </div>

    <form @submit="handleSubmit" class="space-y-6">
      <pre>{{ formData }}</pre>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Enter your email"
          :error="validationErrors.email?.[0]"
          @blur="setFieldTouched('email')"
        />
        <p v-if="validationErrors.email?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.email[0] }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="Enter your password"
          :error="validationErrors.password?.[0]"
          @blur="setFieldTouched('password')"
        />
        <p v-if="validationErrors.password?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.password[0] }}
        </p>
      </div>

      <div class="flex justify-end">
        <a href="/forgot-password" class="text-sm text-blue-600 hover:text-blue-800"> Forgot password? </a>
      </div>

      <Button type="submit" :disabled="isLoading" :loading="isLoading" class="w-full"> Sign In </Button>

      <div class="text-center text-sm">
        Don't have an account?
        <a href="/register" class="text-blue-600 hover:text-blue-800"> Create one now </a>
      </div>
    </form>

    <Toaster position="top-center" rich-colors close-button />
  </div>
</template>
