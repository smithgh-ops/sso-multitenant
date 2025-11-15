# Deployment Guide

This guide covers deploying the Multi-Tenant News SSO application to production.

## Prerequisites

- Server with Docker and Docker Compose installed
- Domain name (optional, for production domains)
- SSL certificates (recommended for production)
- Basic knowledge of Linux server administration

## Production Deployment

### 1. Prepare Your Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add current user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone the Repository

```bash
git clone <repository-url>
cd sso-multitenant
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the file with your production values
nano .env
```

**Important**: Set strong, unique values for:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`

Generate secure random strings:
```bash
# Generate a secure secret
openssl rand -base64 32
```

Example production `.env`:
```env
# PostgreSQL Database
POSTGRES_USER=newsapp
POSTGRES_PASSWORD=your-strong-database-password-here
POSTGRES_DB=newsdb

# Backend
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
BACKEND_PORT=4000

# Frontend
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-nextauth-secret-here
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
FRONTEND_PORT=3000
```

### 4. Build and Start Services

```bash
# Build production containers
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 5. Initialize Database

```bash
# Run migrations
docker exec -it news-backend-prod npx prisma migrate deploy

# Seed database (optional for initial data)
docker exec -it news-backend-prod npm run seed
```

### 6. Verify Deployment

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test backend
curl http://localhost:4000/health

# Test frontend
curl http://localhost:3000
```

## Using Makefile (Recommended)

The project includes a Makefile for easier operations:

```bash
# Start production environment
make prod-start

# View logs
make logs

# Run migrations
make migrate-deploy

# Seed database
make seed

# Stop production environment
make prod-stop
```

## Setting Up Nginx Reverse Proxy

For production, use Nginx as a reverse proxy:

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/newsapp`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/newsapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain Certificates

```bash
# For frontend
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For backend API
sudo certbot --nginx -d api.yourdomain.com
```

### 3. Update Environment Variables

Update `.env` to use HTTPS:
```env
FRONTEND_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
```

Restart services:
```bash
docker-compose -f docker-compose.prod.yml restart
```

## Database Backup

### Automated Backups

Create a backup script `/opt/backup-newsdb.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/newsdb"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="newsdb-prod"

mkdir -p $BACKUP_DIR

docker exec $CONTAINER pg_dump -U postgres newsdb | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Make it executable and add to cron:
```bash
chmod +x /opt/backup-newsdb.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/backup-newsdb.sh" | crontab -
```

### Manual Backup

```bash
docker exec newsdb-prod pg_dump -U postgres newsdb > backup.sql
```

### Restore from Backup

```bash
cat backup.sql | docker exec -i newsdb-prod psql -U postgres newsdb
```

## Monitoring

### Application Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f news-backend-prod
docker logs -f news-frontend-prod
docker logs -f newsdb-prod
```

### Health Checks

Create a monitoring script:

```bash
#!/bin/bash
# /opt/health-check.sh

# Check backend
if ! curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "Backend is down!"
    # Send alert (email, Slack, etc.)
fi

# Check frontend
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "Frontend is down!"
    # Send alert
fi
```

## Updating the Application

### 1. Pull Latest Changes

```bash
cd /path/to/sso-multitenant
git pull origin main
```

### 2. Rebuild and Restart

```bash
# Rebuild containers
docker-compose -f docker-compose.prod.yml build

# Restart services with zero downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker-compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

### 3. Run Migrations

```bash
docker exec -it news-backend-prod npx prisma migrate deploy
```

## Scaling Considerations

### Horizontal Scaling Backend

Use Docker Swarm or Kubernetes:

```bash
# Example with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.prod.yml newsapp
docker service scale newsapp_backend=3
```

### Database Read Replicas

For high-traffic scenarios:
1. Set up PostgreSQL replication
2. Configure read replicas
3. Update Prisma to use read replicas for queries

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Inspect container
docker inspect news-backend-prod

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Check database is running
docker ps | grep newsdb

# Check database logs
docker logs newsdb-prod

# Test connection
docker exec -it newsdb-prod psql -U postgres -d newsdb
```

### Performance Issues

```bash
# Check container resources
docker stats

# Increase container limits in docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Security Checklist

- [ ] Use strong passwords for database
- [ ] Use secure random secrets for JWT and NextAuth
- [ ] Enable SSL/TLS with valid certificates
- [ ] Configure firewall (UFW or iptables)
- [ ] Keep Docker and system packages updated
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Implement rate limiting (nginx or application level)
- [ ] Use environment variables for secrets (never commit)
- [ ] Regular security audits

## Maintenance Tasks

### Weekly
- Review application logs
- Check disk space
- Verify backups are working

### Monthly
- Update dependencies
- Review and rotate logs
- Test backup restoration
- Security patches

### Quarterly
- Full security audit
- Performance review
- Capacity planning

## Support and Monitoring Services

Consider integrating:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and performance monitoring
- **DataDog**: Infrastructure and application monitoring
- **PagerDuty**: Incident management and alerting
- **Uptime Robot**: Uptime monitoring

## Cost Optimization

For production deployment on cloud providers:

- **DigitalOcean**: $20-40/month for basic setup
- **AWS**: $30-60/month with RDS
- **Google Cloud**: $25-50/month
- **Azure**: $30-55/month

Optimize costs:
- Use reserved instances
- Set up auto-scaling
- Implement caching
- Optimize database queries
- Use CDN for static assets
