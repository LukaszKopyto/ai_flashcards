<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { Toaster } from '@/components/ui/sonner';
import { useFormValidation } from '@/composables/useFormValidation';
import { resetPasswordFormSchema, type ResetPasswordForm } from '@/schemas/auth';

const props = defineProps<{
  csrfToken: string;
}>();

const formData = ref<ResetPasswordForm>({
  newPassword: '',
  confirmNewPassword: '',
});

const {
  validationErrors,
  isValid,
  setFieldTouched,
  handleSubmit: validateForm,
} = useFormValidation(resetPasswordFormSchema, formData);

const isLoading = ref(false);
const isSuccess = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    // Get the hash from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get('hash');

    if (!hash) {
      throw new Error('Invalid password reset link. Please request a new one.');
    }

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': props.csrfToken,
      },
      body: JSON.stringify({
        newPassword: formData.value.newPassword,
        hash,
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        // CSRF token expired - reload the page
        window.location.reload();
        throw new Error('Security token expired. Reloading page...');
      }
      throw new Error(data.error || 'Failed to reset password');
    }

    isSuccess.value = true;
    toast.success('Password has been reset successfully');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'An error occurred while resetting password');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto max-w-md space-y-8 py-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Reset Password</h1>
      <p class="text-gray-500" v-if="!isSuccess">Choose your new password</p>
      <p class="text-green-600" v-else>
        Your password has been reset successfully. You can now
        <a href="/login" class="text-blue-600 hover:text-blue-800">log in</a> with your new password.
      </p>
    </div>

    <form v-if="!isSuccess" @submit="handleSubmit" class="space-y-6">
      <div class="space-y-2">
        <Label for="new-password">New Password</Label>
        <Input
          id="new-password"
          v-model="formData.newPassword"
          type="password"
          placeholder="Enter your new password"
          :error="validationErrors.newPassword?.[0]"
          @blur="setFieldTouched('newPassword')"
          required
        />
        <p v-if="validationErrors.newPassword?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.newPassword[0] }}
        </p>
        <p class="text-sm text-gray-500">
          Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters
        </p>
      </div>

      <div class="space-y-2">
        <Label for="confirm-new-password">Confirm New Password</Label>
        <Input
          id="confirm-new-password"
          v-model="formData.confirmNewPassword"
          type="password"
          placeholder="Confirm your new password"
          :error="validationErrors.confirmNewPassword?.[0]"
          @blur="setFieldTouched('confirmNewPassword')"
          required
        />
        <p v-if="validationErrors.confirmNewPassword?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.confirmNewPassword[0] }}
        </p>
      </div>

      <Button type="submit" :disabled="isLoading" :loading="isLoading" class="w-full"> Reset Password </Button>
    </form>

    <div v-else class="text-center">
      <a href="/login">
        <Button variant="outline" class="mt-4">Go to Login</Button>
      </a>
    </div>

    <Toaster position="top-center" rich-colors close-button />
  </div>
</template>
