import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
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
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: [true, 'Registration ID is required']
  },
  
  // Attendance Details
  markedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by user ID is required']
  },
  method: {
    type: String,
    enum: {
      values: ['qr_scan', 'manual', 'bulk_upload'],
      message: 'Method must be one of: qr_scan, manual, bulk_upload'
    },
    required: [true, 'Attendance method is required']
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  
  // Verification
  qrToken: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  
  // Additional metadata
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  
  // Manual attendance fields
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound unique index - one attendance per user per event
attendanceSchema.index({ userId: 1, eventId: 1 }, { unique: true })

// Query indexes
attendanceSchema.index({ eventId: 1, markedAt: -1 })
attendanceSchema.index({ userId: 1, markedAt: -1 })
attendanceSchema.index({ method: 1, markedAt: -1 })
attendanceSchema.index({ isVerified: 1 })

// Virtual populate for user
attendanceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for event
attendanceSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for registration
attendanceSchema.virtual('registration', {
  ref: 'Registration',
  localField: 'registrationId',
  foreignField: '_id',
  justOne: true
})

// Virtual populate for marker (who marked attendance)
attendanceSchema.virtual('marker', {
  ref: 'User',
  localField: 'markedBy',
  foreignField: '_id',
  justOne: true
})

// Pre-save validation
attendanceSchema.pre('save', async function(next) {
  try {
    // Verify that user is registered for the event
    const Registration = mongoose.model('Registration')
    const registration = await Registration.findOne({
      userId: this.userId,
      eventId: this.eventId,
      status: 'registered'
    })
    
    if (!registration) {
      throw new Error('User must be registered for the event to mark attendance')
    }
    
    // Set registration ID if not provided
    if (!this.registrationId) {
      this.registrationId = registration._id
    }
    
    // Verify event allows attendance marking
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    
    if (!event) {
      throw new Error('Event not found')
    }
    
    if (!event.canMarkAttendance()) {
      throw new Error('Attendance marking is not allowed for this event at this time')
    }
    
    next()
  } catch (error) {
    next(error)
  }
})

// Post-save middleware to update event stats
attendanceSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    if (event) {
      await event.updateStats()
    }
  } catch (error) {
    console.error('Error updating event stats after attendance save:', error)
  }
})

// Post-remove middleware to update event stats
attendanceSchema.post('remove', async function() {
  try {
    const Event = mongoose.model('Event')
    const event = await Event.findById(this.eventId)
    if (event) {
      await event.updateStats()
    }
  } catch (error) {
    console.error('Error updating event stats after attendance removal:', error)
  }
})

// Static methods
attendanceSchema.statics.findByUser = function(userId, filter = {}) {
  return this.find({ 
    ...filter, 
    userId: userId 
  }).populate('event')
}

attendanceSchema.statics.findByEvent = function(eventId, filter = {}) {
  return this.find({ 
    ...filter, 
    eventId: eventId 
  }).populate('user')
}

attendanceSchema.statics.isUserAttended = async function(userId, eventId) {
  const attendance = await this.findOne({ 
    userId: userId, 
    eventId: eventId 
  })
  return !!attendance
}

attendanceSchema.statics.getEventAttendanceStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 }
      }
    }
  ])
  
  const Registration = mongoose.model('Registration')
  const totalRegistrations = await Registration.countDocuments({
    eventId: eventId,
    status: 'registered'
  })
  
  const totalAttendance = await this.countDocuments({ eventId: eventId })
  
  return {
    totalRegistrations,
    totalAttendance,
    attendanceRate: totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0,
    methodBreakdown: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})
  }
}

// Instance methods
attendanceSchema.methods.verify = async function() {
  this.isVerified = true
  await this.save()
  return this
}

attendanceSchema.methods.unverify = async function(reason = null) {
  this.isVerified = false
  this.notes = reason ? `Unverified: ${reason}` : 'Unverified'
  await this.save()
  return this
}

const Attendance = mongoose.model('Attendance', attendanceSchema)

export default Attendance