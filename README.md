# infra-production

**🚧 Status**: Add ASP.NET Core 8+ - In progress phase

Production infrastructure using Traefik reverse proxy and Docker Compose for deploying modern web applications.

## 🏗️ Architecture

This repository follows a modular, cloud-native approach:

- **Centralized reverse proxy**: Traefik handles all incoming HTTPS traffic, SSL certificates, and routing
- **Isolated application stacks**: Each service runs in its own compose stack, connected via external network
- **Environment-based configuration**: All secrets and settings via `.env` files (never in Git)
- **Zero hardcoded values**: Complete portability across environments

---

## 🚀 Planned Technology Stacks

**Status**: ASP.NET Core deployed ✅ | Other stacks planned 🔄

| Stack               | Technology                                          | Status      |
|---------------------|-----------------------------------------------------|-------------|
| Reverse Proxy       | Traefik v3 + Let's Encrypt                         | ✅ Ready    |
| .NET Applications   | ASP.NET Core 8+, Blazor                            | ✅ Ready  |
| PHP Applications    | WordPress, Symfony, Laravel, Drupal, Magento, Zend | 📋 Planned  |
| Frontend Apps       | React, Vue, Next, Nuxt, Node.js, Express, Angular  | 📋 Planned  |
| Web Servers         | Nginx, Apache2, Tomcat, Caddy, MailHog             | 📋 Planned  |
| Monitoring          | Grafana, Prometheus, cAdvisor, Node Exporter       | 📋 Planned  |
| Automation          | n8n Workflows                                       | 📋 Planned  |
| Databases           | PostgreSQL, MySQL, MariaDB, MongoDB, Redis         | 📋 Planned  |
| Security            | Trivy, Fail2ban, CrowdSec, SSL Management          | 📋 Planned  |
| Backup/DR           | Automated backup, encryption, restore              | 📋 Planned  |
| CI/CD               | GitHub Actions, validation, deployment             | 📋 Planned  |
---

## 📋 Project Goals

- **Modularity**: Each service is independent and can be deployed separately
- **Security**: All secrets managed via environment variables, never committed
- **Portability**: No hardcoded paths, domains, or credentials
- **Automation**: One-command deployment for each stack
- **Documentation**: Comprehensive guides for setup and troubleshooting
- **Best Practices**: Following Docker and security industry standards

---

## 🎯 Design Principles

### Environment Variables First
All configuration through `.env` files:
- Never committed to Git
- Template `.env.example` provided for each stack
- Clear documentation of all required variables

### Zero Hardcoded Values
No paths, domains, or credentials in code:
- Complete portability across environments
- Easy migration between servers
- Simplified disaster recovery

### Single External Network
All services communicate via `traefik-net`:
- Centralized routing through Traefik
- Isolated internal networks per stack
- Simplified service discovery

### One-Command Deployment
Each stack has `./deploy.sh`:
- Validates configuration
- Checks prerequisites
- Deploys services
- Verifies health

---

## 📚 Repository Structure
```
infra-production/
├── README.md                            # This file
├── .gitignore                           # Git ignore rules
├── GIT_COMMITS.md                       # Commit conventions
├── .gitmessage                          # Commit message template
│
├── docs/
│      ├── architecture_diagrams.md      # Architecture overview and design patterns
│      ├── deployment_procedures.md      # Standard operating procedures
│      └── troubleshooting.md            # General troubleshooting guide
│
│ ├── QUICKSTART.md                      # Infrastructure running in 5 minutes
│ ├── COMPLETE_DEPLOYMENI_GUIDE.md       # Comprehensive guide for deploying
│ └── DEPLOYMENT.md                      # Original deployment notes
│
├── reverse-proxy/                       # Traefik v3 + Let's Encrypt
│ └── traefik/
│
└── stacks/ # (In progress)
├── dotnet-app/
├── php-app/
├── frontend-app/
├── monitoring/
└── ...
```

---

## 🔒 Security First

- ✅ All secrets in `.env` files (gitignored)
- ✅ No credentials in repository
- ✅ Strong password requirements (20+ characters)
- ✅ Automatic SSL via Let's Encrypt
- ✅ HTTPS enforced for all services
- ✅ Database on internal network only

---

## 🚀 Getting Started

**Current phase** - Deploy .NET application stack

Each component will be added incrementally with:
- Complete documentation
- Deployment scripts
- Configuration examples
- Troubleshooting guides

**First deployment** (PHP application stack) coming soon.

---

## 📖 Deployment Philosophy

### Incremental Deployment
1. Deploy Traefik reverse proxy first
2. Add application stacks one by one
3. Test each stack independently
4. Document learnings and issues

### Configuration Templates
Each stack provides `.env.example` with:
- All required variables documented
- Example values (not real ones)
- Commands to generate secrets
- Links to documentation

### Validation Scripts
Each `deploy.sh` script:
- Checks `.env` exists
- Validates required variables
- Verifies prerequisites
- Reports errors clearly

---

## 🔄 Development Workflow

**Phase 1: Foundation** ⬅️ _Current Phase_
- [x] Initialize repository structure
- [x] Define architecture and principles
- [x] Establish commit conventions
- [x] Add comprehensive documentation

**Phase 2: Core Infrastructure**
- [x] Traefik reverse proxy
- [x] First application stack (.NET)
- [ ] Monitoring stack

**Phase 3: Expansion**
- [ ] Additional application stacks
- [ ] Security hardening
- [ ] Backup and disaster recovery
- [ ] CI/CD automation

---

## 📞 Contributing

This is an infrastructure repository for deploying production services. Contributions welcome:
- Follow commit conventions (see GIT_COMMITS.md)
- Never commit `.env` files or secrets
- Test changes thoroughly
- Update documentation

---

## 📜 License

This infrastructure configuration is provided as-is for deployment of your own applications.

---

**Current Milestone**: 🏗️ Deploy Traefik Reverse Proxy

**Next Steps**:
- [ ] Deploy PHP applications stack
- [ ] Deploy monitoring stack (Grafana + Prometheus)
- [ ] Deploy static sites and modern frontend stack
- [ ] Deploy web servers stack (Nginx, Apache, Tomcat)
- [ ] Deploy automation n8N stack

---

Made with ❤️ for production deployments
## 🚀 Quick Deployment (Updated)

### Single Command Deployment
```bash
./deploy-all.sh
```

### Utility Scripts
- `scripts/create-networks.sh` - Create Docker networks
- `scripts/wait-for-services.sh` - Wait for service health  
- `scripts/status.sh` - Check all services status

### Security Reference
- `traefik-security-patch.txt` - Traefik security validation reference
- `dotnet-security-patch.txt` - .NET app security validation reference
