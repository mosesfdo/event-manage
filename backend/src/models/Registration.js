import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema({
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
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['registered', 'cancelled', 'waitlisted'],
      message: 'Status must be one of: registered, cancelled, waitlisted'
    },
    default: 'registered'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'refunded', 'not_required'],
      message: 'Payment status must be one of: pending, paid, refunded, not_required'
    },
    default: 'not_required'
  },
  paymentId: {
    type: String,
    default: null
  },
  paymentAmount: {
    type: Number,
    min: [0, 'Payment amount cannot be negative'],
    default: 0
  },
  // Additional registration data
  additionalInfo: {
    type: Map,
    of: String,
    default: new Map()
  },
  // Cancellation details
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound unique index - one registration per user per event
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true })

// Query indexes
registrationSchema.index({ eventId: 1, status: 1 })
registrationSchema.index({ userId: 1, registeredAt: -1 })
registrationSchema.index({ status: 1, registeredAt: -1 })

// Virtual populate for user
registrationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for event
registrationSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true
})

// Virtual for registration validity
registrationSchema.virtual('isActive').get(function() {
  return this.status === 'registered'
})

// Pre-save middleware
registrationSchema.pre('save', function(next) {
  // Set cancellation timestamp when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date()
  }
  
  next()
})

// Post-save middleware to update event stats
registrationSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    if (event) {
      await event.updateStats()
    }
  } catch (error) {
    console.error('Error updating event stats after registration save:', error)
  }
})

// Post-remove middleware to update event stats
registrationSchema.post('remove', async function() {
  try {
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    if (event) {
      await event.updateStats()
    }
  } catch (error) {
    console.error('Error updating event stats after registration removal:', error)
  }
})

// Static methods
registrationSchema.statics.findByUser = function(userId, filter = {}) {
  return this.find({ 
    ...filter, 
    userId: userId 
  }).populate('event')
}

registrationSchema.statics.findByEvent = function(eventId, filter = {}) {
  return this.find({ 
    ...filter, 
    eventId: eventId 
  }).populate('user')
}

registrationSchema.statics.findActive = function(filter = {}) {
  return this.find({ 
    ...filter, 
    status: 'registered' 
  })
}

registrationSchema.statics.isUserRegistered = async function(userId, eventId) {
  const registration = await this.findOne({ 
    userId: userId, 
    eventId: eventId, 
    status: 'registered' 
  })
  return !!registration
}

// Instance methods
registrationSchema.methods.cancel = async function(reason = null) {
  this.status = 'cancelled'
  this.cancelledAt = new Date()
  this.cancellationReason = reason
  
  await this.save()
  return this
}

registrationSchema.methods.canCancel = function() {
  if (this.status !== 'registered') return false
  
  // Check if event has started
  const Event = mongoose.model('Event')
  return Event.findById(this.eventId).then(event => {
    if (!event) return false
    return new Date() < event.startTime
  })
}

const Registration = mongoose.model('Registration', registrationSchema)

export default Registration