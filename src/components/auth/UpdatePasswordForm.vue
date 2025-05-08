<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { Toaster } from '@/components/ui/sonner';
import { useFormValidation } from '@/composables/useFormValidation';
import { updatePasswordSchema, type UpdatePasswordForm } from '@/schemas/auth';

const formData = ref<UpdatePasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

const {
  validationErrors,
  setFieldTouched,
  handleSubmit: validateForm,
} = useFormValidation(updatePasswordSchema, formData);

const isLoading = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: formData.value.currentPassword,
        newPassword: formData.value.newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || 'Failed to update password');
      return;
    }

    toast.success('Password updated successfully');
    formData.value = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };
  } catch (_error) {
    toast.error('An error occurred while updating password');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto max-w-md space-y-8 py-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Update Password</h1>
      <p class="text-gray-500">Enter your current password and choose a new one</p>
    </div>

    <form class="space-y-6" @submit="handleSubmit">
      <div class="space-y-2">
        <Label for="current-password">Current Password</Label>
        <Input
          id="current-password"
          v-model="formData.currentPassword"
          type="password"
          placeholder="Enter your current password"
          :error="validationErrors.currentPassword?.[0]"
          required
          @blur="setFieldTouched('currentPassword')"
        />
        <p v-if="validationErrors.currentPassword?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.currentPassword[0] }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="new-password">New Password</Label>
        <Input
          id="new-password"
          v-model="formData.newPassword"
          type="password"
          placeholder="Enter your new password"
          :error="validationErrors.newPassword?.[0]"
          required
          @blur="setFieldTouched('newPassword')"
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
          required
          @blur="setFieldTouched('confirmNewPassword')"
        />
        <p v-if="validationErrors.confirmNewPassword?.[0]" class="mt-1 text-sm text-red-500">
          {{ validationErrors.confirmNewPassword[0] }}
        </p>
      </div>

      <Button type="submit" :disabled="isLoading" :loading="isLoading" class="w-full"> Update Password </Button>
    </form>

    <Toaster position="top-center" rich-colors close-button />
  </div>
</template>
