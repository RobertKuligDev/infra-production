# 🔧 Troubleshooting Guide

General troubleshooting guide for the infra-production infrastructure.

## 📋 Table of Contents

- [General Issues](#-general-issues)
- [Docker Issues](#-docker-issues)
- [Network Issues](#-network-issues)
- [DNS Issues](#-dns-issues)
- [SSL/TLS Issues](#-ssltls-issues)
- [Performance Issues](#-performance-issues)
- [Diagnostic Commands](#-diagnostic-commands)

---

## 🔍 Before You Start

### Quick Diagnostic Checklist

Run these commands first to get an overview:

```bash
# System resources
df -h                    # Disk space
free -h                  # Memory
top                      # CPU usage

# Docker status
docker ps -a            # All containers
docker system df        # Docker disk usage
docker network ls       # Networks

# Logs
docker logs <container> --tail=50
```

---

## ⚙️ General Issues

### Command Not Found

**Symptoms**: `command not found: docker` or similar

**Cause**: Software not installed or not in PATH

**Solutions**:

```bash
# Check if Docker is installed
which docker

# If not installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Permission Denied

**Symptoms**: `permission denied` errors when running Docker commands

**Cause**: User not in docker group

**Solutions**:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply changes (choose one)
newgrp docker    # Temporary for current session
# OR
exit             # Logout and login again

# Verify
docker ps        # Should work without sudo
```

### Configuration File Not Found

**Symptoms**: `.env file not found` or similar errors

**Cause**: Missing configuration file

**Solutions**:

```bash
# Check if .env.example exists
ls -la .env.example

# Create .env from template
cp .env.example .env

# Edit with your values
nano .env

# Verify required variables are set
grep -E "DOMAIN|PASSWORD|SECRET" .env
```

---

## 🐳 Docker Issues

### Container Won't Start

**Symptoms**: Container exits immediately or shows `Exit (1)`

**Diagnostic Steps**:

```bash
# Check container status
docker ps -a

# View logs
docker logs <container-name>

# Check last 100 lines
docker logs <container-name> --tail=100

# Follow logs in real-time
docker logs <container-name> -f
```

**Common Causes & Solutions**:

1. **Port already in use**
   ```bash
   # Find what's using the port
   sudo lsof -i :80
   sudo lsof -i :443
   
   # Kill the process (if safe)
   sudo kill -9 <PID>
   ```

2. **Missing environment variables**
   ```bash
   # Check .env exists
   ls -la .env
   
   # Verify variables are set
   docker compose config
   ```

3. **Image not found**
   ```bash
   # Pull image manually
   docker pull <image-name>
   
   # Check if image exists
   docker images
   ```

4. **Volume mount issues**
   ```bash
   # Check volume permissions
   ls -la /path/to/volume
   
   # Fix permissions if needed
   sudo chown -R $USER:$USER /path/to/volume
   ```

### Container Keeps Restarting

**Symptoms**: Container continuously restarts (restart count increases)

**Diagnostic Steps**:

```bash
# Check restart count
docker ps -a

# View recent logs
docker logs <container-name> --tail=200

# Check exit code
docker inspect <container-name> | grep -i "exitcode"
```

**Common Causes & Solutions**:

1. **Application crash**
   - Review logs for error messages
   - Check application configuration
   - Verify dependencies are available

2. **Health check failing**
   ```bash
   # Check health status
   docker inspect <container-name> | grep -i health
   
   # Increase health check timeout in docker-compose.yml
   # healthcheck:
   #   start_period: 120s
   ```

3. **Resource limits**
   ```bash
   # Check resource usage
   docker stats <container-name>
   
   # Increase limits in docker-compose.yml
   # deploy:
   #   resources:
   #     limits:
   #       memory: 2G
   ```

### Out of Disk Space

**Symptoms**: `no space left on device` errors

**Diagnostic Steps**:

```bash
# Check disk space
df -h

# Check Docker disk usage
docker system df

# Check which volumes are large
du -sh /var/lib/docker/volumes/*
```

**Solutions**:

```bash
# Remove unused containers, images, volumes
docker system prune -a

# Remove unused volumes (⚠️ DATA LOSS)
docker volume prune

# Remove specific image
docker rmi <image-name>

# Clean apt cache
sudo apt clean
sudo apt autoremove
```

---

## 🌐 Network Issues

### Cannot Connect Between Containers

**Symptoms**: Application cannot reach database or other services

**Diagnostic Steps**:

```bash
# Check if containers are on same network
docker network inspect <network-name>

# Test connectivity
docker exec <container1> ping <container2>

# Check if service name resolves
docker exec <container1> nslookup <service-name>
```

**Common Causes & Solutions**:

1. **Using localhost instead of service name**
   ```bash
   # ❌ Wrong:
   DB_HOST=localhost
   
   # ✅ Correct:
   DB_HOST=postgres  # Use Docker service name
   ```

2. **Not on same network**
   ```bash
   # Check docker-compose.yml includes network
   # services:
   #   app:
   #     networks:
   #       - internal
   ```

3. **Firewall blocking**
   ```bash
   # Check UFW status
   sudo ufw status
   
   # Allow internal Docker network (if needed)
   sudo ufw allow from 172.16.0.0/12
   ```

### External Network Not Found

**Symptoms**: `network not found: traefik-net`

**Cause**: External network not created

**Solution**:

```bash
# Create network
docker network create traefik-net

# Verify
docker network ls | grep traefik-net

# Deploy again
./deploy.sh
```

---

## 🌍 DNS Issues

### Domain Not Resolving

**Symptoms**: Cannot access service by domain name

**Diagnostic Steps**:

```bash
# Check DNS resolution
dig yourdomain.com +short

# Check from different DNS
dig @8.8.8.8 yourdomain.com +short

# Check DNS propagation
# Visit: https://www.whatsmydns.net/
```

**Solutions**:

1. **DNS not configured**
   - Add A record: `yourdomain.com → YOUR_SERVER_IP`
   - Wait for propagation (5 min to 48 hours)

2. **DNS propagation incomplete**
   - Wait longer
   - Check multiple DNS checkers
   - Try from different networks

3. **Cached DNS**
   ```bash
   # Flush local DNS cache (Linux)
   sudo systemd-resolve --flush-caches
   
   # Flush browser DNS (Chrome)
   # Navigate to: chrome://net-internals/#dns
   # Click "Clear host cache"
   ```

---

## 🔒 SSL/TLS Issues

### SSL Certificate Not Generated

**Symptoms**: Browser shows "Not Secure" or certificate errors

**Diagnostic Steps**:

```bash
# Check if certificate exists
# (Will be stack-specific, e.g., Traefik's acme.json)

# Test SSL from command line
openssl s_client -connect yourdomain.com:443

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

**Common Causes & Solutions**:

1. **Port 80 not accessible**
   ```bash
   # Test HTTP access (needed for ACME challenge)
   curl -I http://yourdomain.com
   
   # Check firewall
   sudo ufw status | grep 80
   
   # Allow if needed
   sudo ufw allow 80/tcp
   ```

2. **DNS not pointing to server**
   ```bash
   # Verify DNS
   dig yourdomain.com +short
   # Must return: YOUR_SERVER_IP
   ```

3. **Rate limit hit (Let's Encrypt)**
   - Let's Encrypt has rate limits (5 certificates per week per domain)
   - Wait and try again
   - Use staging environment for testing

4. **Invalid email configuration**
   - Check ACME_EMAIL is valid
   - Verify in configuration file

### Certificate Expired

**Symptoms**: Browser shows "Certificate expired"

**Cause**: Certificate not renewed

**Solution**:

```bash
# Certificates should auto-renew
# If manual renewal needed (stack-specific)

# For Traefik example:
cd reverse-proxy/traefik
docker compose restart

# Force renewal (if needed)
docker compose down
rm -f letsencrypt/acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
docker compose up -d
```

---

## ⚡ Performance Issues

### Slow Response Times

**Diagnostic Steps**:

```bash
# Test response time
time curl https://yourdomain.com

# Check resource usage
docker stats

# Check system load
top
htop

# Check disk I/O
iostat 1
```

**Common Causes & Solutions**:

1. **High CPU usage**
   ```bash
   # Find process using CPU
   top
   
   # Restart service if needed
   docker compose restart
   ```

2. **Memory issues**
   ```bash
   # Check memory
   free -h
   
   # Increase swap if needed
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **Disk I/O bottleneck**
   ```bash
   # Check disk usage
   iostat -x 1
   
   # Consider:
   # - Using SSD instead of HDD
   # - Optimizing database queries
   # - Adding caching layer
   ```

### High Memory Usage

**Diagnostic Steps**:

```bash
# Check container memory usage
docker stats

# Check for memory leaks
docker stats --no-stream

# Check system memory
free -h
```

**Solutions**:

1. **Set memory limits**
   ```yaml
   # In docker-compose.yml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

2. **Restart containers**
   ```bash
   docker compose restart
   ```

3. **Check application for leaks**
   - Review application logs
   - Profile application
   - Update to latest version

---

## 🛠️ Diagnostic Commands

### System Information

```bash
# OS version
cat /etc/os-release

# Kernel version
uname -a

# System uptime
uptime

# System resources
free -h
df -h
```

### Docker Information

```bash
# Docker version
docker --version
docker compose version

# System-wide info
docker info

# Disk usage
docker system df

# Show all containers (including stopped)
docker ps -a

# Show all images
docker images

# Show all volumes
docker volume ls

# Show all networks
docker network ls
```

### Container Diagnostics

```bash
# Container logs
docker logs <container-name>
docker logs <container-name> --tail=100
docker logs <container-name> -f
docker logs <container-name> --since 1h

# Container details
docker inspect <container-name>

# Container stats
docker stats <container-name>

# Execute command in container
docker exec <container-name> <command>
docker exec -it <container-name> bash
docker exec -it <container-name> sh

# Copy files from container
docker cp <container-name>:/path/to/file ./local/path
```

### Network Diagnostics

```bash
# List networks
docker network ls

# Inspect network
docker network inspect <network-name>

# Test connectivity
docker exec <container> ping <target>
docker exec <container> curl <url>

# Check DNS resolution
docker exec <container> nslookup <hostname>
```

### Log Collection for Support

```bash
# Collect all relevant logs
mkdir troubleshooting-$(date +%Y%m%d-%H%M%S)
cd troubleshooting-*

# System info
uname -a > system-info.txt
docker info > docker-info.txt
df -h > disk-usage.txt
free -h > memory-info.txt

# Docker status
docker ps -a > containers.txt
docker images > images.txt
docker network ls > networks.txt
docker volume ls > volumes.txt

# Container logs
docker compose logs > compose-logs.txt

# Compress
cd ..
tar -czf troubleshooting-$(date +%Y%m%d-%H%M%S).tar.gz troubleshooting-*/
```

---

## 🆘 Getting Help

### Information to Gather

Before seeking help, collect:

1. **System information**
   - OS version: `cat /etc/os-release`
   - Docker version: `docker --version`
   - Docker Compose version: `docker compose version`

2. **Problem description**
   - What were you trying to do?
   - What happened instead?
   - Error messages (exact text)

3. **Logs**
   - Container logs: `docker logs <name>`
   - System logs: `journalctl -xe`

4. **Configuration** (redacted)
   - Remove passwords before sharing
   - Include relevant .env variables
   - Include docker-compose.yml excerpt

### Where to Get Help

1. **Documentation**
   - Stack-specific README files
   - This troubleshooting guide
   - Official Docker documentation

2. **Search Existing Issues**
   - Repository issues
   - Stack Overflow
   - Docker forums

3. **Contact Support**
   - Provide all gathered information
   - Include steps to reproduce
   - Specify what you've already tried

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Troubleshooting](https://docs.docker.com/config/daemon/)
- [Linux Performance](https://www.brendangregg.com/linuxperf.html)

---

**Document Status**: General troubleshooting guide  
**Last Updated**: 2026-01-08  
**Scope**: Infrastructure-wide issues  
**Note**: Stack-specific issues documented in respective READMEs
