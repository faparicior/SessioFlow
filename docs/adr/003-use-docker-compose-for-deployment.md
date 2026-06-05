# 003-use-docker-compose-for-deployment

* **Status:** Proposed
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow must be deployable by volunteer organizers (like Fernando) who have intermediate technical skills but no dedicated DevOps team. The product explicitly states it "IS Self-hostable" and "IS NOT requiring specialized infrastructure or DevOps expertise."

Fernando's persona reveals critical constraints:
- Works remotely with volunteers who meet only every 15 days
- Needs to reduce administrative overhead by 70%
- Has limited budget ("I don't want to spend lot of money because we don't have it")
- Comfortable with data tools but not with complex infrastructure

The MVP Canvas identifies "Deploy with Standard Tools" as a Should-have feature with Docker Compose as the implementation approach. This decision must balance self-hosting capability with the $0/month infrastructure constraint.

**Decision Drivers:**
- Must enable deployment by non-DevOps personnel (Simplicity ranked #3 in trade-offs)
- Must work on minimal infrastructure (single VPS or even Raspberry Pi)
- Must support the $0/month cost constraint (can run on free-tier VPS or existing hardware)
- Must provide consistent environment across development, staging, and production
- Must allow easy updates and maintenance by volunteers
- Must support both cloud deployment (Vercel) and self-hosting paths

## Considered Options

1. **Docker Compose (Single-Host Deployment)**
2. **Kubernetes (k8s) Cluster**
3. **Platform-as-a-Service (Vercel, Railway, Render)**
4. **Traditional LAMP/MEAN Stack Installation**

## Decision Outcome

**Chosen Option:** "Docker Compose (Single-Host Deployment)"

**Justification:**
Docker Compose is the only option that satisfies all constraints simultaneously:

1. **Simplicity**: Single YAML file defines entire stack (web app, database, storage). Fernando can deploy with `docker-compose up -d`—no Kubernetes expertise required
2. **Cost**: Runs on any Linux VPS ($5/month) or existing hardware, respecting the $0/month constraint when using free-tier hosting
3. **Self-Hosting**: Meets the "IS Simple to self-host" product requirement better than Kubernetes (overkill) or PaaS (vendor lock-in)
4. **Maintainability**: Volunteers can update by pulling new images and restarting containers—no complex orchestration
5. **MVP Alignment**: Matches the "Deploy with Standard Tools" feature from the MVP Canvas with appropriate complexity level

### Consequences

* **Positive:**
  - One-command deployment reduces onboarding time for new volunteer maintainers
  - Consistent environment eliminates "works on my machine" problems
  - Easy to backup: just copy the data volume directory
  - Can run on minimal hardware (2GB RAM VPS sufficient for MVP)
  - Community support: Docker Compose is industry standard with extensive documentation

* **Negative:**
  - Single point of failure: if the host goes down, entire application is unavailable
  - Manual scaling requires manual intervention (no auto-scaling like Kubernetes)
  - Health checks and monitoring require additional configuration
  - Database backups must be scripted separately

* **Risks:**
  - Volunteers may lack Docker knowledge, creating dependency on technical contributors
  - Security updates require manual container image updates
  - Data persistence requires careful volume management to prevent loss
  - Limited load balancing capabilities for high-traffic events

### Pros and Cons of the Options

#### Option 1: Docker Compose (Single-Host Deployment)

* Good, because it provides a simple, declarative way to define multi-container applications
* Good, because it requires minimal resources (can run on $5/month VPS or free-tier services)
* Good, because it is widely understood and documented, reducing support burden on volunteers
* Good, because it enables both cloud and on-premises deployment with the same configuration
* Bad, because it does not provide automatic failover or high availability
* Bad, because scaling beyond a single host requires manual reconfiguration

#### Option 2: Kubernetes (k8s) Cluster

* Good, because it provides automatic scaling, self-healing, and high availability
* Good, because it is industry standard for large-scale deployments
* Bad, because it requires significant DevOps expertise that volunteers don't have
* Bad, because it requires more resources (minimum 4GB RAM, multiple nodes for HA)
* Bad, because it exceeds the "IS NOT requiring specialized infrastructure" constraint
* Bad, because complexity would overwhelm the 6-week MVP timeline

#### Option 3: Platform-as-a-Service (Vercel, Railway, Render)

* Good, because it provides zero-config deployment with automatic HTTPS
* Good, because it eliminates infrastructure management entirely
* Bad, because it creates vendor lock-in and limits self-hosting capability
* Bad, because costs scale with usage, potentially exceeding $0/month constraint
* Bad, because it reduces control over environment and data residency
* Good for MVP, but Bad for long-term self-hosting goal

#### Option 4: Traditional LAMP/MEAN Stack Installation

* Good, because it uses familiar technologies (Apache, MySQL, Node.js)
* Good, because it doesn't require container knowledge
* Bad, because setup is error-prone and environment-specific
* Bad, because updates require manual package management and dependency resolution
* Bad, because it lacks the portability and consistency of containerization
* Bad, because it increases the "new volunteer training" burden (Fernando's Pain 3)

## Links

* [Docker Compose Documentation](https://docs.docker.com/compose/)
* [Feature: Deploy with Standard Tools](../inception/5-brainstorming.md#differentiating-features)
* [User Journey 5: Deployment](../inception/6-user-journey-mapping.md#journey-5-deployment-fernando)
* [Trade-offs - Simplicity Constraint](../inception/2-tradeoffs.md#3-consensus-reasoning)
