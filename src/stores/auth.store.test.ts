import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.store'
import { nextTick } from 'vue'

// Mock fetch API
vi.stubGlobal('fetch', vi.fn())

// Mock window.location
const mockLocation = {
  href: ''
}
vi.stubGlobal('window', {
  location: mockLocation
})

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useAuthStore', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.mocked(fetch).mockReset()
    mockLocation.href = ''
    consoleErrorSpy.mockClear()
  })

  describe('initializeAuth', () => {
    it('should set the user when session is valid', async () => {
      // Arrange
      const mockUser = { id: '123', email: 'test@example.com' }
      vi.mocked(fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ session: { user: mockUser } })
      } as Response)
      
      // Act
      const authStore = useAuthStore()
      await authStore.initializeAuth()
      
      // Assert
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isLoading).toBe(false)
      expect(authStore.error).toBeNull()
    })

    it('should handle session initialization error', async () => {
      // Arrange
      const errorMessage = 'Session error'
      vi.mocked(fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ error: errorMessage })
      } as Response)
      
      // Act
      const authStore = useAuthStore()
      await authStore.initializeAuth()
      
      // Assert
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBe(errorMessage)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should log in the user successfully', async () => {
      // Arrange
      const mockUser = { id: '123', email: 'test@example.com' }
      const credentials = { email: 'test@example.com', password: 'password123' }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ user: mockUser })
      } as Response)
      
      // Act
      const authStore = useAuthStore()
      const result = await authStore.login(credentials)
      
      // Assert
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
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong' }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      } as Response)
      
      // Act & Assert
      const authStore = useAuthStore()
      await expect(authStore.login(credentials)).rejects.toThrow('Invalid credentials')
      expect(authStore.error).toBe('Invalid credentials')
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should log out the user and redirect to login page', async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ })
      } as Response)
      
      const authStore = useAuthStore()
      // Set user to simulate logged in state
      authStore.user = { id: '123', email: 'test@example.com' } as any
      
      // Act
      await authStore.logout()
      
      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST'
      })
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(mockLocation.href).toBe('/login')
    })

    it('should handle logout error', async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ error: 'Logout error' })
      } as Response)
      
      const authStore = useAuthStore()
      authStore.user = { id: '123', email: 'test@example.com' } as any
      
      // Act & Assert
      await expect(authStore.logout()).rejects.toThrow('Logout error')
      expect(authStore.error).toBe('Logout error')
    })
  })

  describe('utility functions', () => {
    it('should clear error state', () => {
      // Arrange
      const authStore = useAuthStore()
      authStore.error = 'Some error'
      
      // Act
      authStore.clearError()
      
      // Assert
      expect(authStore.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('isAuthenticated should reflect user state', async () => {
      // Arrange
      const authStore = useAuthStore()
      
      // Act & Assert - initially not authenticated
      expect(authStore.isAuthenticated).toBe(false)
      
      // Act - set user
      authStore.user = { id: '123' } as any
      
      // Assert - now authenticated
      expect(authStore.isAuthenticated).toBe(true)
    })
  })
}) 