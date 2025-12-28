#!/bin/bash

# Event Management Platform Deployment Script
# Usage: ./scripts/deploy.sh [local|production]

set -e

ENVIRONMENT=${1:-local}
PROJECT_NAME="event-management-platform"

echo "🚀 Deploying Event Management Platform - Environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Dependencies check passed ✅"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm ci
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm ci
    cd ..
    
    print_status "Dependencies installed ✅"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    print_status "Frontend build completed ✅"
}

# Local deployment with Docker
deploy_local() {
    print_status "Starting local deployment with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    # Check if .env files exist
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found. Creating from example..."
        cp backend/.env.example backend/.env
        print_warning "Please update backend/.env with your configuration"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found. Creating from example..."
        cp frontend/.env.example frontend/.env
    fi
    
    # Build and start containers
    print_status "Building Docker containers..."
    docker-compose build
    
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Health check
    print_status "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "Backend health check passed ✅"
    else
        print_error "Backend health check failed ❌"
        docker-compose logs backend
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend health check passed ✅"
    else
        print_error "Frontend health check failed ❌"
        docker-compose logs frontend
        exit 1
    fi
    
    print_status "🎉 Local deployment completed successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
    print_status "Database: mongodb://localhost:27017"
    
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Production deployment guide
deploy_production() {
    print_status "Production deployment guide..."
    
    print_status "📋 Pre-deployment checklist:"
    echo "  ✓ MongoDB Atlas cluster created"
    echo "  ✓ Environment variables configured"
    echo "  ✓ Domain names ready"
    echo "  ✓ SSL certificates configured"
    
    print_status "🔧 Deployment steps:"
    echo "  1. Deploy backend to Render/Railway"
    echo "  2. Deploy frontend to Vercel/Netlify"
    echo "  3. Update CORS origins"
    echo "  4. Test deployment"
    
    print_status "📖 Detailed instructions available in docs/deployment-guide.md"
    
    # Validate environment files
    if [ ! -f "backend/.env" ]; then
        print_error "Backend .env file is required for production deployment"
        exit 1
    fi
    
    if [ ! -f "frontend/.env.production" ]; then
        print_error "Frontend .env.production file is required"
        exit 1
    fi
    
    # Build for production
    build_frontend
    
    print_status "✅ Production build completed"
    print_status "📤 Ready for deployment to production platforms"
}

# Cleanup function
cleanup() {
    if [ "$ENVIRONMENT" = "local" ]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        print_status "Cleanup completed ✅"
    fi
}

# Main deployment logic
main() {
    case $ENVIRONMENT in
        "local")
            check_dependencies
            install_dependencies
            deploy_local
            ;;
        "production")
            check_dependencies
            install_dependencies
            deploy_production
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            print_error "Invalid environment. Use: local, production, or cleanup"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main

print_status "🎉 Deployment script completed!"