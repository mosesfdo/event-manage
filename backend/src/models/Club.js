import mongoose from 'mongoose'

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Club name must be at least 2 characters'],
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    default: null
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid contact email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Social media links
  socialLinks: {
    website: String,
    instagram: String,
    twitter: String,
    facebook: String,
    linkedin: String
  },
  // Club statistics (computed fields)
  stats: {
    totalEvents: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    totalAttendees: {
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
clubSchema.index({ name: 1 }, { unique: true })
clubSchema.index({ isActive: 1 })

// Virtual for events
clubSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'clubId'
})

// Virtual for admins
clubSchema.virtual('admins', {
  ref: 'User',
  localField: '_id',
  foreignField: 'clubId',
  match: { role: 'club_admin', isActive: true }
})

// Static method to find active clubs
clubSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isActive: true })
}

// Instance method to update stats
clubSchema.methods.updateStats = async function() {
  const Event = mongoose.model('Event')
  const User = mongoose.model('User')
  const Attendance = mongoose.model('Attendance')
  
  // Count total events
  const totalEvents = await Event.countDocuments({ 
    clubId: this._id, 
    status: { $ne: 'cancelled' } 
  })
  
  // Count total members (club admins)
  const totalMembers = await User.countDocuments({ 
    clubId: this._id, 
    role: 'club_admin', 
    isActive: true 
  })
  
  // Count total unique attendees across all events
  const attendeeStats = await Attendance.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    {
      $match: {
        'event.clubId': this._id
      }
    },
    {
      $group: {
        _id: '$userId'
      }
    },
    {
      $count: 'totalAttendees'
    }
  ])
  
  const totalAttendees = attendeeStats[0]?.totalAttendees || 0
  
  this.stats = {
    totalEvents,
    totalMembers,
    totalAttendees
  }
  
  await this.save()
  return this.stats
}

const Club = mongoose.model('Club', clubSchema)

export default Club