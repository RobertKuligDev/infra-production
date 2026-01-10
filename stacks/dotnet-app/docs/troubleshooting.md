# 🔧 Troubleshooting Guide - .NET Applications Stack

Comprehensive guide for diagnosing and resolving issues with .NET application deployment.

## 📋 Table of Contents

- [Quick Diagnostics](#-quick-diagnostics)
- [General Issues](#%EF%B8%8F-general-issues)
- [Application Issues](#-application-issues)
- [Database Issues](#%EF%B8%8F-database-issues)
- [Network & Routing Issues](#-network--routing-issues)
- [SSL/TLS Issues](#-ssltls-issues)
- [Performance Issues](#-performance-issues)
- [Security Issues](#-security-issues)
- [Recovery Procedures](#-recovery-procedures)
- [Diagnostic Commands](#-diagnostic-commands)

---

## 🚀 Quick Diagnostics

Run these first to get an overview:

```bash
# Comprehensive health check
./scripts/health-check.sh

# Check all services status
docker compose ps

# View recent logs
docker compose logs --tail=50

# Check resource usage
docker stats --no-stream
```

---

## ⚙️ General Issues

### Application Won't Start

**Symptoms**: Container exits immediately after starting

**Diagnostic Steps**:
```bash
# Check logs for errors
docker compose logs -f app

# Verify .env exists and is loaded
cat .env | grep -v "PASSWORD\|SECRET"

# Check if all required variables are set
./deploy.sh
```

**Common Causes & Solutions**:

1. **Missing `.env` file**
   ```bash
   cp .env.example .env
   nano .env  # Configure required variables
   ```

2. **Invalid connection string**
   ```bash
   # Verify format in .env
   DB_CONNECTION_STRING=Host=postgres;Database=dotnetdb;Username=user;Password=pass
   ```

3. **Database not ready**
   ```bash
   # Start database first
   docker compose up -d postgres
   sleep 10
   docker compose up -d app
   ```

### Container Keeps Restarting

**Symptoms**: Service shows constant restart cycles

**Diagnostic Steps**:
```bash
# Check exit code and error
docker compose ps app
docker compose logs --tail=100 app | grep -i "error\|exception\|fatal"

# Check health check status
docker inspect $(docker compose ps -q app) | jq '.[].State.Health'
```

**Common Causes & Solutions**:

1. **Health check failing**
   ```bash
   # Increase health check timings in .env
   HEALTH_CHECK_START_PERIOD=120s
   HEALTH_CHECK_INTERVAL=60s
   ```

2. **Configuration errors**
   ```bash
   # Validate configuration
   docker compose config
   ```

3. **Resource limits**
   ```bash
   # Increase in .env
   MEMORY_LIMIT=2G
   CPU_LIMIT=1.0
   ```

### High Resource Usage

**Symptoms**: System slowness, high memory/CPU

**Diagnostic Steps**:
```bash
# Check resource usage
docker stats

# Check for errors causing loops
docker compose logs app | grep -i "retry\|attempt\|error"

# Check database connections
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solutions**:
1. Review application logs for infinite loops
2. Check database connection pooling settings
3. Consider scaling resources in `.env`
4. Check for memory leaks using profiling tools

---

## 💻 Application Issues

### Connection to Database Fails

**Symptoms**: "Could not connect to database" errors

**Diagnostic Steps**:
```bash
# Check database is running
docker compose ps postgres

# Test database connectivity
docker compose exec postgres pg_isready -U $POSTGRES_USER

# Verify connection from app container
docker compose exec app ping postgres

# Check connection string
echo $DB_CONNECTION_STRING
```

**Solutions**:

1. **Wrong host name**
   ```bash
   # In .env, use service name, not localhost
   DB_CONNECTION_STRING=Host=postgres;...  # ✅ Correct
   DB_CONNECTION_STRING=Host=localhost;...  # ❌ Wrong
   ```

2. **Credentials mismatch**
   ```bash
   # Verify credentials match
   grep POSTGRES_USER .env
   grep POSTGRES_PASSWORD .env
   grep DB_CONNECTION_STRING .env
   ```

3. **Database not ready**
   ```bash
   # Wait for database to be ready
   docker compose up -d postgres
   sleep 10
   ./deploy.sh
   ```

### Health Check Fails

**Symptoms**: Container shows as "unhealthy"

**Diagnostic Steps**:
```bash
# Check health endpoint manually
docker compose exec app curl -f http://localhost:${APP_PORT:-8080}/health

# Check logs
docker compose logs app | grep health

# Verify health endpoint exists in code
```

**Solutions**:

1. **Health endpoint not implemented**
   ```csharp
   // In Program.cs
   app.MapHealthChecks("/health");
   ```

2. **Wrong port configuration**
   ```bash
   # In .env, verify APP_PORT matches your application
   APP_PORT=8080
   ```

3. **Slow startup**
   ```bash
   # Increase start period in .env
   HEALTH_CHECK_START_PERIOD=120s
   ```

### JWT Authentication Errors

**Symptoms**: "Unauthorized" or "Invalid token" errors

**Diagnostic Steps**:
```bash
# Verify JWT settings
grep JWT .env

# Check JWT secret length (should be 64+ characters)
echo $JWT_SECRET | wc -c

# Check application logs
docker compose logs app | grep -i "jwt\|auth"
```

**Solutions**:

1. **JWT secret too short**
   ```bash
   # Generate proper secret (64+ chars)
   JWT_SECRET=$(openssl rand -base64 64)
   echo "JWT_SECRET=$JWT_SECRET" >> .env
   ```

2. **Issuer/Audience mismatch**
   ```bash
   # In .env, ensure these match your frontend
   JWT_ISSUER=https://yourdomain.com
   JWT_AUDIENCE=https://yourdomain.com
   ```

### CORS Errors

**Symptoms**: Browser shows CORS policy errors

**Diagnostic Steps**:
```bash
# Check CORS configuration
grep CORS .env

# Test with curl
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://api.yourdomain.com/api/endpoint -v
```

**Solutions**:
```bash
# In .env, allow your frontend domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Or for development (not production!)
CORS_ALLOWED_ORIGINS=*
```

---

## 🗄️ Database Issues

### PostgreSQL Connection Failures

**Diagnostic Steps**:
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;"

# Check database exists
docker compose exec postgres psql -U $POSTGRES_USER -lqt | grep $POSTGRES_DB
```

**Solutions**:

1. **Database not initialized**
   ```bash
   # Recreate database
   docker compose down -v
   docker compose up -d
   ```

2. **Wrong credentials**
   ```bash
   # Reset credentials in .env
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   # Update DB_CONNECTION_STRING accordingly
   ```

3. **Connection limit reached**
   ```bash
   # Check active connections
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
     "SELECT count(*) FROM pg_stat_activity;"
   ```

### SQL Server Connection Failures

**Diagnostic Steps**:
```bash
# Check SQL Server is running
docker compose --profile sqlserver ps sqlserver

# Test connection
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" -Q "SELECT 1"
```

**Solutions**:

1. **TrustServerCertificate not set**
   ```bash
   # In .env, add to connection string
   DB_CONNECTION_STRING=Server=sqlserver;Database=db;User Id=sa;Password=pass;TrustServerCertificate=true
   ```

2. **Password complexity requirements**
   ```bash
   # SQL Server requires complex passwords
   # Minimum 8 characters, uppercase, lowercase, numbers, symbols
   SQLSERVER_SA_PASSWORD='YourStrong!Passw0rd'
   ```

### Database Migration Errors

**Symptoms**: "Migration failed" or schema errors

**Diagnostic Steps**:
```bash
# Check migration status
docker compose --profile tools run --rm migrate

# Check migration logs
docker compose logs migrate

# Check database schema
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
```

**Solutions**:

1. **Run migrations manually**
   ```bash
   docker compose --profile tools run --rm migrate
   ```

2. **Reset migrations**
   ```bash
   # ⚠️ WARNING: This deletes data!
   docker compose down -v
   docker compose up -d
   docker compose --profile tools run --rm migrate
   ```

---

## 🌐 Network & Routing Issues

### Service Not Accessible via Domain

**Symptoms**: "Unable to connect" or timeout errors

**Diagnostic Steps**:
```bash
# Check DNS resolution
dig yourdomain.com +short

# Check Traefik routing
docker logs traefik | grep yourdomain.com

# Check Traefik dashboard
# http://SERVER_IP:8080/dashboard/

# Verify service is on traefik-net
docker network inspect traefik-net | grep -A5 dotnet-app
```

**Solutions**:

1. **DNS not pointing to server**
   ```bash
   # Update DNS A record to point to server IP
   # Wait for DNS propagation (can take up to 48 hours)
   ```

2. **Service not on traefik-net**
   ```bash
   # Check docker-compose.yml networks section
   docker compose down
   docker compose up -d
   ```

3. **Wrong domain in labels**
   ```bash
   # Verify DOMAIN in .env matches actual domain
   grep DOMAIN .env
   ```

### 404 Errors from Traefik

**Symptoms**: Traefik responds with 404

**Diagnostic Steps**:
```bash
# Check if router exists in Traefik
docker logs traefik | grep "dotnet-app"

# Verify labels
docker inspect $(docker compose ps -q app) | jq '.[].Config.Labels'
```

**Solutions**:
```bash
# Restart Traefik and app
docker restart traefik
docker compose restart app
```

---

## 🔒 SSL/TLS Issues

### Certificate Not Generated

**Symptoms**: Browser shows "Not Secure" or SSL errors

**Diagnostic Steps**:
```bash
# Check Traefik logs for ACME errors
docker logs traefik | grep -i "acme\|certificate\|letsencrypt"

# Verify port 80 is accessible
curl -I http://yourdomain.com

# Check certificate status in Traefik dashboard
```

**Solutions**:

1. **Port 80 blocked**
   ```bash
   # Ensure firewall allows port 80
   sudo ufw allow 80
   sudo ufw allow 443
   ```

2. **Invalid email**
   ```bash
   # Check ACME_EMAIL in Traefik .env
   cd ~/projects/infra-production/reverse-proxy/traefik
   grep ACME_EMAIL .env
   ```

3. **Rate limit hit**
   ```bash
   # Let's Encrypt has rate limits (5/week per domain)
   # Wait and try again, or use staging environment
   ```

### Certificate Expired

**Symptoms**: Browser shows expired certificate warning

**Solutions**:
```bash
# Force certificate renewal
cd ~/projects/infra-production/reverse-proxy/traefik
docker compose down
rm letsencrypt/acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
docker compose up -d

# Wait 2-5 minutes for new certificate
```

---

## ⚡ Performance Issues

### Slow Response Times

**Diagnostic Steps**:
```bash
# Check response time
time curl https://yourdomain.com/health

# Check resource usage
docker stats dotnet-app

# Check database query performance
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
  "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
```

**Solutions**:

1. **Enable response compression**
   ```bash
   # Already enabled in Traefik config/middlewares.yml
   # Add to service labels if needed
   ```

2. **Database connection pooling**
   ```csharp
   // In your DbContext configuration
   options.UseSqlServer(connectionString, 
       sqlOptions => sqlOptions.CommandTimeout(30));
   ```

3. **Increase resources**
   ```bash
   # In .env
   MEMORY_LIMIT=2G
   CPU_LIMIT=1.5
   ```

### High Memory Usage

**Diagnostic Steps**:
```bash
# Check memory usage over time
docker stats --no-stream dotnet-app

# Check for memory leaks
docker compose logs app | grep -i "memory\|gc\|heap"
```

**Solutions**:

1. **Increase memory limit**
   ```bash
   MEMORY_LIMIT=2G
   ```

2. **Profile application**
   - Use dotnet-trace or dotnet-dump
   - Identify memory leaks
   - Fix in application code

---

## 🔐 Security Issues

### Authentication Failures

**Solutions**:
1. Verify JWT secret is set and correct
2. Check token expiry settings
3. Verify CORS configuration
4. Check authentication middleware order

### Exposed Secrets

**If you accidentally committed secrets**:

```bash
# 1. IMMEDIATELY change all passwords/secrets
# 2. Rotate JWT secrets
# 3. Regenerate API keys
# 4. Remove from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 5. Force push (⚠️ WARNING)
git push --force --all
```

---

## 🔄 Recovery Procedures

### Quick Service Restart

```bash
# Restart app only
docker compose restart app

# Restart all services
docker compose restart

# Full redeploy
./deploy.sh
```

### Application Recovery

```bash
# 1. Check logs for root cause
docker compose logs --tail=200 app > error.log

# 2. Try restart
docker compose restart app

# 3. If persistent, rebuild
docker compose down
docker compose up -d --build

# 4. Last resort - restore from backup
./scripts/restore.sh /path/to/backup.tar.gz
```

### Database Recovery

```bash
# 1. Stop application
docker compose stop app

# 2. Backup current state (even if corrupted)
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > emergency_backup.sql

# 3. Restore from good backup
./scripts/restore.sh /path/to/good/backup.tar.gz

# 4. Start application
docker compose up -d app
```

### Complete Stack Reset

```bash
# ⚠️ WARNING: This deletes all data!

# 1. Stop everything
docker compose down

# 2. Remove volumes
docker compose down -v

# 3. Remove backup (optional, if corrupted)
rm -rf backups/*

# 4. Redeploy fresh
./deploy.sh
```

---

## 🛠️ Diagnostic Commands

### Essential Commands

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100

# Follow logs with timestamps
docker compose logs -f -t

# Check service status
docker compose ps

# Check health status
docker compose ps app | grep -i health

# Resource usage
docker stats

# Network inspection
docker network inspect traefik-net

# Container inspection
docker inspect $(docker compose ps -q app)

# Execute commands in containers
docker compose exec app bash
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### Advanced Diagnostics

```bash
# Check environment variables
docker compose exec app env | grep -i db

# Check running processes
docker compose exec app ps aux

# Check disk space
df -h
docker system df

# Check network connectivity
docker compose exec app ping postgres
docker compose exec app curl http://postgres:5432

# Database queries
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
  "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

---

## 🆘 Getting Help

If issues persist after trying these solutions:

1. **Run comprehensive diagnostics**:
   ```bash
   ./scripts/health-check.sh > health-report.txt
   docker compose logs > full-logs.txt
   docker compose ps > services-status.txt
   ```

2. **Gather information**:
   - Docker version: `docker --version`
   - Docker Compose version: `docker compose version`
   - OS version: `lsb_release -a`
   - `.env` (redacted): `cat .env | sed 's/PASSWORD=.*/PASSWORD=****/g'`

3. **Check documentation**:
   - [Main README](../README.md)
   - [Deployment Guide](../../COMPLETE_DEPLOYMENT_GUIDE.md)
   - [Traefik Documentation](../../reverse-proxy/traefik/README.md)

4. **Contact support** with:
   - Health report
   - Logs (last 500 lines)
   - Steps to reproduce
   - What you've already tried

---

**Remember**: Most issues are configuration-related. Double-check your `.env` file first! 🔍
