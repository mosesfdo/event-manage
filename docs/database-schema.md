# Database Schema Design

## Database Choice: MongoDB
- **Flexibility**: Schema evolution for event types
- **Performance**: Fast queries for event listings
- **Scalability**: Horizontal scaling capabilities
- **JSON-native**: Natural fit for REST APIs

## Schema Relationships

```
Users (1) ←→ (M) Registrations (M) ←→ (1) Events
Users (1) ←→ (M) Attendance (M) ←→ (1) Events  
Users (1) ←→ (M) Feedback (M) ←→ (1) Events
Users (1) ←→ (M) Certificates (M) ←→ (1) Events
Clubs (1) ←→ (M) Events
Clubs (1) ←→ (M) Users (club_admin role)
```

## Collection Schemas

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String, // unique, required
  password: String, // hashed with bcrypt
  firstName: String, // required
  lastName: String, // required
  studentId: String, // unique for students
  role: String, // enum: ['student', 'club_admin', 'faculty', 'super_admin']
  clubId: ObjectId, // reference to Club (for club_admin)
  isActive: Boolean, // default: true
  emailVerified: Boolean, // default: false
  profilePicture: String, // URL to image
  createdAt: Date,
  updatedAt: Date
}
```

### Clubs Collection
```javascript
{
  _id: ObjectId,
  name: String, // required, unique
  description: String,
  logo: String, // URL to image
  contactEmail: String,
  isActive: Boolean, // default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String, // required
  description: String, // required
  clubId: ObjectId, // reference to Club
  createdBy: ObjectId, // reference to User (club_admin)
  
  // Event Details
  date: Date, // required
  startTime: Date, // required
  endTime: Date, // required
  location: String, // required
  venue: String,
  
  // Registration
  maxParticipants: Number, // null = unlimited
  registrationDeadline: Date,
  registrationFee: Number, // default: 0
  
  // Status & Visibility
  status: String, // enum: ['draft', 'published', 'cancelled', 'completed']
  isPublic: Boolean, // default: true
  requiresApproval: Boolean, // default: false (faculty approval)
  approvedBy: ObjectId, // reference to User (faculty)
  approvedAt: Date,
  
  // Media
  poster: String, // URL to image
  images: [String], // array of image URLs
  
  // Metadata
  tags: [String],
  category: String, // enum: ['academic', 'cultural', 'sports', 'technical', 'social']
  
  // Attendance
  qrCode: String, // current QR token
  qrCodeExpiry: Date,
  attendanceRequired: Boolean, // default: true
  
  createdAt: Date,
  updatedAt: Date
}
```

### Registrations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to User
  eventId: ObjectId, // reference to Event
  registeredAt: Date,
  status: String, // enum: ['registered', 'cancelled', 'waitlisted']
  paymentStatus: String, // enum: ['pending', 'paid', 'refunded'] if fee > 0
  paymentId: String, // external payment reference
  
  // Compound index on (userId, eventId) - unique
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to User
  eventId: ObjectId, // reference to Event
  registrationId: ObjectId, // reference to Registration
  
  // Attendance Details
  markedAt: Date, // when attendance was marked
  markedBy: ObjectId, // reference to User (who marked - could be self or admin)
  method: String, // enum: ['qr_scan', 'manual', 'bulk_upload']
  location: {
    latitude: Number,
    longitude: Number
  }, // optional GPS coordinates
  
  // Verification
  qrToken: String, // the QR token used for verification
  isVerified: Boolean, // default: true
  
  // Compound index on (userId, eventId) - unique
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to User
  eventId: ObjectId, // reference to Event
  attendanceId: ObjectId, // reference to Attendance (must have attended)
  
  // Feedback Data
  rating: Number, // 1-5 scale, required
  comment: String, // optional text feedback
  categories: {
    content: Number, // 1-5
    organization: Number, // 1-5
    venue: Number, // 1-5
    overall: Number // 1-5
  },
  
  // Metadata
  isAnonymous: Boolean, // default: false
  submittedAt: Date,
  
  // Compound index on (userId, eventId) - unique
}
```

### Certificates Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to User
  eventId: ObjectId, // reference to Event
  attendanceId: ObjectId, // reference to Attendance
  
  // Certificate Details
  certificateId: String, // unique public identifier for verification
  recipientName: String, // user's full name at time of generation
  eventTitle: String, // event title at time of generation
  clubName: String, // club name at time of generation
  eventDate: Date, // event date
  
  // File & Verification
  pdfUrl: String, // URL to generated PDF
  qrCodeData: String, // QR code data for verification
  verificationUrl: String, // public verification URL
  
  // Status
  isRevoked: Boolean, // default: false
  revokedAt: Date,
  revokedBy: ObjectId, // reference to User
  revokeReason: String,
  
  // Generation Details
  generatedAt: Date,
  generatedBy: ObjectId, // reference to User (system or admin)
  template: String, // certificate template used
  
  // Index on certificateId - unique
}
```

## Indexes for Performance

### Users Collection
```javascript
// Unique indexes
{ email: 1 } // unique
{ studentId: 1 } // unique, sparse

// Query indexes
{ role: 1, isActive: 1 }
{ clubId: 1, role: 1 }
```

### Events Collection
```javascript
// Query indexes
{ status: 1, date: 1 }
{ clubId: 1, status: 1 }
{ date: 1, status: 1 }
{ category: 1, status: 1 }
{ tags: 1, status: 1 }

// Text search
{ title: "text", description: "text", tags: "text" }
```

### Registrations Collection
```javascript
// Unique compound index
{ userId: 1, eventId: 1 } // unique

// Query indexes
{ eventId: 1, status: 1 }
{ userId: 1, registeredAt: -1 }
```

### Attendance Collection
```javascript
// Unique compound index
{ userId: 1, eventId: 1 } // unique

// Query indexes
{ eventId: 1, markedAt: -1 }
{ userId: 1, markedAt: -1 }
```

### Feedback Collection
```javascript
// Unique compound index
{ userId: 1, eventId: 1 } // unique

// Query indexes
{ eventId: 1, rating: 1 }
{ eventId: 1, submittedAt: -1 }
```

### Certificates Collection
```javascript
// Unique indexes
{ certificateId: 1 } // unique

// Query indexes
{ userId: 1, generatedAt: -1 }
{ eventId: 1, generatedAt: -1 }
{ isRevoked: 1 }
```

## Data Validation Rules

### Business Logic Constraints
1. **Registration Rules**:
   - Cannot register after deadline
   - Cannot register if event is full
   - Cannot register for past events
   - Cannot register twice for same event

2. **Attendance Rules**:
   - Must be registered to mark attendance
   - Can only mark attendance during event time window
   - QR codes expire after event ends
   - One attendance record per user per event

3. **Feedback Rules**:
   - Must have attended event to submit feedback
   - One feedback per user per event
   - Rating must be between 1-5
   - Cannot submit feedback for future events

4. **Certificate Rules**:
   - Only generated for attended events
   - Certificate ID must be globally unique
   - Cannot generate duplicate certificates
   - Revoked certificates cannot be un-revoked

## Migration Strategy

### Phase 1: Core Collections
1. Users, Clubs, Events
2. Basic CRUD operations
3. Authentication & authorization

### Phase 2: Registration System
1. Registrations collection
2. Registration business logic
3. Capacity management

### Phase 3: Attendance & Feedback
1. Attendance collection
2. QR code system
3. Feedback collection

### Phase 4: Certificates
1. Certificates collection
2. PDF generation
3. Verification system