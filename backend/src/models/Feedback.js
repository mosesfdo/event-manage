import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: [true, 'Attendance ID is required']
  },
  
  // Feedback Data
  rating: {
    type: Number,
    required: [true, 'Overall rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  categories: {
    content: {
      type: Number,
      min: [1, 'Content rating must be between 1 and 5'],
      max: [5, 'Content rating must be between 1 and 5']
    },
    organization: {
      type: Number,
      min: [1, 'Organization rating must be between 1 and 5'],
      max: [5, 'Organization rating must be between 1 and 5']
    },
    venue: {
      type: Number,
      min: [1, 'Venue rating must be between 1 and 5'],
      max: [5, 'Venue rating must be between 1 and 5']
    },
    overall: {
      type: Number,
      min: [1, 'Overall rating must be between 1 and 5'],
      max: [5, 'Overall rating must be between 1 and 5']
    }
  },
  
  // Structured feedback questions
  wouldRecommend: {
    type: Boolean,
    default: null
  },
  improvements: [{
    type: String,
    enum: ['content', 'timing', 'venue', 'organization', 'communication', 'other']
  }],
  
  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound unique index - one feedback per user per event
feedbackSchema.index({ userId: 1, eventId: 1 }, { unique: true })

// Query indexes
feedbackSchema.index({ eventId: 1, rating: 1 })
feedbackSchema.index({ eventId: 1, submittedAt: -1 })
feedbackSchema.index({ rating: 1, submittedAt: -1 })
feedbackSchema.index({ isModerated: 1 })

// Virtual populate for user
feedbackSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for event
feedbackSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for attendance
feedbackSchema.virtual('attendance', {
  ref: 'Attendance',
  localField: 'attendanceId',
  foreignField: '_id',
  justOne: true
})

// Virtual for average category rating
feedbackSchema.virtual('averageCategoryRating').get(function() {
  const categories = this.categories
  if (!categories) return null
  
  const ratings = Object.values(categories).filter(rating => rating != null)
  if (ratings.length === 0) return null
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
})

// Pre-save validation
feedbackSchema.pre('save', async function(next) {
  try {
    // Verify that user attended the event
    const Attendance = mongoose.model('Attendance')
    const attendance = await Attendance.findOne({
      userId: this.userId,
      eventId: this.eventId
    })
    
    if (!attendance) {
      throw new Error('User must have attended the event to submit feedback')
    }
    
    // Set attendance ID if not provided
    if (!this.attendanceId) {
      this.attendanceId = attendance._id
    }
    
    // Verify event is completed
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    
    if (!event) {
      throw new Error('Event not found')
    }
    
    if (new Date() < event.endTime) {
      throw new Error('Feedback can only be submitted after the event has ended')
    }
    
    // Set overall rating in categories if not provided
    if (!this.categories.overall) {
      this.categories.overall = this.rating
    }
    
    next()
  } catch (error) {
    next(error)
  }
})

// Post-save middleware to update event stats
feedbackSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    if (event) {
      await event.updateStats()
    }
  } catch (error) {
    console.error('Error updating event stats after feedback save:', error)
  }
})

// Post-remove middleware to update event stats
feedbackSchema.post('remove', async function() {
  try {
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    if (event) {
      await event.updateStats()
    }
  } catch (error) {
    console.error('Error updating event stats after feedback removal:', error)
  }
})

// Static methods
feedbackSchema.statics.findByUser = function(userId, filter = {}) {
  return this.find({ 
    ...filter, 
    userId: userId 
  }).populate('event')
}

feedbackSchema.statics.findByEvent = function(eventId, filter = {}) {
  const query = { 
    ...filter, 
    eventId: eventId 
  }
  
  // Don't populate user for anonymous feedback
  return this.find(query).populate({
    path: 'user',
    select: filter.includeAnonymous ? 'firstName lastName' : null,
    match: filter.includeAnonymous ? null : { isAnonymous: false }
  })
}

feedbackSchema.statics.getEventFeedbackStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        averageContent: { $avg: '$categories.content' },
        averageOrganization: { $avg: '$categories.organization' },
        averageVenue: { $avg: '$categories.venue' },
        averageOverall: { $avg: '$categories.overall' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ])
  
  if (stats.length === 0) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      categoryAverages: {},
      ratingDistribution: {}
    }
  }
  
  const result = stats[0]
  
  // Calculate rating distribution
  const ratingDistribution = result.ratingDistribution.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1
    return acc
  }, {})
  
  return {
    totalFeedback: result.totalFeedback,
    averageRating: Math.round(result.averageRating * 10) / 10,
    categoryAverages: {
      content: Math.round((result.averageContent || 0) * 10) / 10,
      organization: Math.round((result.averageOrganization || 0) * 10) / 10,
      venue: Math.round((result.averageVenue || 0) * 10) / 10,
      overall: Math.round((result.averageOverall || 0) * 10) / 10
    },
    ratingDistribution
  }
}

// Instance methods
feedbackSchema.methods.moderate = async function(moderatorId, reason = null) {
  this.isModerated = true
  this.moderatedBy = moderatorId
  this.moderatedAt = new Date()
  this.moderationReason = reason
  
  await this.save()
  return this
}

feedbackSchema.methods.unmoderate = async function() {
  this.isModerated = false
  this.moderatedBy = null
  this.moderatedAt = null
  this.moderationReason = null
  
  await this.save()
  return this
}

const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback