# 📋 Deployment Procedures

Standard operating procedures for deploying and managing infrastructure stacks.

## 🎯 Overview

This document defines **repeatable, tested procedures** for:
- Initial infrastructure setup
- Stack deployment
- Updates and maintenance
- Backup and recovery
- Emergency procedures

---

## 🚀 Initial Server Setup

### Prerequisites Check

Before starting, verify:

```bash
# Check system
cat /etc/os-release  # Ubuntu 24.04+
free -h              # At least 4GB RAM
df -h                # At least 50GB free space

# Check network
ip addr              # Public IP assigned
ping -c 4 8.8.8.8   # Internet connectivity
```

### Install Docker

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installation
docker --version
# Expected: Docker version 20.10.x or newer

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify Docker Compose
docker compose version
# Expected: Docker Compose version v2.x.x or newer
```

### Configure Docker

```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes (re-login or use)
newgrp docker

# Verify permission
docker ps
# Should run without sudo

# Configure Docker daemon (optional)
sudo nano /etc/docker/daemon.json
```

**Recommended daemon.json**:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker
```

### Install Additional Tools

```bash
# Install essential tools
sudo apt install -y \
  git \
  curl \
  wget \
  jq \
  htop \
  vim \
  nano

# Verify installations
git --version
jq --version
```

### Configure Firewall

```bash
# Install UFW if not present
sudo apt install -y ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential services
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt)
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

---

## 📦 Repository Setup

### Clone Repository

```bash
# Create workspace directory
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone git@github.com:YourUsername/infra-production.git

# Or via HTTPS
git clone https://github.com/YourUsername/infra-production.git

# Enter repository
cd infra-production

# Verify structure
ls -la
```

### Initial Configuration

```bash
# Make scripts executable
find . -name "*.sh" -type f -exec chmod +x {} \;

# Verify permissions
ls -la *.sh
```

---

## 🌐 DNS Configuration

### Required DNS Records

Configure these records **before deployment**:

```
# Wildcard (recommended)
*.yourdomain.com    A    YOUR_SERVER_IP

# Or specific records
yourdomain.com           A    YOUR_SERVER_IP
traefik.yourdomain.com   A    YOUR_SERVER_IP
app.yourdomain.com       A    YOUR_SERVER_IP
api.yourdomain.com       A    YOUR_SERVER_IP
```

### Verify DNS

```bash
# Check DNS resolution
dig yourdomain.com +short
# Should return: YOUR_SERVER_IP

# Check wildcard
dig app.yourdomain.com +short
# Should return: YOUR_SERVER_IP

# Check from external source
# https://www.whatsmydns.net/
```

### DNS Propagation

- **Typical time**: 5 minutes to 24 hours
- **Maximum time**: 48 hours
- **Check**: Use multiple DNS checkers
- **Proceed**: Only when DNS resolves correctly

---

## 🔧 Standard Deployment Procedure

This procedure applies to **every stack**:

### Step 1: Navigate to Stack

```bash
cd ~/apps/infra-production
cd <stack-directory>
# Example: cd reverse-proxy/traefik
# Example: cd stacks/dotnet-app
```

### Step 2: Create Configuration

```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env
```

**Required actions**:
- Set all required variables (marked in .env.example)
- Generate strong passwords
- Configure domain names
- Review optional settings

### Step 3: Validate Configuration

```bash
# Check .env exists
ls -la .env

# Verify required variables (example)
grep -E "DOMAIN|PASSWORD|SECRET" .env

# Test docker-compose config
docker compose config
```

### Step 4: Deploy

```bash
# Make deploy script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**Expected output**:
- ✅ Configuration loaded
- ✅ Prerequisites checked
- ✅ Images pulled
- ✅ Services started
- ✅ Health checks passed

### Step 5: Verify Deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Test health endpoint (if available)
curl https://your-domain.com/health

# Check Traefik dashboard
# http://SERVER_IP:8080/dashboard/
```

### Step 6: Document Deployment

```bash
# Record deployment
echo "$(date): Deployed <stack-name>" >> ~/deployments.log

# Save configuration snapshot (without secrets)
docker compose config > deployed-config.yml
```

---

## 🔐 Security Procedures

### Generate Secrets

**Always use cryptographically secure methods**:

```bash
# Strong password (32 characters)
openssl rand -base64 32

# JWT secret (64 characters)
openssl rand -base64 64

# API key (hex, 32 bytes)
openssl rand -hex 32

# UUID
uuidgen
```

### Secure .env Files

```bash
# Set proper permissions
chmod 600 .env

# Verify
ls -la .env
# Should show: -rw------- (only owner can read/write)

# Never commit .env
git status
# Should show .env as ignored
```

### Password Policy

- **Minimum length**: 20 characters
- **Complexity**: Uppercase, lowercase, numbers, symbols
- **Uniqueness**: Different password per service
- **Rotation**: Every 90 days
- **Storage**: Password manager or secure vault

---

## 🔄 Update Procedures

### Update Single Stack

```bash
cd ~/apps/infra-production/<stack-path>

# Pull latest images
docker compose pull

# Recreate containers
docker compose up -d

# Verify
docker compose ps
docker compose logs --tail=50
```

### Update All Stacks

```bash
cd ~/apps/infra-production

# Update reverse proxy first
cd reverse-proxy/traefik
docker compose pull && docker compose up -d

# Update each stack
for stack in stacks/*/; do
  echo "Updating $(basename $stack)"
  cd "$stack"
  docker compose pull && docker compose up -d
  cd ../..
done
```

### Update Repository

```bash
cd ~/apps/infra-production

# Stash local changes (if any)
git stash

# Pull latest changes
git pull

# Reapply local changes
git stash pop

# Review changes
git log -5
git diff HEAD~1
```

---

## 💾 Backup Procedures

### Automated Backup

Each stack with a backup script:

```bash
cd <stack-directory>

# Run backup
./scripts/backup.sh

# Verify backup created
ls -lh backups/
```

### Manual Backup

```bash
# Database backup (example: PostgreSQL)
docker compose exec postgres pg_dump -U user dbname > backup.sql

# Compress backup
gzip backup.sql

# Move to backup location
mv backup.sql.gz ~/backups/$(date +%Y%m%d)-backup.sql.gz
```

### Backup Schedule

Recommended schedule:
- **Databases**: Daily at 2 AM
- **Configuration**: Weekly
- **Full system**: Monthly

**Setup cron job**:
```bash
# Edit crontab
crontab -e

# Add backup jobs
0 2 * * * /path/to/backup-script.sh
```

---

## 🔄 Restore Procedures

### Restore from Backup

```bash
cd <stack-directory>

# List available backups
ls -lh backups/

# Restore
./scripts/restore.sh backups/backup-20260108-120000.tar.gz

# Verify restoration
docker compose ps
docker compose logs -f
```

### Manual Database Restore

```bash
# Stop application
docker compose stop app

# Restore database
cat backup.sql | docker compose exec -T postgres psql -U user -d dbname

# Start application
docker compose up -d app
```

---

## 🚨 Emergency Procedures

### Service Down

```bash
# Check status
docker compose ps

# View recent logs
docker compose logs --tail=100 <service-name>

# Restart service
docker compose restart <service-name>

# If restart fails, redeploy
./deploy.sh
```

### Complete Stack Failure

```bash
# Stop all containers
docker compose down

# Check system resources
df -h
free -h
docker system df

# Clean if needed
docker system prune -f

# Redeploy
./deploy.sh
```

### SSL Certificate Issues

```bash
# Check certificate status in Traefik
docker logs traefik | grep -i acme

# Force renewal (Traefik)
cd reverse-proxy/traefik
docker compose down
rm -f letsencrypt/acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
docker compose up -d

# Wait 2-5 minutes for new certificates
```

### Rollback Deployment

```bash
# Check previous image
docker images | grep <service-name>

# Use specific image version
# Edit docker-compose.yml or .env
nano .env
# Change: IMAGE=service:previous-version

# Redeploy
docker compose up -d

# Verify
docker compose ps
```

---

## 📊 Monitoring Procedures

### Daily Health Check

```bash
# Run for each stack
cd <stack-directory>
./scripts/health-check.sh
```

### Resource Monitoring

```bash
# Container resource usage
docker stats --no-stream

# Disk usage
df -h
docker system df

# Memory usage
free -h
```

### Log Review

```bash
# Recent errors across all stacks
docker ps -q | xargs -I {} docker logs --tail=50 {} 2>&1 | grep -i error

# Specific service logs
docker compose logs --tail=100 -f <service-name>
```

---

## 📝 Documentation Procedures

### After Deployment

Document:
- Date and time of deployment
- Stack name and version
- Configuration changes
- Issues encountered
- Resolution steps

### Update README

If stack behavior changes:
```bash
cd <stack-directory>
nano README.md
# Update relevant sections
git add README.md
git commit -m "docs: update stack documentation"
```

---

## ✅ Deployment Checklist

Use this for every deployment:

**Pre-Deployment**:
- [ ] DNS configured and propagated
- [ ] Firewall rules configured
- [ ] Backup of existing data (if updating)
- [ ] .env file created and validated
- [ ] Secrets generated

**Deployment**:
- [ ] Deploy script executed successfully
- [ ] Containers started
- [ ] Health checks passed
- [ ] SSL certificates generated
- [ ] Services accessible

**Post-Deployment**:
- [ ] Verify functionality
- [ ] Check logs for errors
- [ ] Test critical features
- [ ] Document deployment
- [ ] Schedule first backup

---

## 📞 Support Escalation

If procedures don't resolve issue:

1. **Gather information**:
   ```bash
   docker compose ps > status.txt
   docker compose logs > logs.txt
   docker system df > resources.txt
   ```

2. **Review documentation**:
   - Stack-specific README
   - Troubleshooting guides
   - This procedures document

3. **Search for similar issues**:
   - Check repository issues
   - Review deployment notes

4. **Contact support** with:
   - Detailed description
   - Steps to reproduce
   - System information
   - Relevant logs

---

**Document Status**: Standard Operating Procedures  
**Last Updated**: 2026-01-08  
**Review Schedule**: Quarterly or after major changes
