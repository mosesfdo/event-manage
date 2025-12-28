# Deployment Guide

## Overview
This guide covers deploying the Event Management Platform to production using free-tier cloud services.

## Architecture Overview
```
Frontend (Vercel/Netlify) → Backend (Render/Railway) → Database (MongoDB Atlas)
```

## Prerequisites
- Node.js 16+ installed locally
- Git repository (GitHub/GitLab)
- Accounts on deployment platforms

---

## 🚀 Quick Deploy (Recommended)

### Option 1: Vercel + Render + MongoDB Atlas

#### 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Create database user and get connection string
4. Whitelist IP addresses (0.0.0.0/0 for development)

#### 2. Backend Deployment (Render)
1. Push code to GitHub
2. Go to [Render](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node.js
   - **Instance Type**: Free

#### 3. Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

---

## 📋 Detailed Deployment Steps

### Step 1: Prepare Repository

<function_calls>
<invoke name="fsWrite">
<parameter name="path">deployment/prepare-deploy.mdpository Preparation

## 1. Environment Variables Setup

### Backend Environment Variables
Create `backend/.env` with production values:

```bash
# Production Environment
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management

# JWT Secrets (Generate strong secrets)
JWT_ACCESS_SECRET=your-production-access-secret-256-bit
JWT_REFRESH_SECRET=your-production-refresh-secret-256-bit
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://your-app.vercel.app

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
Create `frontend/.env.production`:

```bash
# API Configuration (Update after backend deployment)
VITE_API_URL=https://your-backend.onrender.com/api

# App Configuration
VITE_NODE_ENV=production
VITE_APP_NAME=EventHub
VITE_APP_VERSION=1.0.0
```

## 2. Package.json Updates

### Backend package.json
Ensure these scripts exist:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "echo 'No build step required'",
    "postinstall": "echo 'Backend dependencies installed'"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Frontend package.json
Ensure these scripts exist:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 3. Create Production Server File

Create `backend/src/server.js`:
```javascript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import database connection
import connectDB from './config/database.js'

const app = express()
const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Data sanitization
app.use(mongoSanitize())

// Compression
app.use(compression())

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes (to be implemented in Phase 3)
app.use('/api', (req, res) => {
  res.status(200).json({
    message: 'Event Management API',
    version: '1.0.0',
    status: 'Active'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})
```

# Deployment Options

## Option 1: Free Tier Deployment (Recommended for Development)

### Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (M0 Sandbox - Free)

2. **Configure Database**
   ```bash
   # Create database user
   Username: eventmanager
   Password: [Generate strong password]
   
   # Whitelist IP addresses
   Add: 0.0.0.0/0 (Allow access from anywhere)
   ```

3. **Get Connection String**
   ```bash
   mongodb+srv://eventmanager:<password>@cluster0.xxxxx.mongodb.net/event-management
   ```

### Step 2: Backend Deployment (Render)

1. **Prepare Repository**
   ```bash
   # Ensure backend/src/server.js exists
   # Ensure backend/.env is configured
   # Push code to GitHub
   ```

2. **Deploy to Render**
   - Go to [Render](https://render.com)
   - Connect GitHub account
   - Create new "Web Service"
   - Select your repository
   - Configure:
     ```
     Name: event-management-backend
     Environment: Node
     Build Command: cd backend && npm install
     Start Command: cd backend && npm start
     ```

3. **Add Environment Variables in Render**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://eventmanager:password@cluster0.xxxxx.mongodb.net/event-management
   JWT_ACCESS_SECRET=your-256-bit-secret
   JWT_REFRESH_SECRET=your-256-bit-secret
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGIN=https://your-app.vercel.app
   ```

4. **Deploy and Get URL**
   - Deploy will start automatically
   - Get backend URL: `https://your-backend.onrender.com`

### Step 3: Frontend Deployment (Vercel)

1. **Update Frontend Environment**
   ```bash
   # Create frontend/.env.production
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Connect GitHub account
   - Import your repository
   - Configure:
     ```
     Framework Preset: Vite
     Root Directory: frontend
     Build Command: npm run build
     Output Directory: dist
     ```

3. **Add Environment Variables in Vercel**
   ```bash
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_NODE_ENV=production
   ```

4. **Deploy and Get URL**
   - Get frontend URL: `https://your-app.vercel.app`

5. **Update Backend CORS**
   - Update `FRONTEND_URL` and `CORS_ORIGIN` in Render with your Vercel URL
   - Redeploy backend

## Option 2: Railway Deployment (Alternative)

### Backend on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway new
railway add --database mongodb
railway up --service backend
```

### Frontend on Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

## Option 3: Docker Deployment

### Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: event-management-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: event-management
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: event-management-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/event-management?authSource=admin
      JWT_ACCESS_SECRET: your-access-secret
      JWT_REFRESH_SECRET: your-refresh-secret
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: event-management-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:5000/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Post-Deployment Steps

### 1. Test Deployment
```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test frontend
curl https://your-app.vercel.app
```

### 2. Create Admin User
```bash
# Use MongoDB Compass or Atlas to create first admin user
{
  "email": "admin@yourdomain.com",
  "password": "hashedPassword",
  "firstName": "Admin",
  "lastName": "User",
  "role": "super_admin",
  "isActive": true,
  "emailVerified": true
}
```

### 3. Configure Domain (Optional)
```bash
# Add custom domain in Vercel
# Update CORS_ORIGIN and FRONTEND_URL
# Add SSL certificate
```

### 4. Set up Monitoring
```bash
# Add error tracking (Sentry)
# Set up uptime monitoring
# Configure log aggregation
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Ensure CORS_ORIGIN matches frontend URL exactly
   # Check both HTTP and HTTPS
   ```

2. **Database Connection**
   ```bash
   # Verify MongoDB URI format
   # Check IP whitelist in Atlas
   # Ensure network access is configured
   ```

3. **Environment Variables**
   ```bash
   # Verify all required env vars are set
   # Check for typos in variable names
   # Ensure secrets are properly generated
   ```

4. **Build Failures**
   ```bash
   # Check Node.js version compatibility
   # Verify package.json scripts
   # Check for missing dependencies
   ```

### Performance Optimization

1. **Frontend**
   ```bash
   # Enable gzip compression
   # Add CDN for static assets
   # Implement code splitting
   ```

2. **Backend**
   ```bash
   # Add Redis for caching
   # Implement database connection pooling
   # Add request compression
   ```

3. **Database**
   ```bash
   # Create proper indexes
   # Monitor query performance
   # Set up database monitoring
   ```

## Security Checklist

- [ ] Strong JWT secrets (256-bit)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Error messages don't leak sensitive info
- [ ] File upload restrictions in place
- [ ] Security headers configured

## Maintenance

### Regular Tasks
- Monitor application logs
- Update dependencies monthly
- Backup database weekly
- Review security alerts
- Monitor performance metrics
- Update SSL certificates annually

### Scaling Considerations
- Implement horizontal scaling
- Add load balancer
- Set up database replicas
- Implement caching layer
- Add CDN for global distribution