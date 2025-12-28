# 🚀 Quick Deployment Guide

## Prerequisites
- Node.js 16+ installed
- Git repository set up
- MongoDB Atlas account (for production)

## 🏃‍♂️ Quick Start (Local Development)

### Option 1: Docker (Recommended)
```bash
# Clone and navigate to project
git clone <your-repo-url>
cd event-management-platform

# Run deployment script
./scripts/deploy.sh local
# or on Windows:
.\scripts\deploy.ps1 local

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: mongodb://localhost:27017
```

### Option 2: Manual Setup
```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

## 🌐 Production Deployment

### Step 1: Database Setup (MongoDB Atlas)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free M0 cluster
3. Create database user and get connection string
4. Whitelist IP: `0.0.0.0/0`

### Step 2: Backend Deployment (Render - Free)
1. Push code to GitHub
2. Go to [Render](https://render.com) → New Web Service
3. Connect GitHub repo
4. Configure:
   ```
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/event-management
   JWT_ACCESS_SECRET=your-256-bit-secret
   JWT_REFRESH_SECRET=your-256-bit-secret
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Step 3: Frontend Deployment (Vercel - Free)
1. Go to [Vercel](https://vercel.com) → Import Project
2. Select your GitHub repo
3. Configure:
   ```
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

### Step 4: Update CORS
1. Update backend environment variables in Render:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGIN=https://your-app.vercel.app
   ```
2. Redeploy backend

## 🔧 Alternative Platforms

### Railway + Netlify
```bash
# Backend to Railway
npm install -g @railway/cli
railway login
railway new
railway up

# Frontend to Netlify
npm install -g netlify-cli
cd frontend && npm run build
netlify deploy --prod --dir=dist
```

### Heroku + Vercel
```bash
# Backend to Heroku
heroku create your-backend-app
git subtree push --prefix backend heroku main

# Frontend to Vercel (same as above)
```

## 🐳 Docker Production
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or build individual containers
docker build -t event-backend ./backend
docker build -t event-frontend ./frontend
```

## 🔍 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure `CORS_ORIGIN` matches frontend URL exactly
2. **Database Connection**: Check MongoDB URI format and IP whitelist
3. **Build Failures**: Verify Node.js version (16+) and dependencies

### Health Checks
```bash
# Backend health
curl https://your-backend.onrender.com/health

# Frontend
curl https://your-app.vercel.app
```

## 📊 Monitoring
- **Render**: Built-in logs and metrics
- **Vercel**: Analytics dashboard
- **MongoDB Atlas**: Database monitoring

## 🔒 Security Checklist
- [ ] Strong JWT secrets (256-bit)
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] CORS properly configured

## 📞 Support
- Check `docs/deployment-guide.md` for detailed instructions
- Review logs for error messages
- Ensure all environment variables are set correctly

---

**🎉 Your Event Management Platform is now live!**

Frontend: `https://your-app.vercel.app`  
Backend: `https://your-backend.onrender.com`