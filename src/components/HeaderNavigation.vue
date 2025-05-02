<script setup lang="ts">
import { ref } from 'vue';
import { Menu, X, Zap } from 'lucide-vue-next';
import UserMenu from '@/components/UserMenu.vue';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'vue-sonner';
import type { User } from '@supabase/supabase-js';

defineProps<{
  user: User | null | undefined;
}>();

const isOpen = ref(false);

const navigationItems = [
  { href: '/generate', label: 'Generate Flashcards' },
  { href: '/flashcards', label: 'Flashcards' },
];

const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    window.location.href = '/login';
  } catch (e) {
    toast.error('Failed to logout');
    throw e;
  }
};
</script>

<template>
  <header class="relative z-50 bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <a href="/" class="flex items-center text-xl font-bold">
              <Zap class="h-6 w-6 text-indigo-600" />
              <span class="ml-2 text-indigo-600">Flashcardify</span>
            </a>
          </div>
          <nav class="hidden md:ml-6 md:flex md:space-x-8">
            <a
              v-for="item in navigationItems"
              :key="item.href"
              :href="item.href"
              class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 hover:border-indigo-500 hover:text-indigo-600"
            >
              <span>{{ item.label }}</span>
            </a>
          </nav>
        </div>
        <div class="flex items-center">
          <div class="hidden md:block">
            <UserMenu :user="user" @logout="handleLogout" />
          </div>
          <div class="md:hidden">
            <button
              @click="isOpen = !isOpen"
              class="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none"
              :aria-expanded="isOpen"
              aria-controls="mobile-menu"
            >
              <span class="sr-only">{{ isOpen ? 'Close menu' : 'Open menu' }}</span>
              <component :is="isOpen ? X : Menu" class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-show="isOpen" class="mobile-menu-overlay md:hidden" :class="{ 'is-open': isOpen }">
      <nav class="mobile-menu-content">
        <a
          v-for="item in [...navigationItems, { href: '/profile', label: 'Profile' }]"
          :key="item.href"
          :href="item.href"
          class="block border-l-4 border-transparent px-6 py-4 text-lg hover:border-indigo-500 hover:text-indigo-600"
        >
          <span>{{ item.label }}</span>
        </a>
        <div
          @click="handleLogout"
          class="block border-l-4 border-transparent px-6 py-4 text-lg hover:border-indigo-500 hover:text-indigo-600"
        >
          <span>Logout</span>
        </div>
      </nav>
    </div>
  </header>
  <Toaster position="top-center" rich-colors close-button />
</template>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 64px; /* height of header */
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.98);
  opacity: 0;
  transform: translateY(-1rem);
  transition: all 0.2s ease-out;
  pointer-events: none;
  z-index: 40;
}

.mobile-menu-overlay.is-open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition: all 0.2s ease-in;
}

.mobile-menu-content {
  padding-top: 1rem;
}
</style>
