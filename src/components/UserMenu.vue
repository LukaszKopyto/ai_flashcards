<script setup lang="ts">
import { CircleUserRound } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<template>
  <DropdownMenu v-if="authStore.user">
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarImage :src="authStore.user.user_metadata?.avatar_url ?? ''" :alt="authStore.user.email" />
        <AvatarFallback>
          <CircleUserRound class="h-8 w-8 text-gray-500" />
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <DropdownMenuContent>
      <DropdownMenuItem as="a" href="/profile"> Your Profile </DropdownMenuItem>
      <DropdownMenuItem @select="handleLogout"> Sign out </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
