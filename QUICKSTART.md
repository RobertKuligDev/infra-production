# 🚀 Quick Start Guide

Get your infrastructure running in 5 minutes with this streamlined deployment guide.

## ⚡ Prerequisites (2 minutes)

```bash
# Ubuntu 24.04+ server with at least 4GB RAM
# Domain name pointing to your server IP

# Install Docker and dependencies
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## 🎯 Quick Deploy (3 minutes)

### Step 1: Clone Repository

```bash
cd ~/apps
git clone git@github.com:YourUsername/infra-production.git
cd infra-production
```

### Step 2: Create Traefik Network

```bash
docker network create traefik-net
```

### Step 3: Deploy Traefik Reverse Proxy

```bash
cd reverse-proxy/traefik

# Create configuration from template
cp .env.example .env

# Edit configuration (minimum: set ACME_EMAIL)
nano .env
```

**Required in `.env`**:
```bash
ACME_EMAIL=admin@yourdomain.com
```

**Deploy**:
```bash
chmod +x deploy.sh
./deploy.sh
```

✅ **Traefik Dashboard**: `http://YOUR_SERVER_IP:8080/dashboard/`

### Step 4: Deploy Your First Application

Example: .NET Application

```bash
cd ~/apps/infra-production/stacks/dotnet-app

# Create configuration
cp .env.example .env
nano .env
```

**Required in `.env`**:
```bash
DOTNET_IMAGE=your-registry/your-app:latest
DOMAIN=api.yourdomain.com
POSTGRES_PASSWORD=generate_strong_password_here
JWT_SECRET=generate_64_char_secret_here
```

**Generate secrets**:
```bash
# Strong password
openssl rand -base64 32

# JWT secret
openssl rand -base64 64
```

**Deploy**:
```bash
chmod +x deploy.sh
./deploy.sh
```

✅ **Application**: `https://api.yourdomain.com`

## ✅ Verification

### Check Services

```bash
# All containers
docker ps

# Traefik status
docker logs traefik

# Application status
cd ~/apps/infra-production/stacks/dotnet-app
docker compose ps
```

### Test Endpoints

```bash
# Health check
curl https://api.yourdomain.com/health

# Or use browser
firefox https://api.yourdomain.com
```

### Traefik Dashboard

Open: `http://YOUR_SERVER_IP:8080/dashboard/`

Look for:
- ✅ Green routers (your services)
- ✅ Valid SSL certificates
- ✅ Healthy backends

## 🌐 DNS Setup

**Before deployment**, point your domains to server IP:

```
yourdomain.com           → A → YOUR_SERVER_IP
*.yourdomain.com         → A → YOUR_SERVER_IP
api.yourdomain.com       → A → YOUR_SERVER_IP
```

**Verify DNS**:
```bash
dig yourdomain.com +short
# Should return YOUR_SERVER_IP
```

**Note**: DNS propagation can take up to 48 hours.

## 🔒 Security Quick Wins

### 1. Secure Traefik Dashboard

```bash
cd ~/apps/infra-production/reverse-proxy/traefik
nano .env
```

Add:
```bash
# Generate: htpasswd -nb admin your_password
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$xyz123...
```

### 2. Enable Firewall

```bash
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw status
```

### 3. Rotate Secrets Regularly

```bash
# Generate new secrets every 90 days
openssl rand -base64 64
```

## 🐛 Quick Troubleshooting

### SSL Certificate Not Working?

```bash
# Check DNS
dig yourdomain.com +short

# Check Traefik logs
docker logs traefik | grep -i acme

# Port 80 accessible?
curl -I http://yourdomain.com

# Wait 2-5 minutes for Let's Encrypt
```

### Service Not Starting?

```bash
# Check logs
docker compose logs -f

# Verify .env exists
ls -la .env

# Check required variables
grep -E "DOMAIN|PASSWORD|SECRET" .env
```

### Container Keeps Restarting?

```bash
# View errors
docker compose logs --tail=50

# Check resources
docker stats

# Increase limits in .env
MEMORY_LIMIT=2G
```

## 📋 Configuration Cheat Sheet

### Traefik (.env)
```bash
ACME_EMAIL=admin@yourdomain.com                    # Required
TRAEFIK_DASHBOARD_DOMAIN=traefik.yourdomain.com   # Optional
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$...            # Recommended
ENABLE_METRICS=true                                # For monitoring
```

### .NET App (.env)
```bash
DOTNET_IMAGE=your-registry/app:latest             # Required
DOMAIN=api.yourdomain.com                          # Required
POSTGRES_PASSWORD=$(openssl rand -base64 32)       # Required
JWT_SECRET=$(openssl rand -base64 64)              # Required
```

### Common Patterns
```bash
# Strong password (20+ chars)
PASSWORD=$(openssl rand -base64 32)

# JWT secret (64+ chars)
JWT_SECRET=$(openssl rand -base64 64)

# API key
API_KEY=$(openssl rand -hex 32)

# Database connection string
DB_CONNECTION_STRING="Host=postgres;Database=db;Username=user;Password=${PASSWORD}"
```

## 🔄 Common Operations

### Restart Service

```bash
cd stacks/<stack-name>
docker compose restart
```

### Update Service

```bash
cd stacks/<stack-name>
docker compose pull
docker compose up -d
```

### View Logs

```bash
docker compose logs -f
docker compose logs --tail=100
```

### Backup

```bash
cd stacks/<stack-name>
./scripts/backup.sh
```

### Health Check

```bash
cd stacks/<stack-name>
./scripts/health-check.sh
```

## 📚 Next Steps

### For Production

1. **Set up backups**
   ```bash
   # Configure backup path in .env
   BACKUP_PATH=/backups
   
   # Run backup
   ./scripts/backup.sh
   ```

2. **Configure monitoring** (coming soon)
   ```bash
   cd stacks/monitoring
   ./deploy.sh
   ```

3. **Secure dashboard**
   - Remove port 8080 exposure
   - Use SSH tunnel
   - Enable authentication

4. **Regular maintenance**
   - Update images weekly
   - Rotate secrets monthly
   - Test backups monthly

### For Development

1. **Clone for local development**
   ```bash
   git clone <repo>
   # Modify .env for local
   docker compose up -d
   ```

2. **Review commit conventions**
   ```bash
   cat GIT_COMMITS.md
   ```

3. **Add your services**
   - Copy stack template
   - Configure .env.example
   - Test deployment

## 📖 Full Documentation

- **[README.md](./README.md)** - Complete overview
- **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Detailed guide
- **[Traefik README](./reverse-proxy/traefik/README.md)** - Traefik configuration
- **[.NET README](./stacks/dotnet-app/README.md)** - .NET deployment
- **[Troubleshooting](./stacks/dotnet-app/docs/troubleshooting.md)** - Common issues

## 🎓 Learning Resources

- [Docker Tutorial](https://docs.docker.com/get-started/)
- [Docker Compose Tutorial](https://docs.docker.com/compose/gettingstarted/)
- [Traefik Quick Start](https://doc.traefik.io/traefik/getting-started/quick-start/)

## 🆘 Need Help?

1. **Check health**: `./scripts/health-check.sh`
2. **View logs**: `docker compose logs -f`
3. **Read troubleshooting guide**: See stack-specific docs
4. **Contact**: your-email@yourdomain.com

---

**Success! 🎉** Your infrastructure is now running!

Next: Review [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md) for advanced configuration.
