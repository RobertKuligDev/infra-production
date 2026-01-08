# 🏗️ Architecture Diagrams

Architecture overview and design patterns for the infra-production infrastructure.

## 🎯 Design Philosophy

This infrastructure follows a **microservices architecture** with:
- Centralized reverse proxy (Traefik)
- Isolated application stacks
- Shared external network for routing
- Internal networks for service communication
- Environment-based configuration

---

## 🌐 Planned Overall Architecture

```
Internet (HTTPS)
       │
       ▼
┌──────────────────┐
│     Traefik      │  ← Centralized reverse proxy
│  Reverse Proxy   │     • SSL/TLS termination (Let's Encrypt)
│   (Port 443)     │     • Service discovery (Docker)
└────────┬─────────┘     • Routing & load balancing
         │               • Rate limiting & security
         │
    traefik-net (external network)
         │
    ┌────┴────┬────────┬────────┬────────┬────────┐
    │         │        │        │        │        │
    ▼         ▼        ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ .NET   │ │ PHP  │ │Monitor│ │Auto- │ │Static│ │ Web  │
│ Stack  │ │Stack │ │Stack │ │mation│ │Sites │ │Server│
└───┬────┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──────┘
    │         │        │        │        │
    │    internal networks (isolated)
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Database│ │Database│ │ Time │ │Cache │
│        │ │        │ │Series│ │      │
└────────┘ └──────┘ └──────┘ └──────┘
```

---

## 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Security Layers                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: Network Isolation                         │
│  ├─ External network (traefik-net) for routing     │
│  └─ Internal networks (per-stack isolation)        │
│                                                     │
│  Layer 2: Transport Security                        │
│  ├─ HTTPS only (HTTP → HTTPS redirect)             │
│  ├─ Let's Encrypt SSL certificates                 │
│  └─ Modern TLS configuration                       │
│                                                     │
│  Layer 3: Application Security                      │
│  ├─ Environment-based secrets (.env)               │
│  ├─ No credentials in code/Git                     │
│  └─ Strong password policies (20+ chars)           │
│                                                     │
│  Layer 4: Access Control                            │
│  ├─ Rate limiting (per service)                    │
│  ├─ IP whitelisting (optional)                     │
│  ├─ Basic authentication (dashboards)              │
│  └─ JWT tokens (API access)                        │
│                                                     │
│  Layer 5: Database Security                         │
│  ├─ Internal network only (no external access)     │
│  ├─ Strong credentials                             │
│  └─ Encrypted connections (optional)               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Pattern

```
1. Client Request
       │
       ├─> DNS Resolution
       │
       ▼
2. HTTPS Request to Domain
       │
       ├─> Port 443 (HTTPS)
       │
       ▼
3. Traefik Reverse Proxy
       │
       ├─> SSL Termination
       ├─> Route Matching (labels)
       ├─> Middleware (rate limit, headers)
       │
       ▼
4. Application Container
       │
       ├─> Internal HTTP (port 8080)
       ├─> Business logic
       │
       ▼
5. Database/Cache (if needed)
       │
       ├─> Internal network
       ├─> Connection pooling
       │
       ▼
6. Response
       │
       ├─> Back through Traefik
       ├─> Compression, headers
       │
       ▼
7. Client Receives Response
```

---

## 🔌 Network Architecture

### External Network (traefik-net)

```
┌─────────────────────────────────────────────┐
│          traefik-net (external)             │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Traefik  │  │  Stack1  │  │  Stack2  │ │
│  │          │  │   App    │  │   App    │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘

Purpose: Allow Traefik to route to all application containers
Security: Only application containers exposed, not databases
```

### Internal Networks (per-stack)

```
Stack Example: dotnet-app
┌──────────────────────────────────────────┐
│     dotnet-internal (bridge network)     │
│                                          │
│  ┌──────────────┐    ┌───────────────┐ │
│  │  Application │────│   Database    │ │
│  │  Container   │    │   Container   │ │
│  └──────┬───────┘    └───────────────┘ │
│         │                               │
│         │ Also connected to             │
│         │ traefik-net for routing       │
│         │                               │
└─────────┼───────────────────────────────┘
          │
      traefik-net
```

---

## 📦 Generic Stack Pattern

Every stack follows this pattern:

```
┌─────────────────────────────────────────────┐
│              Stack Directory                │
├─────────────────────────────────────────────┤
│                                             │
│  docker-compose.yml                         │
│  ├─ Services definitions                   │
│  ├─ Networks (traefik-net + internal)      │
│  ├─ Volumes (data persistence)             │
│  └─ Labels (Traefik routing)               │
│                                             │
│  .env (not in Git)                          │
│  ├─ DOMAIN=service.yourdomain.com          │
│  ├─ DB_PASSWORD=strong_password            │
│  └─ All stack-specific config              │
│                                             │
│  .env.example (in Git)                      │
│  └─ Template with all variables            │
│                                             │
│  deploy.sh                                  │
│  ├─ Validates .env exists                  │
│  ├─ Checks required variables              │
│  ├─ Creates networks if needed             │
│  └─ Deploys with docker compose            │
│                                             │
│  README.md                                  │
│  └─ Stack-specific documentation           │
│                                             │
│  scripts/                                   │
│  ├─ backup.sh                              │
│  ├─ restore.sh                             │
│  └─ health-check.sh                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔐 SSL/TLS Flow

```
1. Client connects to https://app.yourdomain.com
              │
              ▼
2. Traefik receives request on port 443
              │
              ├─> Check if certificate exists
              │   ├─ Yes: Use existing
              │   └─ No: Request from Let's Encrypt
              │
              ▼
3. Let's Encrypt (if needed)
              │
              ├─> HTTP-01 Challenge on port 80
              ├─> Domain validation
              └─> Issue certificate
              │
              ▼
4. Certificate stored in acme.json
              │
              ├─> Permissions: 600
              └─> Auto-renewal before expiry
              │
              ▼
5. Traefik serves content over HTTPS
              │
              └─> TLS 1.2/1.3 with modern ciphers
```

---

## 🏗️ Deployment Architecture

```
Development Machine
       │
       │ git push
       ▼
GitHub Repository
       │
       │ git pull
       ▼
Production Server
       │
       ├─> 1. Clone/Pull repo
       │
       ├─> 2. Create .env from .env.example
       │
       ├─> 3. Run deploy.sh
       │      ├─> Validate configuration
       │      ├─> docker compose pull
       │      └─> docker compose up -d
       │
       └─> 4. Verify deployment
              ├─> Health checks
              ├─> SSL certificates
              └─> Service accessibility
```

---

## 📊 Monitoring Architecture (Planned)

```
┌─────────────────────────────────────────────┐
│            Monitoring Flow                  │
├─────────────────────────────────────────────┤
│                                             │
│  All Application Stacks                     │
│         │                                   │
│         ├─> Metrics exposed                │
│         │                                   │
│         ▼                                   │
│   Prometheus                                │
│         │                                   │
│         ├─> Scrapes metrics                │
│         ├─> Stores time-series data        │
│         │                                   │
│         ▼                                   │
│   Grafana                                   │
│         │                                   │
│         ├─> Visualizes metrics             │
│         ├─> Creates dashboards             │
│         └─> Sends alerts                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Design Principles

### 1. Modularity
- Each stack is independent
- Can be deployed/updated separately
- No tight coupling between services

### 2. Security First
- No secrets in Git
- All traffic over HTTPS
- Database isolation
- Strong authentication

### 3. Observability
- Health checks for all services
- Centralized logging (planned)
- Metrics collection (planned)
- Alert system (planned)

### 4. Scalability
- Easy horizontal scaling
- Load balancing via Traefik
- Resource limits per service
- Stateless applications preferred

### 5. Maintainability
- Clear documentation
- Consistent patterns
- Automated deployments
- Easy rollbacks

---

## 📝 Notes

- All diagrams use **ASCII art** for git-friendly documentation
- Architecture evolves as new stacks are added
- Each stack will have detailed architecture in its README
- Security model reviewed regularly

---

**Status**: Initial architecture design  
**Last Updated**: 2026-01-08  
**Next Update**: After Traefik deployment
