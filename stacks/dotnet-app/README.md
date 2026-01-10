# 💻 .NET Applications Stack

Production deployment of .NET 8+ applications (ASP.NET Core, Blazor, Web API, Razor Pages) with multiple database options.

## 🚀 Supported Technologies

- **ASP.NET Core**: Web API, MVC, Razor Pages
- **Blazor**: Server and WebAssembly
- **SignalR**: Real-time applications
- **Entity Framework Core**: ORM for database operations

## 🗄️ Supported Databases

- **PostgreSQL**: Production-ready, open-source (default)
- **SQL Server**: Enterprise-grade (optional, requires license)
- **MySQL**: Popular open-source option (optional)

## 📋 Prerequisites

- Docker & Docker Compose installed
- Traefik reverse proxy running (`traefik-net` network exists)
- Domain pointed to your server
- .NET application image in registry OR source code to build

## 🏗️ Quick Start

### 1. Create configuration

```bash
cd stacks/dotnet-app

# Copy example to create your .env
cp .env.example .env

# Edit with your values
nano .env
```

**Minimum required in `.env`:**
```bash
DOTNET_IMAGE=your-registry/your-app:latest
DOMAIN=api.yourdomain.com
POSTGRES_PASSWORD=your_strong_password_min_20_chars
JWT_SECRET=generate_64_character_secret_key
```

### 2. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

That's it! Your application will be available at `https://your-domain.com`

## 🔧 Configuration Details

### Required Variables

Edit `.env` file:

```bash
# Application
DOTNET_IMAGE=ghcr.io/yourorg/app:latest  # Your Docker image
DOMAIN=api.yourdomain.com                # Your domain

# Database (PostgreSQL)
POSTGRES_PASSWORD=generate_strong_password_here
POSTGRES_DB=dotnetdb
POSTGRES_USER=dotnetuser

# JWT (for authentication)
JWT_SECRET=generate_minimum_64_character_secret_key
```

### Optional Variables

```bash
# Build from source (instead of using pre-built image)
BUILD_CONTEXT=./app
DOCKERFILE=Dockerfile

# Different database (uncomment and configure)
# See .env.example for SQL Server or MySQL configuration

# Email settings
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Resource limits
MEMORY_LIMIT=1G
CPU_LIMIT=0.5
```

### Generate Secure Secrets

```bash
# Strong password
openssl rand -base64 32

# JWT secret (minimum 64 characters)
openssl rand -base64 64

# API key
openssl rand -hex 32
```

## 🗄️ Database Options

### PostgreSQL (default)

Already configured in `.env.example`. Just set password and deploy.

### SQL Server (optional)

```bash
# In .env, uncomment and configure:
# SQLSERVER_SA_PASSWORD=YourStrong!Passw0rd
# DB_CONNECTION_STRING=Server=sqlserver;Database=DotNetDb;...

# Deploy with SQL Server profile:
docker compose --profile sqlserver up -d
```

### MySQL (optional)

```bash
# In .env, uncomment and configure:
# MYSQL_PASSWORD=your_password
# DB_CONNECTION_STRING=Server=mysql;Database=dotnetdb;...

# Deploy with MySQL profile:
docker compose --profile mysql up -d
```

## 🔍 Verification

### Check status

```bash
docker compose ps
```

### View logs

```bash
docker compose logs -f app
```

### Test health endpoint

```bash
curl https://your-domain.com/health
```

### Access your application

Open browser: `https://your-domain.com`

## 🛠️ Common Operations

### Update application

```bash
# Pull new image
docker compose pull app

# Restart with new image
docker compose up -d app
```

### Run migrations

```bash
docker compose --profile tools run --rm migrate
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f postgres
```

### Restart services

```bash
# Restart app only
docker compose restart app

# Restart all
docker compose restart
```

### Stop stack

```bash
docker compose down
```

## 🗄️ Database Management

### Access PostgreSQL

```bash
docker compose exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

### Backup database

```bash
docker compose exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup_$(date +%Y%m%d).sql
```

### Restore database

```bash
cat backup_20260107.sql | docker compose exec -T postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

## 🐛 Troubleshooting

### Application not accessible

1. **Check Traefik**:
   ```bash
   docker logs traefik
   ```

2. **Verify DNS**:
   ```bash
   dig your-domain.com +short
   # Should return your server IP
   ```

3. **Check application logs**:
   ```bash
   docker compose logs -f app
   ```

### Database connection errors

1. **Check database is running**:
   ```bash
   docker compose ps postgres
   ```

2. **Verify connection string** in `.env`:
   - Host should be `postgres` (not localhost)
   - Password matches in all places

3. **Test connection**:
   ```bash
   docker compose exec postgres pg_isready
   ```

### Migration failures

1. **Check database is healthy**:
   ```bash
   docker compose ps
   ```

2. **Run migrations manually**:
   ```bash
   docker compose --profile tools run --rm migrate
   ```

3. **Check logs**:
   ```bash
   docker compose logs migrate
   ```

### SSL certificate issues

1. **Check Traefik configuration**:
   - Is domain correctly configured?
   - Is Let's Encrypt working?

2. **View Traefik dashboard**:
   ```
   http://your-server-ip:8080/dashboard/
   ```

## 🏗️ Architecture

```
Internet (HTTPS)
      ↓
┌─────────────┐
│   Traefik   │  :443 (SSL/TLS)
│ Reverse Proxy│  Let's Encrypt
└──────┬──────┘
       │ traefik-net
       ↓
┌─────────────┐
│  .NET App   │  :8080
│  Container  │
└──────┬──────┘
       │ internal network
       ↓
┌─────────────┐
│  PostgreSQL │  :5432
│  Database   │
└─────────────┘
```

## 🔒 Security Best Practices

- ✅ All secrets in `.env` (never in code)
- ✅ `.env` is in `.gitignore`
- ✅ Strong passwords (min 20 characters)
- ✅ JWT secrets (min 64 characters)
- ✅ HTTPS enforced via Traefik
- ✅ Database on internal network only
- ✅ Regular backups
- ✅ Health checks enabled

## 📝 File Structure

```
stacks/dotnet-app/
├── docker-compose.yml     # Service definitions
├── .env                   # Your configuration (gitignored)
├── .env.example           # Template with all options
├── deploy.sh              # Deployment script
├── README.md              # This file
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   └── health-check.sh
└── docs/
    └── troubleshooting.md
```

## 🔗 Integration

This stack integrates with:
- **Traefik** (reverse proxy) - Required
- **Monitoring** (Grafana/Prometheus) - Optional
- **Automation** (N8N) - Optional

All services communicate via the shared `traefik-net` network.

## 📚 Additional Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [Docker Documentation](https://docs.docker.com)
- [Traefik Documentation](https://doc.traefik.io/traefik)

## 🆘 Support

For issues:
1. Check logs: `docker compose logs -f`
2. Verify `.env` configuration
3. Review [docs/troubleshooting.md](./docs/troubleshooting.md)
4. Check Traefik dashboard

---

**Remember**: Never commit `.env` to version control! Keep your secrets safe.
