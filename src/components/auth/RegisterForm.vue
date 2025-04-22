<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { Toaster } from '@/components/ui/sonner';
import { useFormValidation } from '@/composables/useFormValidation';
import { registerSchema, type RegisterForm } from '@/schemas/auth';

const formData = ref<RegisterForm>({
  email: '',
  password: '',
  confirmPassword: '',
});

const {
  validationErrors,
  isValid,
  setFieldTouched,
  handleSubmit: validateForm,
} = useFormValidation(registerSchema, formData);

const isLoading = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;
    // Backend integration will be implemented later
    console.log('Form submitted:', formData.value);
  } catch (error) {
    toast.error('An error occurred while registering');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto max-w-md space-y-8 py-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Create an account</h1>
      <p class="text-gray-500">Enter your details to register</p>
    </div>

    <form @submit="handleSubmit" class="space-y-6">
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

      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="Create a password"
          :error="validationErrors.password?.[0]"
          @blur="setFieldTouched('password')"
          required
        />
        <p v-if="validationErrors.password?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.password[0] }}
        </p>
        <p class="text-sm text-gray-500">
          Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters
        </p>
      </div>

      <div class="space-y-2">
        <Label for="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          v-model="formData.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          :error="validationErrors.confirmPassword?.[0]"
          @blur="setFieldTouched('confirmPassword')"
          required
        />
        <p v-if="validationErrors.confirmPassword?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.confirmPassword[0] }}
        </p>
      </div>

      <Button type="submit" :disabled="isLoading" :loading="isLoading" class="w-full"> Create Account </Button>

      <div class="text-center text-sm">
        Already have an account?
        <a href="/login" class="text-blue-600 hover:text-blue-800"> Sign in instead </a>
      </div>
    </form>

    <Toaster position="top-center" rich-colors close-button />
  </div>
</template>
