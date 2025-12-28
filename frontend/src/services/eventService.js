import api from './api'

export const eventService = {
  // Get all events with filters
  async getEvents(params = {}) {
    const response = await api.get('/events', { params })
    return response.data
  },

  // Get single event by ID
  async getEvent(id) {
    const response = await api.get(`/events/${id}`)
    return response.data.data
  },

  // Create new event (Club Admin+)
  async createEvent(eventData) {
    const response = await api.post('/events', eventData)
    return response.data.data
  },

  // Update event (Club Admin+)
  async updateEvent(id, eventData) {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data.data
  },

  // Delete event (Club Admin+)
  async deleteEvent(id) {
    const response = await api.delete(`/events/${id}`)
    return response.data.data
  },

  // Register for event
  async registerForEvent(eventId) {
    const response = await api.post(`/events/${eventId}/register`)
    return response.data.data
  },

  // Unregister from event
  async unregisterFromEvent(eventId) {
    const response = await api.delete(`/events/${eventId}/register`)
    return response.data.data
  },

  // Get event registrations (Club Admin+)
  async getEventRegistrations(eventId, params = {}) {
    const response = await api.get(`/events/${eventId}/registrations`, { params })
    return response.data
  },

  // Mark attendance via QR code
  async markAttendance(eventId, qrToken) {
    const response = await api.post(`/events/${eventId}/attendance`, { qrToken })
    return response.data.data
  },

  // Get event attendance (Club Admin+)
  async getEventAttendance(eventId, params = {}) {
    const response = await api.get(`/events/${eventId}/attendance`, { params })
    return response.data
  },

  // Generate QR code for event (Club Admin+)
  async generateQRCode(eventId) {
    const response = await api.post(`/events/${eventId}/qr-code`)
    return response.data.data
  },

  // Submit feedback for event
  async submitFeedback(eventId, feedbackData) {
    const response = await api.post(`/events/${eventId}/feedback`, feedbackData)
    return response.data.data
  },

  // Get event feedback (Club Admin+)
  async getEventFeedback(eventId, params = {}) {
    const response = await api.get(`/events/${eventId}/feedback`, { params })
    return response.data
  },

  // Upload event poster
  async uploadPoster(eventId, file) {
    const formData = new FormData()
    formData.append('poster', file)
    
    const response = await api.post(`/events/${eventId}/poster`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  // Get user's registered events
  async getUserEvents(params = {}) {
    const response = await api.get('/events/my-events', { params })
    return response.data
  },

  // Get user's event timeline
  async getUserTimeline(params = {}) {
    const response = await api.get('/events/timeline', { params })
    return response.data
  }
}