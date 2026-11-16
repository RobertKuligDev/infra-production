# 📋 Complete Deployment Guide

Comprehensive guide for deploying the production infrastructure with multiple technology stacks.

## 📖 Table of Contents

- [Prerequisites](#-prerequisites)
- [Repository Setup](#-repository-setup)
- [Deployment Overview](#-deployment-overview)
- [Security Best Practices](#-security-best-practices)
- [Maintenance](#-maintenance)
- [Troubleshooting](#-troubleshooting)

---

## ⚙️ Prerequisites

### Server Requirements

**Minimum Specifications**:
- Ubuntu 24.04 LTS (or similar Linux distribution)
- 4GB RAM (8GB+ recommended)
- 50GB available disk space
- Public IPv4 address
- Root or sudo access

**Recommended Specifications**:
- 8GB+ RAM for multiple services
- 100GB+ SSD storage
- Modern CPU (2+ cores)
- Regular backup storage

### Domain Requirements

- One or more domain names
- Access to DNS management
- Ability to create A records

### Software Prerequisites

Install required software on your server:

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Git
sudo apt install -y git

# Install additional utilities
sudo apt install -y curl wget jq htop

# Re-login or run to apply group changes
newgrp docker
```

### Firewall Configuration

Configure firewall before deployment:

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (change port if using non-standard)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optionally allow Traefik dashboard (restrict by IP in production)
# sudo ufw allow from YOUR_IP_ADDRESS to any port 8080

# Check status
sudo ufw status
```

---

## 📦 Repository Setup

### Clone Repository

```bash
# Create apps directory
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone git@github.com:YourUsername/infra-production.git
cd infra-production

# Verify structure
ls -la
```

### Understanding Repository Structure

```
infra-production/
├── README.md                   # Project overview
├── QUICKSTART.md              # 5-minute setup guide
├── COMPLETE_DEPLOYMENT_GUIDE.md   # This file
├── DEPLOYMENT.md              # Implementation notes
├── GIT_COMMITS.md            # Commit conventions
├── .gitignore                # Git ignore rules
│
├── reverse-proxy/            # Reverse proxy (to be added)
│   └── traefik/
│
└── stacks/                   # Application stacks (to be added)
    ├── dotnet-app/
    ├── php-app/
    └── monitoring/
```

---

## 🚀 Deployment Overview

This infrastructure follows an incremental deployment approach:

### Deployment Order

1. **Traefik Reverse Proxy** (Required First)
   - Central entry point for all services
   - Handles SSL/TLS certificates
   - Routes traffic to applications

2. **Application Stacks** (Add as needed)
   - .NET applications
   - PHP applications
   - Static sites
   - Other services

3. **Supporting Services** (Optional)
   - Monitoring (Grafana + Prometheus)
   - Automation (n8N)
   - Additional web servers

### Deployment Pattern

Each stack follows the same pattern:

```bash
cd stacks/<stack-name>

# 1. Create configuration from template
cp .env.example .env

# 2. Edit configuration
nano .env

# 3. Deploy
chmod +x deploy.sh
./deploy.sh

# 4. Verify
docker compose ps
docker compose logs -f
```

---

## 🌐 DNS Configuration

Before deploying services, configure DNS records:

### Required DNS Records

Point your domains to your server's public IP address:

```
# Main domain
yourdomain.com              A    YOUR_SERVER_IP

# Wildcard (recommended)
*.yourdomain.com            A    YOUR_SERVER_IP

# Or specific subdomains
api.yourdomain.com          A    YOUR_SERVER_IP
app.yourdomain.com          A    YOUR_SERVER_IP
monitoring.yourdomain.com   A    YOUR_SERVER_IP
traefik.yourdomain.com      A    YOUR_SERVER_IP
```

### Verify DNS Configuration

```bash
# Check DNS propagation
dig yourdomain.com +short

# Should return your server IP
# Note: DNS propagation can take up to 48 hours
```

### DNS Providers

Common providers with API support:
- Cloudflare (recommended)
- Route 53 (AWS)
- DigitalOcean DNS
- Google Cloud DNS
- Namecheap

---

## 🔒 Security Best Practices

### Secrets Management

**Golden Rules**:
1. Never commit `.env` files to Git
2. Use strong, unique passwords (20+ characters)
3. Generate secrets using cryptographic tools
4. Rotate secrets regularly (every 90 days)
5. Store backups securely

**Generate Strong Secrets**:

```bash
# Strong password (32 characters)
openssl rand -base64 32

# JWT secret (64+ characters)
openssl rand -base64 64

# API key (hex format)
openssl rand -hex 32

# Custom length
openssl rand -base64 48
```

### Network Security

**Principles**:
- Database on internal network only
- No direct database port exposure
- All external access via HTTPS
- Rate limiting enabled
- Regular security updates

**Configuration**:
```bash
# Only expose necessary ports
# 80 - HTTP (for Let's Encrypt)
# 443 - HTTPS
# 22 - SSH (consider changing port)
```

### SSL/TLS

**Features**:
- Automatic SSL certificate generation (Let's Encrypt)
- HTTP to HTTPS redirect
- Modern TLS configuration
- Certificate auto-renewal

**Verification**:
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Access Control

**Recommendations**:
1. Use SSH keys (disable password auth)
2. Implement fail2ban for brute force protection
3. Regular security updates
4. Audit user access
5. Monitor authentication logs

**SSH Hardening**:
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 2222  # Change from default 22

# Restart SSH
sudo systemctl restart sshd
```

---

## 🔧 Maintenance

### Regular Tasks

**Daily**:
- Monitor service health
- Check disk space: `df -h`
- Review logs for errors
- Verify backups completed

**Weekly**:
- Update Docker images
- Review security logs
- Test backup restore
- Check SSL certificate status

**Monthly**:
- Rotate secrets
- Security audit
- Performance review
- Update documentation

### Update Procedures

**Update Docker Images**:
```bash
cd stacks/<stack-name>
docker compose pull
docker compose up -d
```

**Update System Packages**:
```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

### Backup Strategy

**What to Backup**:
- Database dumps
- Application data volumes
- Configuration files (`.env.example`, not `.env`)
- SSL certificates (from Traefik)

**Backup Locations**:
- Local: `/backups` (short-term)
- Remote: Off-site storage (long-term)
- Cloud: S3, Backblaze, etc.

**Backup Schedule**:
- Databases: Daily
- Application data: Daily
- Full system: Weekly
- Offsite copy: Weekly

---

## 🐛 Troubleshooting

### Common Issues

#### 1. DNS Not Resolving

**Symptoms**: Cannot access domain, SSL fails

**Solutions**:
```bash
# Check DNS
dig yourdomain.com +short

# Flush local DNS cache
sudo systemd-resolve --flush-caches

# Wait for propagation (up to 48 hours)
```

#### 2. Docker Command Fails

**Symptoms**: Permission denied errors

**Solutions**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Re-login
exit
# SSH back in

# Verify
docker ps
```

#### 3. Port Already in Use

**Symptoms**: Container won't start, port conflict

**Solutions**:
```bash
# Find what's using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process if safe
sudo kill -9 <PID>
```

#### 4. Out of Disk Space

**Symptoms**: Services crash, deployment fails

**Solutions**:
```bash
# Check space
df -h

# Clean Docker
docker system prune -a --volumes

# Clean apt cache
sudo apt clean
sudo apt autoremove
```

### Diagnostic Commands

```bash
# System status
docker ps -a
docker system df
df -h
free -h

# Service logs
docker compose logs --tail=100
docker logs <container-name>

# Network status
docker network ls
docker network inspect traefik-net

# Resource usage
docker stats --no-stream
htop
```

### Getting Help

1. Check stack-specific documentation
2. Review logs for error messages
3. Consult troubleshooting guides
4. Search existing issues
5. Contact support with diagnostics

---

## 📊 Monitoring

### Health Checks

Each stack provides health check scripts:

```bash
cd stacks/<stack-name>
./scripts/health-check.sh
```

### Resource Monitoring

```bash
# Container stats
docker stats

# System resources
htop

# Disk usage
df -h
du -sh /var/lib/docker
```

### Log Management

```bash
# View logs
docker compose logs -f

# Save logs
docker compose logs > debug.log

# Rotate logs
# Configure in Docker daemon.json
```

---

## 🚨 Emergency Procedures

### Service Recovery

```bash
# Restart service
docker compose restart

# Full redeploy
./deploy.sh

# Check logs
docker compose logs --tail=200
```

### Database Recovery

```bash
# Stop application
docker compose stop app

# Restore from backup
./scripts/restore.sh /path/to/backup.tar.gz

# Start application
docker compose up -d
```

### Complete System Recovery

```bash
# 1. Stop all services
docker compose down

# 2. Restore from backups

# 3. Redeploy
./deploy.sh
```

---

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] DNS configured and propagated
- [ ] Firewall rules configured
- [ ] All `.env` files created from templates
- [ ] Strong passwords generated
- [ ] Services deployed and running
- [ ] SSL certificates generated
- [ ] Health checks passing
- [ ] Backups configured
- [ ] Monitoring in place
- [ ] Documentation reviewed

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

---

## 📞 Support

For questions or issues:

1. Review this guide thoroughly
2. Check stack-specific README files
3. Consult troubleshooting documentation
4. Search for similar issues
5. Contact support with full diagnostics

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-08  
**Status**: Ready for initial deployment

---

**Next Steps**:
1. Deploy Traefik reverse proxy
2. Configure first application stack
3. Set up monitoring
4. Implement backup procedures
5. Review security measures
