import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Club ID is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  
  // Event Details
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date()
      },
      message: 'Event date must be in the future'
    }
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime
      },
      message: 'End time must be after start time'
    }
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  venue: {
    type: String,
    trim: true,
    maxlength: [100, 'Venue cannot exceed 100 characters']
  },
  
  // Registration
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1'],
    default: null // null means unlimited
  },
  registrationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value <= this.startTime
      },
      message: 'Registration deadline must be before event start time'
    }
  },
  registrationFee: {
    type: Number,
    min: [0, 'Registration fee cannot be negative'],
    default: 0
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'cancelled', 'completed'],
      message: 'Status must be one of: draft, published, cancelled, completed'
    },
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Media
  poster: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: {
      values: ['academic', 'cultural', 'sports', 'technical', 'social', 'workshop', 'seminar', 'competition'],
      message: 'Category must be one of: academic, cultural, sports, technical, social, workshop, seminar, competition'
    },
    required: [true, 'Event category is required']
  },
  
  // Attendance
  qrCode: {
    type: String,
    default: null
  },
  qrCodeExpiry: {
    type: Date,
    default: null
  },
  attendanceRequired: {
    type: Boolean,
    default: true
  },
  
  // Statistics (computed fields)
  stats: {
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    },
    feedbackCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
eventSchema.index({ status: 1, date: 1 })
eventSchema.index({ clubId: 1, status: 1 })
eventSchema.index({ date: 1, status: 1 })
eventSchema.index({ category: 1, status: 1 })
eventSchema.index({ tags: 1, status: 1 })
eventSchema.index({ createdBy: 1, createdAt: -1 })

// Text search index
eventSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  location: 'text'
})

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  const now = new Date()
  
  if (this.registrationDeadline && now > this.registrationDeadline) {
    return 'closed'
  }
  
  if (this.maxParticipants && this.stats.registrations >= this.maxParticipants) {
    return 'full'
  }
  
  return 'open'
})

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date()
  
  if (this.status === 'cancelled') return 'cancelled'
  if (this.status === 'draft') return 'draft'
  
  if (now < this.startTime) return 'upcoming'
  if (now >= this.startTime && now <= this.endTime) return 'ongoing'
  if (now > this.endTime) return 'completed'
  
  return 'unknown'
})

// Virtual for duration in minutes
eventSchema.virtual('duration').get(function() {
  return Math.round((this.endTime - this.startTime) / (1000 * 60))
})

// Virtual populate for club
eventSchema.virtual('club', {
  ref: 'Club',
  localField: 'clubId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for creator
eventSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
})

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Auto-complete events that have passed
  if (this.status === 'published' && new Date() > this.endTime) {
    this.status = 'completed'
  }
  
  next()
})

// Static methods
eventSchema.statics.findPublished = function(filter = {}) {
  return this.find({ 
    ...filter, 
    status: 'published',
    isPublic: true 
  })
}

eventSchema.statics.findUpcoming = function(filter = {}) {
  return this.find({ 
    ...filter, 
    status: 'published',
    startTime: { $gt: new Date() }
  })
}

eventSchema.statics.findByClub = function(clubId, filter = {}) {
  return this.find({ 
    ...filter, 
    clubId: clubId 
  })
}

// Instance methods
eventSchema.methods.canRegister = function() {
  const now = new Date()
  
  if (this.status !== 'published') return false
  if (this.registrationDeadline && now > this.registrationDeadline) return false
  if (this.maxParticipants && this.stats.registrations >= this.maxParticipants) return false
  if (now >= this.startTime) return false
  
  return true
}

eventSchema.methods.canMarkAttendance = function() {
  const now = new Date()
  
  if (this.status !== 'published') return false
  if (!this.attendanceRequired) return false
  
  // Allow attendance marking 30 minutes before start and 30 minutes after end
  const attendanceStart = new Date(this.startTime.getTime() - 30 * 60 * 1000)
  const attendanceEnd = new Date(this.endTime.getTime() + 30 * 60 * 1000)
  
  return now >= attendanceStart && now <= attendanceEnd
}

eventSchema.methods.updateStats = async function() {
  const Registration = mongoose.model('Registration')
  const Attendance = mongoose.model('Attendance')
  const Feedback = mongoose.model('Feedback')
  
  // Count registrations
  const registrations = await Registration.countDocuments({ 
    eventId: this._id, 
    status: 'registered' 
  })
  
  // Count attendance
  const attendance = await Attendance.countDocuments({ 
    eventId: this._id 
  })
  
  // Count feedback and calculate average rating
  const feedbackStats = await Feedback.aggregate([
    { $match: { eventId: this._id } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])
  
  const feedbackCount = feedbackStats[0]?.count || 0
  const averageRating = feedbackStats[0]?.avgRating || 0
  
  this.stats = {
    registrations,
    attendance,
    feedbackCount,
    averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
  }
  
  await this.save()
  return this.stats
}

const Event = mongoose.model('Event', eventSchema)

export default Event