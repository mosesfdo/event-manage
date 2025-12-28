import api from './api'

export const authService = {
  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data.data
  },

  // Register user
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data.data
  },

  // Update user profile
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData)
    return response.data.data
  },

  // Change password
  async changePassword(passwordData) {
    const response = await api.put('/auth/password', passwordData)
    return response.data.data
  },

  // Logout user
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken })
    }
  },

  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data.data
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data.data
  },

  // Reset password
  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password })
    return response.data.data
  }
}