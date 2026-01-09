# 🌐 Traefik Reverse Proxy

Modern, cloud-native reverse proxy and load balancer handling all HTTPS traffic, SSL certificates, and routing for your infrastructure.

## ✨ Features

- 🔐 **Automatic SSL**: Let's Encrypt certificate generation and renewal
- 🔄 **HTTP → HTTPS**: Automatic redirection for all traffic
- 🐳 **Docker Integration**: Automatic service discovery via Docker labels
- 📊 **Monitoring**: Built-in dashboard and Prometheus metrics
- 🛡️ **Security**: Rate limiting, circuit breakers, IP whitelisting
- ⚡ **High Performance**: Fast reverse proxy with minimal overhead
- 🔌 **Middleware**: Compression, headers, authentication, and more

## 📋 Prerequisites

- Docker & Docker Compose installed
- Domain(s) pointed to your server IP
- Ports 80 and 443 accessible from internet

## 🚀 Quick Start

### 1. Create configuration

```bash
cd reverse-proxy/traefik

# Copy example to create your .env
cp .env.example .env

# Edit with your values
nano .env
```

**Minimum required in `.env`:**
```bash
ACME_EMAIL=admin@yourdomain.com
```

### 2. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

Traefik is now running and ready to route traffic!

## 🔧 Configuration

### Required Variables

Edit `.env` file:

```bash
# Let's Encrypt (required)
ACME_EMAIL=admin@yourdomain.com

# Dashboard domain (optional but recommended)
TRAEFIK_DASHBOARD_DOMAIN=traefik.yourdomain.com

# Dashboard authentication (HIGHLY recommended for production)
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$xyz123...
```

### Generate Dashboard Credentials

```bash
# Method 1: Using htpasswd
sudo apt-get install apache2-utils
htpasswd -nb admin your_password

# Method 2: Using Docker
docker run --rm httpd:alpine htpasswd -nb admin your_password

# Copy output to TRAEFIK_DASHBOARD_AUTH in .env
```

### Enable Metrics (Prometheus)

```bash
# In .env:
ENABLE_METRICS=true
```

Metrics will be available at:
- `http://localhost:8080/metrics` (local)
- `https://traefik.yourdomain.com/metrics` (if domain configured)

## 📊 Dashboard Access

### Via Domain (Recommended for Production)

```bash
# Set in .env:
TRAEFIK_DASHBOARD_DOMAIN=traefik.yourdomain.com

# Access at:
https://traefik.yourdomain.com/dashboard/
```

### Via Local Port (Development/Debugging)

```
http://YOUR_SERVER_IP:8080/dashboard/
```

**⚠️ Security Warning**: Port 8080 is exposed by default. For production:
1. Enable dashboard authentication (`TRAEFIK_DASHBOARD_AUTH`)
2. Use firewall to restrict access
3. Or remove port 8080 exposure in `docker-compose.yml`

## 🔌 Connecting Services

### Network Setup

All services must connect to `traefik-net`:

```yaml
networks:
  traefik-net:
    external: true
```

### Service Labels

Add these labels to your service in `docker-compose.yml`:

```yaml
services:
  your-app:
    image: your-app:latest
    networks:
      - traefik-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.your-app.rule=Host(`app.yourdomain.com`)"
      - "traefik.http.routers.your-app.entrypoints=websecure"
      - "traefik.http.routers.your-app.tls=true"
      - "traefik.http.routers.your-app.tls.certresolver=le"
      - "traefik.http.services.your-app.loadbalancer.server.port=8080"
```

### Advanced Routing Examples

**Path-based routing:**
```yaml
- "traefik.http.routers.api.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"
```

**Multiple domains:**
```yaml
- "traefik.http.routers.app.rule=Host(`app.yourdomain.com`) || Host(`www.app.yourdomain.com`)"
```

**Subdomain wildcard:**
```yaml
- "traefik.http.routers.app.rule=HostRegexp(`{subdomain:[a-z]+}.yourdomain.com`)"
```

## 🛡️ Security Features

### Rate Limiting

Add to your service labels:

```yaml
labels:
  - "traefik.http.middlewares.rate-limit.ratelimit.average=100"
  - "traefik.http.middlewares.rate-limit.ratelimit.burst=50"
  - "traefik.http.routers.your-app.middlewares=rate-limit"
```

### IP Whitelisting

```yaml
labels:
  - "traefik.http.middlewares.ip-whitelist.ipwhitelist.sourcerange=192.168.1.0/24,1.2.3.4"
  - "traefik.http.routers.your-app.middlewares=ip-whitelist"
```

### Basic Authentication

```yaml
labels:
  - "traefik.http.middlewares.auth.basicauth.users=user:$$apr1$$xyz..."
  - "traefik.http.routers.your-app.middlewares=auth"
```

### Security Headers

Security headers are pre-configured in `config/middlewares.yml`:
- HSTS (HTTP Strict Transport Security)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

Enable for your service:
```yaml
- "traefik.http.routers.your-app.middlewares=security-headers@file"
```

## 📈 Monitoring & Metrics

### Prometheus Integration

When `ENABLE_METRICS=true` in `.env`:

```yaml
# In Prometheus configuration:
scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']
```

### Available Metrics

- Request count and duration
- Response status codes
- Service health
- Certificate expiration
- Backend status

### Dashboard

Access at `https://traefik.yourdomain.com/dashboard/` to see:
- Active routers and services
- TLS certificates
- Middleware chain
- Request/error rates
- Backend health

## 🔍 Verification

### Check Status

```bash
docker ps | grep traefik
docker logs traefik -f
```

### Test Routing

```bash
# Check if domain resolves
dig yourdomain.com +short

# Test HTTPS
curl -I https://yourdomain.com

# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Health Check

```bash
curl http://localhost:8080/ping
```

## 🐛 Troubleshooting

### Certificate Not Generated

**Symptoms**: "TLS handshake error" or "certificate not found"

**Solutions**:
1. Verify DNS points to your server:
   ```bash
   dig yourdomain.com +short
   ```
2. Ensure port 80 is accessible (Let's Encrypt uses HTTP-01 challenge)
3. Check Traefik logs:
   ```bash
   docker logs traefik | grep -i acme
   ```
4. Verify email in `.env` is correct

### Service Not Routing

**Symptoms**: 404 or "Service unavailable"

**Solutions**:
1. Verify service has `traefik.enable=true` label
2. Check service is on `traefik-net` network
3. Verify router rule matches your domain
4. Check dashboard for router status
5. Inspect service labels:
   ```bash
   docker inspect your-service | grep traefik
   ```

### Dashboard Not Accessible

**Solutions**:
1. Check Traefik is running:
   ```bash
   docker ps | grep traefik
   ```
2. Verify port 8080 is exposed (for local access)
3. Check firewall rules
4. Review Traefik logs:
   ```bash
   docker logs traefik -f
   ```

### SSL Certificate Issues

**"Invalid certificate" warnings**:
1. Check certificate in dashboard
2. Verify domain matches certificate
3. Force certificate regeneration:
   ```bash
   docker compose down
   rm letsencrypt/acme.json
   chmod 600 letsencrypt/acme.json
   docker compose up -d
   ```

### Performance Issues

1. Check resource usage:
   ```bash
   docker stats traefik
   ```
2. Review access logs:
   ```bash
   tail -f logs/access.log
   ```
3. Consider enabling compression middleware
4. Optimize rate limiting settings

## 🔧 Maintenance

### Update Traefik

```bash
# Update version in .env
TRAEFIK_VERSION=v3.3

# Deploy new version
./deploy.sh
```

### Backup Certificates

```bash
# Backup acme.json (contains all SSL certificates)
cp letsencrypt/acme.json letsencrypt/acme.json.backup-$(date +%Y%m%d)
```

### View Logs

```bash
# Live logs
docker logs traefik -f

# Access logs
tail -f logs/access.log

# Specific time range
docker logs traefik --since 1h

# Error logs only
docker logs traefik 2>&1 | grep -i error
```

### Clean Up

```bash
# Remove old logs
find logs/ -name "*.log" -mtime +30 -delete

# Prune old images
docker image prune -a -f
```

## 🏗️ Architecture

```
Internet (Port 80/443)
         ↓
    ┌────────────┐
    │  Traefik   │  Reverse Proxy & Load Balancer
    │  (Port 443)│  - SSL Termination (Let's Encrypt)
    └────┬───────┘  - Service Discovery (Docker)
         │          - Routing & Middlewares
         │ traefik-net
         ├─────────────────────────────────┐
         ↓                                 ↓
    ┌─────────┐                      ┌─────────┐
    │ Service │                      │ Service │
    │   API   │                      │   Web   │
    └─────────┘                      └─────────┘
```

## 📚 Advanced Features

### Dynamic Configuration

Place configuration files in `config/` directory:

**`config/middlewares.yml`** - Custom middlewares
**`config/tls.yml`** - TLS options and ciphers
**`config/routers.yml`** - Static routes (non-Docker)

### Circuit Breaker

Automatically disable failing backends:

```yaml
- "traefik.http.middlewares.circuit.circuitbreaker.expression=NetworkErrorRatio() > 0.5"
```

### Compression

Enable response compression:

```yaml
- "traefik.http.middlewares.compress.compress=true"
- "traefik.http.routers.your-app.middlewares=compress"
```

### Sticky Sessions

For stateful applications:

```yaml
- "traefik.http.services.your-app.loadbalancer.sticky.cookie=true"
- "traefik.http.services.your-app.loadbalancer.sticky.cookie.name=lb"
```

## 🔒 Security Best Practices

- ✅ Enable dashboard authentication (`TRAEFIK_DASHBOARD_AUTH`)
- ✅ Set `API_INSECURE=false` in production
- ✅ Use firewall to restrict dashboard access
- ✅ Enable rate limiting for public services
- ✅ Configure security headers
- ✅ Regular certificate backups
- ✅ Monitor access logs
- ✅ Keep Traefik updated

## 📖 Additional Resources

- [Official Documentation](https://doc.traefik.io/traefik/)
- [Middlewares Reference](https://doc.traefik.io/traefik/middlewares/overview/)
- [Routing Configuration](https://doc.traefik.io/traefik/routing/overview/)
- [Metrics & Monitoring](https://doc.traefik.io/traefik/observability/metrics/overview/)
- [Let's Encrypt Guide](https://doc.traefik.io/traefik/https/acme/)

## 🆘 Support

For issues:
1. Check logs: `docker logs traefik -f`
2. Review dashboard for routing issues
3. Verify DNS and firewall configuration
4. Consult [docs/troubleshooting.md](../../docs/troubleshooting.md)

---

**Remember**: Never commit `.env` or `acme.json` to version control!
