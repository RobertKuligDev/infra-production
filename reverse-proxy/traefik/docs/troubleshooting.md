# 🔧 Traefik Troubleshooting Guide

Specific troubleshooting guide for Traefik reverse proxy issues.

## 📋 Quick Links

- [General Infrastructure Issues](../../../docs/troubleshooting.md) - Docker, Network, DNS problems
- [Traefik Documentation](https://doc.traefik.io/traefik/)

---

## 🚨 Common Traefik Issues

### SSL Certificate Not Generated

**Symptoms**: 
- Browser shows "Not Secure"
- Certificate warnings
- `acme.json` is empty or has errors

**Diagnostic Steps**:

```bash
# Check Traefik logs for ACME errors
docker logs traefik | grep -i acme
docker logs traefik | grep -i certificate
docker logs traefik | grep -i letsencrypt

# Check acme.json exists and has correct permissions
ls -la letsencrypt/acme.json
# Should be: -rw------- (600)

# Check acme.json content
cat letsencrypt/acme.json | jq .
```

**Common Causes & Solutions**:

1. **Port 80 not accessible** (ACME HTTP-01 challenge needs it)
   ```bash
   # Test port 80 from outside
   curl -I http://yourdomain.com
   
   # Check firewall
   sudo ufw status | grep 80
   
   # Allow port 80
   sudo ufw allow 80/tcp
   ```

2. **DNS not pointing to server**
   ```bash
   # Verify DNS
   dig yourdomain.com +short
   # Must return your server IP
   
   # Check from multiple locations
   # https://www.whatsmydns.net/
   ```

3. **Invalid email in configuration**
   ```bash
   # Check .env
   grep ACME_EMAIL .env
   
   # Email must be valid
   ACME_EMAIL=admin@yourdomain.com
   ```

4. **acme.json permissions wrong**
   ```bash
   # Fix permissions
   chmod 600 letsencrypt/acme.json
   
   # Restart Traefik
   docker compose restart
   ```

5. **Let's Encrypt rate limit hit**
   - Limit: 5 certificates per week per domain
   - Solution: Wait 7 days or use staging environment
   ```bash
   # Check rate limit status
   # https://crt.sh/?q=yourdomain.com
   ```

**Force Certificate Regeneration**:

```bash
# Stop Traefik
docker compose down

# Backup old acme.json
cp letsencrypt/acme.json letsencrypt/acme.json.backup

# Remove acme.json
rm letsencrypt/acme.json

# Create fresh acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json

# Start Traefik
docker compose up -d

# Watch logs for certificate generation
docker logs traefik -f | grep -i acme
```

---

### Service Not Routing / 404 Errors

**Symptoms**:
- Traefik responds with 404
- Service not accessible via domain
- "Service unavailable" errors

**Diagnostic Steps**:

```bash
# Check Traefik dashboard
# http://YOUR_SERVER_IP:8080/dashboard/

# Check if router exists
docker logs traefik | grep "router-name"

# Check service labels
docker inspect service-container | grep -A 20 Labels
```

**Common Causes & Solutions**:

1. **Service not on traefik-net network**
   ```bash
   # Check network membership
   docker network inspect traefik-net
   
   # Verify in docker-compose.yml
   # services:
   #   app:
   #     networks:
   #       - traefik-net
   ```

2. **traefik.enable not set to true**
   ```bash
   # Check service labels
   docker inspect service-container | grep traefik.enable
   
   # Should show: "traefik.enable": "true"
   ```

3. **Wrong domain in Host() rule**
   ```bash
   # Check domain in labels
   docker inspect service-container | grep Host
   
   # Verify DNS points to server
   dig domain-from-label +short
   ```

4. **Wrong port in loadbalancer**
   ```bash
   # Check port configuration
   docker inspect service-container | grep loadbalancer.server.port
   
   # Should match application port (usually 8080)
   ```

**Debug Routing**:

```bash
# Check Traefik configuration
docker compose exec traefik traefik version

# View all routers (from dashboard)
# http://SERVER_IP:8080/dashboard/#/http/routers

# Check if backend is healthy
# http://SERVER_IP:8080/dashboard/#/http/services
```

---

### Dashboard Not Accessible

**Symptoms**:
- Cannot access dashboard on port 8080
- Connection refused
- Timeout errors

**Diagnostic Steps**:

```bash
# Check if Traefik is running
docker ps | grep traefik

# Check if port 8080 is exposed
docker port traefik

# Test locally
curl http://localhost:8080/dashboard/

# Check firewall
sudo ufw status | grep 8080
```

**Solutions**:

1. **Dashboard not enabled**
   ```bash
   # Check command in docker-compose.yml
   # Should have: "--api.dashboard=true"
   
   docker compose config | grep api.dashboard
   ```

2. **Port not exposed**
   ```bash
   # Verify in docker-compose.yml
   # ports:
   #   - "8080:8080"
   ```

3. **Firewall blocking**
   ```bash
   # Allow port 8080 (from your IP only recommended)
   sudo ufw allow from YOUR_IP to any port 8080
   
   # Or allow from anywhere (not recommended)
   sudo ufw allow 8080/tcp
   ```

4. **Authentication failing**
   ```bash
   # Check if basic auth is configured
   grep TRAEFIK_DASHBOARD_AUTH .env
   
   # Generate new credentials
   htpasswd -nb admin your_password
   ```

---

### Certificate Renewal Fails

**Symptoms**:
- Certificate expired
- Renewal errors in logs
- Browser shows certificate warnings after 90 days

**Diagnostic Steps**:

```bash
# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Check Traefik renewal logs
docker logs traefik | grep -i renew

# Check acme.json modification time
ls -la letsencrypt/acme.json
```

**Solutions**:

1. **Traefik not running during renewal window**
   - Ensure Traefik has high uptime
   - Set restart policy to `always` or `unless-stopped`

2. **Port 80 blocked during renewal**
   ```bash
   # Verify port 80 is always accessible
   sudo ufw allow 80/tcp
   ```

3. **Force manual renewal**
   ```bash
   # Restart Traefik (triggers renewal check)
   docker compose restart
   
   # Or force new certificate (see above)
   ```

---

### High Memory Usage

**Symptoms**:
- Traefik consuming excessive memory
- System becoming slow
- OOM errors

**Diagnostic Steps**:

```bash
# Check Traefik resource usage
docker stats traefik

# Check number of routers/services
# View in dashboard

# Check log size
docker logs traefik | wc -l
```

**Solutions**:

1. **Too much logging**
   ```bash
   # Reduce log level in .env
   TRAEFIK_LOG_LEVEL=ERROR
   
   # Restart
   docker compose up -d
   ```

2. **Set memory limits**
   ```yaml
   # In docker-compose.yml
   services:
     traefik:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

3. **Restart Traefik periodically**
   ```bash
   # Setup cron job (optional)
   0 3 * * 0 cd /path/to/traefik && docker compose restart
   ```

---

### Middleware Not Working

**Symptoms**:
- Rate limiting not applied
- CORS headers missing
- Security headers not present

**Diagnostic Steps**:

```bash
# Check if middleware files exist
ls -la config/middlewares.yml
ls -la config/tls.yml

# Check if middlewares are loaded
docker logs traefik | grep middleware

# Test response headers
curl -I https://yourdomain.com
```

**Solutions**:

1. **Dynamic configuration not loaded**
   ```bash
   # Check file provider in docker-compose.yml
   # Should have:
   # - "--providers.file.directory=/etc/traefik/dynamic"
   # - "--providers.file.watch=true"
   
   # Check volume mount
   # volumes:
   #   - "./config:/etc/traefik/dynamic:ro"
   ```

2. **Middleware not applied to service**
   ```bash
   # Check service labels
   docker inspect service | grep middlewares
   
   # Should reference middleware:
   # "traefik.http.routers.service.middlewares=security-headers@file"
   ```

3. **Syntax error in YAML**
   ```bash
   # Validate YAML
   cat config/middlewares.yml | docker run -i --rm mikefarah/yq e - 
   
   # Check Traefik logs for errors
   docker logs traefik | grep -i error | grep -i middleware
   ```

---

### Metrics Not Available (Prometheus)

**Symptoms**:
- Cannot scrape metrics
- Prometheus shows Traefik as down
- No data in Grafana

**Diagnostic Steps**:

```bash
# Check if metrics enabled
grep ENABLE_METRICS .env

# Test metrics endpoint
curl http://localhost:8080/metrics

# Check Prometheus scrape config
```

**Solutions**:

```bash
# Enable metrics in .env
ENABLE_METRICS=true

# Restart Traefik
docker compose up -d

# Verify metrics endpoint
curl http://localhost:8080/metrics | head -20
```

---

## 🛠️ Diagnostic Commands

### Traefik Status

```bash
# Check if running
docker ps | grep traefik

# View logs
docker logs traefik
docker logs traefik -f
docker logs traefik --tail=100

# Check configuration
docker compose config

# Check version
docker compose exec traefik traefik version
```

### Network Diagnostics

```bash
# Check traefik-net network
docker network inspect traefik-net

# Check services on network
docker network inspect traefik-net | jq '.[].Containers'

# Test connectivity from Traefik
docker compose exec traefik ping service-name
```

### Certificate Diagnostics

```bash
# Check acme.json
cat letsencrypt/acme.json | jq .

# Check certificate details
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -text

# Check certificate chain
echo | openssl s_client -connect yourdomain.com:443 -showcerts

# Check expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Router/Service Inspection

```bash
# View Traefik dashboard
# http://SERVER_IP:8080/dashboard/

# Check specific router
docker logs traefik | grep "router-name"

# View all routers in config
docker compose exec traefik cat /etc/traefik/traefik.yml
```

---

## 🔄 Common Solutions

### Complete Traefik Reset

```bash
# Stop Traefik
docker compose down

# Backup current config
cp -r letsencrypt letsencrypt.backup
cp .env .env.backup

# Remove everything
docker volume rm traefik_letsencrypt 2>/dev/null || true
rm -rf letsencrypt/*

# Recreate
mkdir -p letsencrypt
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json

# Start fresh
docker compose up -d

# Watch initialization
docker logs traefik -f
```

### Update Traefik

```bash
# Check current version
docker compose exec traefik traefik version

# Update image version in docker-compose.yml or .env
# TRAEFIK_VERSION=v3.3

# Pull new image
docker compose pull

# Recreate container
docker compose up -d

# Verify new version
docker compose exec traefik traefik version
```

---

## 📊 Performance Optimization

### Enable Compression

Already configured in `config/middlewares.yml`:
```yaml
http:
  middlewares:
    gzip-compression:
      compress:
        minResponseBodyBytes: 1024
```

Apply to service:
```yaml
labels:
  - "traefik.http.routers.service.middlewares=gzip-compression@file"
```

### Enable Caching (with Middleware)

Create cache middleware if needed for static content.

### Monitor Performance

```bash
# Check response times
time curl -I https://yourdomain.com

# Monitor resource usage
docker stats traefik

# Check dashboard for performance metrics
# http://SERVER_IP:8080/dashboard/
```

---

## 🆘 Getting Help

### Information to Provide

When asking for help, include:

1. **Traefik logs**:
   ```bash
   docker logs traefik --tail=200 > traefik-logs.txt
   ```

2. **Configuration** (redacted):
   ```bash
   docker compose config > config-sanitized.yml
   # Remove sensitive data before sharing
   ```

3. **Service labels**:
   ```bash
   docker inspect service-name | jq '.[].Config.Labels' > service-labels.json
   ```

4. **Network info**:
   ```bash
   docker network inspect traefik-net > network-info.json
   ```

### Check Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Traefik Community Forum](https://community.traefik.io/)
- [General Infrastructure Troubleshooting](../../../docs/troubleshooting.md)

---

**Document Status**: Traefik-specific troubleshooting  
**Last Updated**: 2026-01-08  
**Scope**: Traefik reverse proxy issues only
