# Event Management Platform Deployment Script (PowerShell)
# Usage: .\scripts\deploy.ps1 [local|production|cleanup]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "production", "cleanup")]
    [string]$Environment = "local"
)

$ErrorActionPreference = "Stop"
$ProjectName = "event-management-platform"

Write-Host "🚀 Deploying Event Management Platform - Environment: $Environment" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Test-Dependencies {
    Write-Status "Checking dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -lt 16) {
            Write-Error "Node.js version 16 or higher is required. Current version: $nodeVersion"
            exit 1
        }
        Write-Status "Node.js version: $nodeVersion ✅"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Status "npm version: $npmVersion ✅"
    }
    catch {
        Write-Error "npm is not installed. Please install npm."
        exit 1
    }
    
    Write-Status "Dependencies check passed ✅"
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    # Backend dependencies
    Write-Status "Installing backend dependencies..."
    Set-Location backend
    npm ci
    Set-Location ..
    
    # Frontend dependencies
    Write-Status "Installing frontend dependencies..."
    Set-Location frontend
    npm ci
    Set-Location ..
    
    Write-Status "Dependencies installed ✅"
}

# Build frontend
function Build-Frontend {
    Write-Status "Building frontend..."
    Set-Location frontend
    npm run build
    Set-Location ..
    Write-Status "Frontend build completed ✅"
}

# Local deployment with Docker
function Deploy-Local {
    Write-Status "Starting local deployment with Docker..."
    
    # Check Docker
    try {
        docker --version | Out-Null
        Write-Status "Docker is available ✅"
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop."
        exit 1
    }
    
    # Check Docker Compose
    try {
        docker-compose --version | Out-Null
        Write-Status "Docker Compose is available ✅"
    }
    catch {
        Write-Error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    }
    
    # Check environment files
    if (-not (Test-Path "backend\.env")) {
        Write-Warning "Backend .env file not found. Creating from example..."
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Warning "Please update backend\.env with your configuration"
    }
    
    if (-not (Test-Path "frontend\.env")) {
        Write-Warning "Frontend .env file not found. Creating from example..."
        Copy-Item "frontend\.env.example" "frontend\.env"
    }
    
    # Build and start containers
    Write-Status "Building Docker containers..."
    docker-compose build
    
    Write-Status "Starting services..."
    docker-compose up -d
    
    # Wait for services
    Write-Status "Waiting for services to start..."
    Start-Sleep -Seconds 10
    
    # Health checks
    Write-Status "Performing health checks..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Status "Backend health check passed ✅"
        }
    }
    catch {
        Write-Error "Backend health check failed ❌"
        docker-compose logs backend
        exit 1
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Status "Frontend health check passed ✅"
        }
    }
    catch {
        Write-Error "Frontend health check failed ❌"
        docker-compose logs frontend
        exit 1
    }
    
    Write-Status "🎉 Local deployment completed successfully!"
    Write-Status "Frontend: http://localhost:3000"
    Write-Status "Backend: http://localhost:5000"
    Write-Status "Database: mongodb://localhost:27017"
    
    Write-Status "To view logs: docker-compose logs -f"
    Write-Status "To stop: docker-compose down"
}

# Production deployment guide
function Deploy-Production {
    Write-Status "Production deployment guide..."
    
    Write-Status "📋 Pre-deployment checklist:"
    Write-Host "  ✓ MongoDB Atlas cluster created"
    Write-Host "  ✓ Environment variables configured"
    Write-Host "  ✓ Domain names ready"
    Write-Host "  ✓ SSL certificates configured"
    
    Write-Status "🔧 Deployment steps:"
    Write-Host "  1. Deploy backend to Render/Railway"
    Write-Host "  2. Deploy frontend to Vercel/Netlify"
    Write-Host "  3. Update CORS origins"
    Write-Host "  4. Test deployment"
    
    Write-Status "📖 Detailed instructions available in docs/deployment-guide.md"
    
    # Validate environment files
    if (-not (Test-Path "backend\.env")) {
        Write-Error "Backend .env file is required for production deployment"
        exit 1
    }
    
    if (-not (Test-Path "frontend\.env.production")) {
        Write-Error "Frontend .env.production file is required"
        exit 1
    }
    
    # Build for production
    Build-Frontend
    
    Write-Status "✅ Production build completed"
    Write-Status "📤 Ready for deployment to production platforms"
}

# Cleanup function
function Invoke-Cleanup {
    Write-Status "Cleaning up Docker resources..."
    try {
        docker-compose down -v
        docker system prune -f
        Write-Status "Cleanup completed ✅"
    }
    catch {
        Write-Warning "Some cleanup operations failed, but continuing..."
    }
}

# Main deployment logic
try {
    switch ($Environment) {
        "local" {
            Test-Dependencies
            Install-Dependencies
            Deploy-Local
        }
        "production" {
            Test-Dependencies
            Install-Dependencies
            Deploy-Production
        }
        "cleanup" {
            Invoke-Cleanup
        }
        default {
            Write-Error "Invalid environment. Use: local, production, or cleanup"
            exit 1
        }
    }
    
    Write-Status "🎉 Deployment script completed!"
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    if ($Environment -eq "local") {
        Write-Status "Attempting cleanup..."
        Invoke-Cleanup
    }
    exit 1
}