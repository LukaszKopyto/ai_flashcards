import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'

interface LoginCredentials {
  email: string
  password: string
}

interface CustomUserResponse {
  user: User | null
  error: { message: string } | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  
  const isAuthenticated = computed(() => !!user.value)

  async function initializeAuth() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/auth/get-user')
      const data: CustomUserResponse = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message)
      }
      user.value = data.user ?? null
    } catch (e) {
      handleError(e, 'Failed to initialize auth')
    } finally {
      isLoading.value = false
    }
  }

  async function login({ email, password }: LoginCredentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message)
      }
      
      user.value = data.user
      return data
    } catch (e) {
      handleError(e, 'Failed to login')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      user.value = null
      window.location.href = '/login'
    } catch (e) {
      handleError(e, 'Failed to logout')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function handleError(e: unknown, defaultMessage: string) {
    console.error(e)
    const message = e instanceof Error ? e.message : defaultMessage
    error.value = message
  }

  function clearError(): void {
    error.value = null
  }

  onMounted(() => {
    initializeAuth()
  })

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    clearError
  }
})
