# Hobby Loop - Deployment Guide

This guide covers deploying Hobby Loop using Docker and Docker Compose for both local development and production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Database Management](#database-management)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## 🔧 Prerequisites

Before deploying Hobby Loop, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Verify Installation

```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

Get Hobby Loop running in under 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd hoby-loop

# 2. Create environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Check service health
docker-compose ps

# 5. Seed the database (optional)
docker-compose exec backend ./hoby-loop seed
```

The application will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## ⚙️ Environment Configuration

### Creating Your Environment File

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

### Required Environment Variables

Edit `.env` with your configuration:

```bash
# Database Configuration
DB_NAME=hobyloop
DB_USER=hoby
DB_PASSWORD=your-secure-password-here
DB_HOST=postgres
DB_PORT=5432
DB_SSLMODE=disable

# Backend Configuration
SERVER_PORT=8080
GIN_MODE=release
JWT_SECRET=your-jwt-secret-here

# Frontend Configuration
FRONTEND_PORT=80
VITE_API_URL=http://localhost:8080
```

### Generating Secure Secrets

For production, generate strong secrets:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

## 💻 Local Development Setup

### Option 1: Docker Compose (Recommended)

Run the entire stack with Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Option 2: Hybrid Development

Run database in Docker, backend and frontend locally:

```bash
# Start only the database
docker-compose up -d postgres

# In terminal 1: Run backend
go run main.go

# In terminal 2: Run frontend
cd frontend
npm run dev
```

### Development Workflow

```bash
# Rebuild after code changes
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend

# View service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec postgres psql -U hoby -d hobyloop
```

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `GIN_MODE=release`
- [ ] Generate strong `JWT_SECRET`
- [ ] Use strong `DB_PASSWORD`
- [ ] Set `DB_SSLMODE=require` (if supported)
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging

### Production Environment Variables

```bash
# Production .env example
DB_NAME=hobyloop
DB_USER=hoby
DB_PASSWORD=<strong-random-password>
DB_HOST=postgres
DB_PORT=5432
DB_SSLMODE=require

SERVER_PORT=8080
GIN_MODE=release
JWT_SECRET=<strong-random-secret>

FRONTEND_PORT=80
VITE_API_URL=https://api.yourdomain.com
```

### Deployment Steps

1. **Prepare the server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo apt install docker-compose-plugin
   ```

2. **Clone and configure:**
   ```bash
   git clone <repository-url>
   cd hoby-loop
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Build and start services:**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify deployment:**
   ```bash
   docker-compose ps
   docker-compose logs
   ```

### Using a Reverse Proxy (Nginx/Caddy)

For production, use a reverse proxy for SSL/TLS:

**Nginx example:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🗄️ Database Management

### Running Migrations

Migrations run automatically when the backend starts. To run manually:

```bash
# Using Docker
docker-compose exec backend ./hoby-loop migrate

# Or restart the backend service
docker-compose restart backend
```

### Seeding the Database

Seed the database with sample data:

```bash
# Generate sample data (if needed)
cd tools
python generate.py > data.json
cd ..

# Run seeder
docker-compose exec backend sh -c "cd /app && go run cmd/seeder/main.go"
```

**Note:** The seeder expects `tools/data.json` to exist. You may need to copy it into the container or mount it as a volume.

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U hoby hobyloop > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker-compose exec -T postgres psql -U hoby hobyloop < backup_20260125_120000.sql
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U hoby -d hobyloop

# Common queries
\dt              # List tables
\d users         # Describe users table
SELECT COUNT(*) FROM users;
```

### Resetting the Database

```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm hoby-loop_postgres_data

# Start fresh
docker-compose up -d
```

## 🏥 Health Checks

### Service Health Endpoints

All services include health checks:

- **Backend**: http://localhost:8080/ping
- **Frontend**: http://localhost:80/health
- **Database**: Automatic via Docker health check

### Checking Service Status

```bash
# View all service health
docker-compose ps

# Check specific service
docker-compose exec backend wget -qO- http://localhost:8080/ping

# View health check logs
docker inspect hoby-loop-backend | grep -A 10 Health
```

### Manual Health Verification

```bash
# Backend API
curl http://localhost:8080/ping

# Frontend
curl http://localhost:80/health

# Database
docker-compose exec postgres pg_isready -U hoby -d hobyloop
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend

# Verify environment variables
docker-compose config
```

#### 2. Database Connection Failed

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U hoby -d hobyloop -c "SELECT 1;"
```

#### 3. Frontend Can't Connect to Backend

- Verify `VITE_API_URL` in `.env`
- Check backend is running: `docker-compose ps backend`
- Check backend logs: `docker-compose logs backend`
- Verify CORS settings in backend

#### 4. Port Already in Use

```bash
# Find process using port 8080
sudo lsof -i :8080

# Change port in .env
SERVER_PORT=8081
FRONTEND_PORT=8080

# Restart services
docker-compose down
docker-compose up -d
```

#### 5. Permission Denied Errors

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

#### 6. Build Failures

```bash
# Clean build cache
docker-compose build --no-cache

# Remove old images
docker system prune -a

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend

# Since specific time
docker-compose logs --since 2024-01-25T10:00:00
```

### Debugging Inside Containers

```bash
# Access backend container
docker-compose exec backend sh

# Access database container
docker-compose exec postgres sh

# Run commands
docker-compose exec backend ps aux
docker-compose exec backend env
```

## 🔧 Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or rolling update (zero downtime)
docker-compose up -d --build --no-deps backend
docker-compose up -d --build --no-deps frontend
```

### Monitoring Resources

```bash
# View resource usage
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

### Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# Edit Docker daemon config
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Backup Strategy

**Automated backup script:**

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/hoby-loop"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U hoby hobyloop > $BACKUP_DIR/db_$DATE.sql

# Backup environment file
cp .env $BACKUP_DIR/env_$DATE

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql"
```

**Schedule with cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/hoby-loop/backup.sh
```

### Security Updates

```bash
# Update base images
docker-compose pull

# Rebuild with updated images
docker-compose up -d --build

# Update system packages in containers
docker-compose exec backend apk update && apk upgrade
```

## 📊 Monitoring

### Basic Monitoring

```bash
# Service status
docker-compose ps

# Resource usage
docker stats

# Health checks
curl http://localhost:8080/ping
curl http://localhost:80/health
```

### Production Monitoring

Consider implementing:
- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Centralized logging
- **Uptime monitoring**: UptimeRobot, Pingdom
- **APM**: New Relic, DataDog

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong passwords** - Generate with `openssl rand -base64 32`
3. **Enable SSL/TLS** - Use Let's Encrypt or similar
4. **Regular updates** - Keep Docker images and dependencies updated
5. **Limit exposed ports** - Use firewall rules
6. **Run as non-root** - Already configured in Dockerfiles
7. **Regular backups** - Automate database backups
8. **Monitor logs** - Watch for suspicious activity

## 📞 Support

For issues and questions:
- Check logs: `docker-compose logs`
- Review this guide's troubleshooting section
- Check GitHub issues
- Contact the development team

---

**Last Updated**: 2026-01-25
**Version**: 1.0.0
