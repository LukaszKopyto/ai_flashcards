<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';

const authStore = useAuthStore();

const handleChangePassword = () => {
  window.location.href = '/update-password';
};
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Profile Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div>
          <label class="text-muted-foreground text-sm font-medium">Username</label>
          <p class="text-lg">{{ authStore.user?.email }}</p>
        </div>
        <div>
          <label class="text-muted-foreground text-sm font-medium">Email</label>
          <p class="text-lg">{{ authStore.user?.email }}</p>
        </div>
        <div>
          <label class="text-muted-foreground text-sm font-medium">Member since</label>
          <p class="text-lg">{{ authStore.user?.created_at ? formatDate(authStore.user.created_at) : '-' }}</p>
        </div>
        <div>
          <label class="text-muted-foreground text-sm font-medium">Last sign in</label>
          <p class="text-lg">
            {{ authStore.user?.last_sign_in_at ? formatDate(authStore.user.last_sign_in_at) : '-' }}
          </p>
        </div>
        <div class="pt-4">
          <Button variant="outline" @click="handleChangePassword">Change Password</Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
