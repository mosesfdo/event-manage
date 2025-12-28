// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  CLUB_ADMIN: 'club_admin',
  FACULTY: 'faculty',
  SUPER_ADMIN: 'super_admin'
}

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
}

// Registration Status
export const REGISTRATION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FULL: 'full'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  REGISTERED: 'registered',
  ATTENDED: 'attended',
  ABSENT: 'absent'
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password'
  },
  EVENTS: {
    BASE: '/events',
    REGISTER: (id) => `/events/${id}/register`,
    ATTENDANCE: (id) => `/events/${id}/attendance`,
    FEEDBACK: (id) => `/events/${id}/feedback`,
    QR_CODE: (id) => `/events/${id}/qr-code`,
    POSTER: (id) => `/events/${id}/poster`
  },
  CERTIFICATES: {
    VERIFY: (id) => `/certificates/verify/${id}`
  }
}

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences'
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
}

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100
}

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
}