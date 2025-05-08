<script setup lang="ts">
import { CircleUserRound } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@supabase/supabase-js';
const { user } = defineProps<{
  user: User | null | undefined;
}>();

defineEmits<(e: 'logout') => void>();
</script>

<template>
  <DropdownMenu v-if="user?.id">
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarImage :src="user.user_metadata?.avatar_url ?? ''" :alt="user.email" />
        <AvatarFallback>
          <CircleUserRound class="h-8 w-8 text-gray-500" />
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <DropdownMenuContent>
      <DropdownMenuItem as="a" href="/profile"> Your Profile </DropdownMenuItem>
      <DropdownMenuItem @select="$emit('logout')"> Sign out </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
