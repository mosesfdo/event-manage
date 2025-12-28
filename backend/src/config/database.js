import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management'
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    }
    
    const conn = await mongoose.connect(mongoURI, options)
    
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected')
    })
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('MongoDB connection closed through app termination')
        process.exit(0)
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err)
        process.exit(1)
      }
    })
    
    return conn
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    return {
      status: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    }
  }
}

// Initialize database indexes
export const initializeIndexes = async () => {
  try {
    console.log('Initializing database indexes...')
    
    // Import all models to ensure indexes are created
    await import('../models/User.js')
    await import('../models/Club.js')
    await import('../models/Event.js')
    await import('../models/Registration.js')
    await import('../models/Attendance.js')
    await import('../models/Feedback.js')
    await import('../models/Certificate.js')
    
    // Ensure indexes are created
    await mongoose.connection.db.admin().command({ listIndexes: 'users' })
    
    console.log('Database indexes initialized successfully')
  } catch (error) {
    console.error('Error initializing database indexes:', error)
    throw error
  }
}

export default connectDB