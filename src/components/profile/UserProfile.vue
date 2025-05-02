<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

defineProps<{
  user: User | null | undefined;
}>();

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
        <div class="h-14">
          <label class="text-muted-foreground text-sm font-medium">Username</label>
          <Skeleton v-if="!user?.email" class="h-7 w-48" />
          <p v-else class="text-lg">{{ user?.email }}</p>
        </div>
        <div class="h-14">
          <label class="text-muted-foreground text-sm font-medium">Email</label>
          <Skeleton v-if="!user?.email" class="h-7 w-48" />
          <p v-else class="text-lg">{{ user?.email }}</p>
        </div>
        <div class="h-14">
          <label class="text-muted-foreground text-sm font-medium">Member since</label>
          <Skeleton v-if="!user?.created_at" class="h-7 w-48" />
          <p v-else class="text-lg">{{ user?.created_at ? formatDate(user.created_at) : '-' }}</p>
        </div>
        <div class="h-14">
          <label class="text-muted-foreground text-sm font-medium">Last sign in</label>
          <Skeleton v-if="!user?.last_sign_in_at" class="h-7 w-48" />
          <p v-else class="text-lg">
            {{ user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : '-' }}
          </p>
        </div>
        <div class="pt-4">
          <Button variant="outline" @click="handleChangePassword">Change Password</Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
