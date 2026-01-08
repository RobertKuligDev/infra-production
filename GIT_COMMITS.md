# 📝 Git Commit Strategy

Professional commit structure for the infra-production repository following Conventional Commits specification.

## Commit Convention

**Format**: `<type>(<scope>): <subject>`

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(dotnet): add .NET stack` |
| `fix` | Bug fix | `fix(proxy): correct SSL configuration` |
| `docs` | Documentation only | `docs(readme): update quickstart guide` |
| `chore` | Maintenance tasks | `chore(repo): update .gitignore` |
| `refactor` | Code refactoring | `refactor(dotnet): migrate to env variables` |
| `perf` | Performance improvements | `perf(proxy): optimize rate limiting` |
| `test` | Adding tests | `test(dotnet): add health check tests` |
| `style` | Formatting changes | `style(docs): fix markdown formatting` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `build` | Build system changes | `build: update Docker base images` |
| `revert` | Revert previous commit | `revert: revert "feat(dotnet): add feature"` |

### Scopes

| Scope | Description | Example |
|-------|-------------|---------|
| `repo` | General repository | `chore(repo): initialize repository` |
| `proxy` | Traefik reverse proxy | `feat(proxy): add Traefik with SSL` |
| `dotnet` | .NET applications | `feat(dotnet): add ASP.NET Core stack` |
| `php` | PHP applications | `feat(php): add WordPress, Laravel, Symfony` |
| `frontend` | Frontend applications | `feat(frontend): add React, Vue, Next.js` |
| `webservers` | Web servers | `feat(webservers): add Nginx, Apache, Tomcat` |
| `monitoring` | Monitoring stack | `feat(monitoring): add Grafana, Prometheus` |
| `automation` | n8n workflows | `feat(automation): add n8n automation` |
| `databases` | Database stack | `feat(databases): add PostgreSQL, MySQL, MongoDB` |
| `security` | Security tools | `feat(security): add Trivy, Fail2ban, CrowdSec` |
| `backup` | Backup & DR | `feat(backup): add centralized backup system` |
| `cicd` | CI/CD pipelines | `feat(cicd): add GitHub Actions workflows` |
| `docs` | Documentation files | `docs(quickstart): add examples` |

## Commit Message Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Subject Line Rules

- Use imperative mood: "add feature" not "added feature" or "adds feature"
- Don't capitalize first letter
- No period at the end
- Maximum 72 characters
- Be specific but concise

### Body (Optional)

- Explain **what** and **why**, not **how**
- Wrap at 72 characters
- Separate from subject with blank line
- Use bullet points for multiple items

### Footer (Optional)

- Reference issues: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: <description>`
- Co-authors: `Co-authored-by: Name <email>`

## Recommended Commit Sequence

Based on deployment order, commit stacks incrementally to maintain testable history.

### 1. Initial Repository Setup

```bash
git add README.md .gitignore GIT_COMMITS.md
git commit -m "chore(repo): initialize repository with base structure

- Add README with project goals and architecture overview
- Add comprehensive .gitignore for secrets and sensitive files
- Add GIT_COMMITS.md with commit conventions and guidelines
- Add .gitmessage template for consistent commits
- Define design principles and security approach
- Plan modular stack-based deployment structure

Foundation for environment-variable-based infrastructure"
```

### 2. Add Documentation

```bash
git add QUICKSTART.md DEPLOYMENT.md COMPLETE_DEPLOYMENT_GUIDE.md docs/
git commit -m "docs(repo): add deployment documentation and diagrams

- Quick start guide for 5-minute setup
- Complete deployment guide with detailed instructions
- Architecture diagrams with ASCII art for all planned stacks
- Security architecture and data flow documentation  
- Network architecture patterns and design principles
- Standard deployment procedures for all stacks
- Backup, restore, and emergency procedures
- Troubleshooting guide for infrastructure-wide issues
- Comprehensive diagnostic commands reference
- Complete deployment checklist

Supporting documentation ready for stack deployment"
```

### 3. Add Traefik Reverse Proxy

```bash
git add reverse-proxy/
git commit -m "feat(proxy): add Traefik reverse proxy with advanced features

- Docker Compose with Let's Encrypt and HTTPS redirect
- Complete environment variable configuration via .env
- Prometheus metrics integration
- Security headers, rate limiting, CORS middlewares
- TLS configuration (modern, strict, compatible profiles)
- Dynamic configuration support for advanced routing
- Comprehensive documentation with examples
- Health checks and monitoring endpoints

Enables secure, monitored routing for all technology stacks"
```

### 4. Add .NET Applications Stack

```bash
git add stacks/dotnet-app/
git commit -m "feat(dotnet): add .NET stack with complete environment variable support

- All configuration through single .env file
- No hardcoded paths, domains, or credentials
- Support for PostgreSQL, SQL Server, MySQL via profiles
- Comprehensive deployment script with validation
- Professional README with clear examples
- Enhanced backup/restore scripts with safety checks
- Advanced health check with detailed diagnostics
- Comprehensive troubleshooting guide
- JWT authentication and email support
- Resource limits configurable

Fully portable .NET application stack ready for production"
```

### 5. Add PHP Applications Stack

```bash
git add stacks/php-app/
git commit -m "feat(php): add PHP stack with multi-framework support

- Support for WordPress, Joomla, Drupal, Magento
- Symfony, Laravel, Zend Framework ready
- All configuration through single .env file
- Multi-database support (MySQL, PostgreSQL, MariaDB)
- PHP 8.3 with FPM and configurable extensions
- Composer, WP-CLI, Drush integration
- Redis and Memcached support for caching
- Comprehensive deployment script with framework detection
- Enhanced backup/restore with database and files
- Health checks for each framework type
- Professional README with framework-specific examples
- Troubleshooting guide for common PHP issues
- Resource limits and PHP-FPM tuning

Fully portable PHP application stack for multiple frameworks"
```

### 6. Add Monitoring Stack

```bash
git add stacks/monitoring/
git commit -m "feat(monitoring): add comprehensive monitoring stack

- Grafana for visualization and dashboards
- Prometheus for metrics collection and alerting
- cAdvisor for container metrics monitoring
- Node Exporter for host system metrics
- Blackbox Exporter for endpoint probing
- AlertManager for alert routing and notifications
- All configuration through single .env file
- Pre-configured dashboards for Docker, Traefik, databases
- Retention policies and storage optimization
- Email, Slack, and webhook alert integrations
- Security: internal network only, auth required
- Comprehensive deployment script with validation
- Enhanced backup for dashboards and configurations
- Health checks for all monitoring components
- Professional README with dashboard examples
- Troubleshooting guide for metrics and alerts
- Resource limits optimized for monitoring workload

Complete observability solution for infrastructure monitoring"
```

### 7. Add Static Sites & Frontend Stack

```bash
git add stacks/frontend-app/
git commit -m "feat(frontend): add static sites and modern frontend stack

- Support for static HTML, CSS, JavaScript
- React (Vite, CRA) with SSR capabilities
- Vue.js and Nuxt.js (SSR/SSG)
- Next.js with automatic optimization
- Node.js and Express.js applications
- Angular with production builds
- All configuration through single .env file
- Multi-site support with isolated environments
- Nginx-based serving with optimized configuration
- Build automation with CI/CD hooks
- Asset optimization and caching strategies
- Environment-specific builds (dev/staging/prod)
- Comprehensive deployment script with build detection
- Enhanced backup for source and built assets
- Health checks for all framework types
- Professional README with framework-specific guides
- Troubleshooting guide for build and runtime issues
- Resource limits and Nginx tuning
- Security headers and CSP configuration

Modern frontend deployment stack for all JavaScript frameworks"
```

### 8. Add Web Servers Stack

```bash
git add stacks/web-servers/
git commit -m "feat(webservers): add versatile web servers stack

- Nginx with advanced configuration profiles
- Apache2 with mod_rewrite and SSL support
- Tomcat for Java applications (versions 9, 10, 11)
- MailHog for email testing and development
- Caddy server with automatic HTTPS
- Lighttpd for lightweight serving
- All configuration through single .env file
- Virtual host support for multiple sites
- Custom SSL certificates and Let's Encrypt integration
- Proxy configurations for backend services
- Load balancing and failover support
- Access logs and error logs rotation
- Comprehensive deployment script with server selection
- Enhanced backup for configurations and logs
- Health checks for each web server type
- Professional README with use-case examples
- Troubleshooting guide for common web server issues
- Resource limits and performance tuning
- Security hardening (rate limiting, DDoS protection)

Complete web server solution for diverse hosting needs"
```

### 9. Add Automation Stack

```bash
git add stacks/automation/
git commit -m "feat(automation): add n8n workflow automation stack

- n8n for visual workflow automation
- PostgreSQL backend for workflow storage
- All configuration through single .env file
- Custom workflows directory for backup/restore
- Webhook support for external integrations
- Email, Slack, Discord, and API integrations
- Scheduled workflows and cron jobs
- Secure credential storage and encryption
- Comprehensive deployment script with validation
- Enhanced backup for workflows and credentials
- Health checks and workflow monitoring
- Professional README with workflow examples
- Troubleshooting guide for common automation issues
- Resource limits optimized for workflow execution
- Security: internal network, authentication required

Powerful automation platform for infrastructure orchestration"
```

### 10. Add Database Stack

```bash
git add stacks/databases/
git commit -m "feat(databases): add standalone database stack

- PostgreSQL (versions 14, 15, 16) with replication
- MySQL (versions 8.0, 8.3) with InnoDB tuning
- MariaDB (versions 10.x, 11.x) optimized
- MongoDB for NoSQL workloads
- Redis for caching and sessions
- All configuration through single .env file
- Automated backup with retention policies
- Point-in-time recovery support
- Replication and high availability setup
- Performance tuning and resource limits
- Connection pooling with PgBouncer/ProxySQL
- Comprehensive deployment script with database selection
- Enhanced backup/restore with encryption
- Health checks and replication monitoring
- Professional README with optimization guides
- Troubleshooting guide for database issues
- Migration scripts and utilities

Production-ready database infrastructure for all stacks"
```

### 11. Add CI/CD Integration

```bash
git add .github/ ci-cd/
git commit -m "feat(cicd): add CI/CD pipeline and automation

- GitHub Actions workflows for validation
- Automated .env template verification
- Docker Compose syntax validation
- Security scanning for vulnerabilities
- Automated documentation generation
- Pre-commit hooks for secret detection
- Deployment automation scripts
- Rollback procedures and safeguards
- All configuration through environment variables
- Professional README with pipeline documentation
- Troubleshooting guide for CI/CD issues

Automated infrastructure validation and deployment"
```

### 12. Add Backup & Disaster Recovery

```bash
git add backup-restore/
git commit -m "feat(backup): add centralized backup and disaster recovery

- Automated backup orchestration for all stacks
- Incremental and full backup strategies
- Off-site backup with encryption
- Backup verification and integrity checks
- Automated restore procedures with validation
- Point-in-time recovery capabilities
- Backup retention policies configurable
- All configuration through single .env file
- Comprehensive deployment script
- Health checks for backup systems
- Professional README with recovery procedures
- Troubleshooting guide for backup issues
- Resource limits and scheduling

Enterprise-grade backup solution for complete infrastructure"
```

### 13. Add Security & Hardening

```bash
git add security/
git commit -m "feat(security): add security hardening and compliance tools

- Automated security scanning with Trivy
- Fail2ban for intrusion prevention
- CrowdSec for collaborative security
- SSL/TLS certificate management automation
- Secret rotation procedures
- Security audit logging
- Compliance reporting (CIS, NIST)
- All configuration through single .env file
- Comprehensive deployment script
- Health checks for security services
- Professional README with security guides
- Troubleshooting guide for security issues
- Incident response procedures

Complete security infrastructure for production hardening"
```

### 14. Update Global Documentation

```bash
git add README.md ARCHITECTURE.md SECURITY.md docs/
git commit -m "docs(repo): update documentation with complete stack overview

- Update README with all deployed stacks
- Add comprehensive architecture documentation
- Security best practices and hardening guide
- Network architecture with all stacks integrated
- Performance tuning recommendations
- Disaster recovery procedures
- Complete troubleshooting index
- Stack interdependencies and communication flows
- Resource planning and capacity guide
- Migration procedures between environments

Complete infrastructure documentation for production deployment"
```

### 15. Final Polish & Production Readiness

```bash
git add scripts/ tools/ templates/
git commit -m "chore(repo): finalize infrastructure for production deployment

- Global helper scripts for common operations
- Infrastructure health check dashboard
- Environment migration tools
- Configuration templates for quick setup
- Comprehensive deployment checklist
- Production readiness validation script
- Performance benchmarking tools
- Update all README files with final status
- Add complete troubleshooting matrix
- Add glossary and terminology guide
- Add contribution guidelines
- Add changelog and versioning

Infrastructure ready for production deployment 🚀"
```

## Examples

### Good Commit Messages ✅

```
feat(frontend): add React and Next.js support

- Add Next.js SSR configuration
- Add React SPA hosting with Nginx
- Environment-based build configuration
- Automated build and deployment
- Health checks for frontend applications

Enables modern JavaScript framework deployment
```

```
fix(monitoring): correct Prometheus scrape configuration

Prometheus was unable to scrape Traefik metrics due to
incorrect target configuration. Updated prometheus.yml
to use correct service name and port.

Fixes #156
```

```
docs(php): add WordPress deployment guide

- Step-by-step WordPress installation
- WP-CLI usage examples
- Common plugin compatibility issues
- Performance optimization tips
```

### Bad Commit Messages ❌

```
# Too vague
update stuff

# Not imperative
Added new feature

# Too long subject (>72 chars)
feat(frontend): add complete frontend stack with React, Vue, Next.js, Nuxt, Angular and static HTML support

# Missing scope
fix: bug

# Capital letter and period
Fix(dotnet): Update configuration.

# Multiple unrelated changes
feat(dotnet): add Redis support and fix SSL and update docs
```

## Semantic Versioning

Use tags for releases:

```bash
# Major version (breaking changes)
git tag -a v2.0.0 -m "Release v2.0.0: Complete infrastructure rewrite

BREAKING CHANGES:
- All stacks now require .env configuration
- Removed hardcoded paths and credentials
- New deployment script interface
- Database migration required

Migration guide: See UPGRADE.md"

# Minor version (new features)
git tag -a v1.1.0 -m "Release v1.1.0: Add monitoring and frontend stacks

- Add Grafana + Prometheus monitoring
- Add React, Vue, Next.js support
- Add health check scripts
- Improve documentation"

# Patch version (bug fixes)
git tag -a v1.0.1 -m "Release v1.0.1: Fix SSL and backup issues

- Fix Let's Encrypt HTTP-01 challenge
- Fix backup script permissions
- Update Traefik configuration
- Improve error messages"

# Push tags
git push origin --tags
```

## Branch Strategy

### Main Branch

- Always deployable
- Protected branch
- Requires PR for changes
- All tests must pass

### Feature Branches

```bash
# Create feature branch
git checkout -b feat/add-redis-support

# Work on feature
git add stacks/databases/
git commit -m "feat(databases): add Redis caching support"

# Push to remote
git push origin feat/add-redis-support

# Create Pull Request
# After approval, merge to main
```

### Hotfix Branches

```bash
# Critical production fix
git checkout -b hotfix/fix-ssl-renewal

# Make fix
git add reverse-proxy/traefik/
git commit -m "fix(proxy): correct SSL certificate renewal

Critical fix for certificate expiration issue.
Updated ACME configuration to properly handle renewals.

Fixes #123"

# Push and merge immediately
git push origin hotfix/fix-ssl-renewal
```

## Commit Best Practices

### DO ✅

- **Atomic commits**: One logical change per commit
- **Test before commit**: Ensure everything works
- **Meaningful messages**: Explain what and why
- **Reference issues**: Use `Fixes #123` or `Closes #456`
- **Update docs**: Include documentation changes
- **Follow conventions**: Use types and scopes consistently
- **Sign commits**: Use GPG signing for security

### DON'T ❌

- **Commit secrets**: Never commit `.env` files or passwords
- **Mix changes**: Keep unrelated changes in separate commits
- **Vague messages**: "fix stuff" or "update" are not helpful
- **Large commits**: Break down into smaller logical commits
- **Skip tests**: Always verify functionality
- **Forget scope**: Always include appropriate scope
- **Commit commented code**: Remove dead code before commit

## Pre-Commit Checklist

Before every commit:

- [ ] No `.env` files included (`git status` to verify)
- [ ] No hardcoded secrets or credentials
- [ ] No commented-out code (unless documented)
- [ ] Scripts are executable (`chmod +x deploy.sh`)
- [ ] Documentation updated if needed
- [ ] Commit message follows convention
- [ ] Changes tested locally
- [ ] No merge conflicts
- [ ] `.gitignore` updated if new file types added
- [ ] All new files tracked (`git add` completed)

## Commit Message Template

Create `.gitmessage` in repository root:

```
<type>(<scope>): <subject>

# Why this change is necessary
<body>

# Issues, breaking changes, co-authors
<footer>

# ============================================================================
# Types: feat, fix, docs, chore, refactor, perf, test, style, ci, build
# 
# Scopes: repo, proxy, dotnet, php, frontend, webservers, monitoring,
#         automation, databases, security, backup, cicd, docs
#
# Subject: imperative mood, lowercase, no period, max 72 chars
# Body: what and why (not how), wrap at 72 chars
# Footer: Fixes #123, BREAKING CHANGE:, Co-authored-by:
# ============================================================================
#
# Example:
# feat(frontend): add Next.js SSR support
#
# - Add Next.js configuration with SSR
# - Add environment-based builds
# - Add deployment automation
# - Add health checks for Next.js apps
#
# Enables server-side rendering for improved SEO and performance
#
# Closes #234
# ============================================================================
```

Configure Git to use it:

```bash
git config commit.template .gitmessage
```

## Useful Git Commands

```bash
# View commit history with graph
git log --oneline --graph --all --decorate

# Search commits by message
git log --grep="fix" --oneline

# Search commits by author
git log --author="Your Name"

# Show changes in specific commit
git show <commit-hash>

# Show files changed in commit
git show --name-only <commit-hash>

# Amend last commit (change message or add files)
git commit --amend

# Interactive rebase (edit, squash, reorder commits)
git rebase -i HEAD~3

# View staged changes before commit
git diff --staged

# View unstaged changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - DANGEROUS!
git reset --hard HEAD~1

# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push specific tag
git push origin v1.0.0

# Push all tags
git push origin --tags

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0
```

## GPG Commit Signing (Recommended)

```bash
# Generate GPG key
gpg --full-generate-key

# List GPG keys
gpg --list-secret-keys --keyid-format=long

# Configure Git to use GPG key
git config --global user.signingkey YOUR_KEY_ID

# Sign commits by default
git config --global commit.gpgsign true

# Sign a specific commit
git commit -S -m "feat(dotnet): add secure feature"
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [GPG Signing](https://docs.github.com/en/authentication/managing-commit-signature-verification)

---

**Remember**: Good commit messages are a gift to your future self and your team! 🎁

Clean, consistent Git history makes:

- **Debugging easier**: Find when bugs were introduced
- **Code review faster**: Understand changes quickly
- **Releases smoother**: Generate changelogs automatically
- **Collaboration better**: Clear communication through history
