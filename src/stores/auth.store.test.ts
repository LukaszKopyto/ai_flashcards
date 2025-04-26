import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.store'
import { nextTick } from 'vue'

vi.stubGlobal('fetch', vi.fn())

const mockLocation = {
  href: ''
}
vi.stubGlobal('window', {
  location: mockLocation
})

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

function createFetchResponse(data: any) {
  return { json: () => new Promise((resolve) => resolve(data)) } as Response
}
const mockUser = { id: '123', email: 'test@example.com', aud: 'authenticated' }

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    vi.mocked(fetch).mockReset()
    mockLocation.href = ''
    consoleErrorSpy.mockClear()
  })

  describe('initializeAuth', () => {
    it('should set the user when session is valid', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({ user: mockUser }))
      
      const authStore = useAuthStore()
      await authStore.initializeAuth()
      
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isLoading).toBe(false)
      expect(authStore.error).toBeNull()
    })

    it('should handle session initialization error', async () => {
      const errorMessage = 'Session error'
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({ error: { message: errorMessage } }))
      
      const authStore = useAuthStore()
      await authStore.initializeAuth()
      
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBe(errorMessage)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should log in the user successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({ user: mockUser }))
      
      const authStore = useAuthStore()
      const result = await authStore.login(credentials)
      
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(result.user).toEqual(mockUser)
    })

    it('should handle login error', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' }
      
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({ error: { message: 'Invalid credentials' } }))
      
      const authStore = useAuthStore()
      await expect(authStore.login(credentials)).rejects.toThrow('Invalid credentials')
      expect(authStore.error).toBe('Invalid credentials')
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should log out the user and redirect to login page', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({ }))
      
      const authStore = useAuthStore()
      authStore.user = { id: '123', email: 'test@example.com' } as any
      
      await authStore.logout()
      
      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST'
      })
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(mockLocation.href).toBe('/login')
    })

    it('should handle logout error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({ error: { message: 'Logout error' } }))
      

      const authStore = useAuthStore()
      authStore.user = { id: '123', email: 'test@example.com' } as any
      
      await expect(authStore.logout()).rejects.toThrow('Logout error')
      expect(authStore.error).toBe('Logout error')
    })
  })

  describe('utility functions', () => {
    it('should clear error state', () => {
      const authStore = useAuthStore()
      authStore.error = 'Some error'
      
      authStore.clearError()
      
      expect(authStore.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('isAuthenticated should reflect user state', async () => {
      const authStore = useAuthStore()
      
      expect(authStore.isAuthenticated).toBe(false)
      
      authStore.user = { id: '123', aud: 'authenticated' } as any
      
      expect(authStore.isAuthenticated).toBe(true)
    })
  })
}) 