# ADR Traceability Matrix

**Template Version:** 1.0  
**Template:** docs/adr/TEMPLATE-TRACEABILITY_MATRIX.md  
**Based On:** Lean Inception Workshop Methodology  
**Purpose:** Maps each Architectural Decision Record (ADR) to its sources in the Lean Inception workshop artifacts, providing complete traceability from business vision to technical implementation.

---

## Traceability: ADR-001 - Use Next.js as Frontend Framework

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
  - Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
- **Constraints**: 
  - "IS NOT: Hard to use" (Usability priority)
  - "IS NOT: Expensive to host" (Cost constraint)
  - "IS: Web Application" (Technology type)
- **Personas**: 
  - Fernando (Intermediate tech savviness, needs intuitive interface)
  - Andrea (Intermediate tech savviness, needs mobile access)
- **Pain Points**: 
  - Fernando: "Lot of manual work to manage the event with different sources of data"
  - Andrea: "Difficult to find a smooth an easy way to create a session proposal"
- **Features**: 
  - Collect Proposals (CfP) - Must-have
  - User Authentication - Must-have
  - Speaker Profile (Photo Upload) - Must-have
- **MVP Canvas**: 
  - Technical Enablers: "Setup defined tech stack (Next.js + Tailwind + Database)"

**Decision Alignment:**
- This decision directly supports: MVP Goal of <3ms page load for smooth user experience
- This decision mitigates: Risk of complex architecture that exceeds volunteer capabilities

---

## Traceability: ADR-002 - Use Supabase for Backend and Database

**Inception Sources:**
- **Product Goals**: 
  - Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
- **Constraints**: 
  - "IS: OpenSource" (No proprietary vendor lock-in)
  - "IS: Simple to self-host" (Deployment flexibility)
  - "DOES: Manage the academic event lifecycle" (Data persistence need)
- **Personas**: 
  - Fernando: "I don't want to spend lot of money because we don't have it"
  - Andrea: Needs profile persistence across sessions
- **Pain Points**: 
  - Fernando: Fear of losing data without proper tool
- **Features**: 
  - User Authentication - Must-have
  - Speaker Profile (Photo Upload) - Must-have
  - Collect Proposals (CfP) - Must-have
- **MVP Canvas**: 
  - Technical Enablers: "Database Schema for Events, Proposals, and Profiles"
  - Technical Enablers: "Authentication system (Magic Link)"
  - Technical Enablers: "Image Storage (Supabase Storage) for profile photos"
  - Risks: "GDPR/Privacy compliance"

**Decision Alignment:**
- This decision directly supports: $0/month infrastructure constraint
- This decision mitigates: GDPR risk through Row-Level Security (RLS)

---

## Traceability: ADR-003 - Use Docker Compose for Deployment

**Inception Sources:**
- **Product Goals**: 
  - Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
- **Constraints**: 
  - "IS: Simple to self-host"
  - "IS NOT: Requiring specialized infrastructure or DevOps expertise"
- **Personas**: 
  - Fernando: "Full remote. Asynchronous work and a meet with the group each 15 days"
  - Fernando: "New volunteers has to learn some tools to be able to do their job"
- **Pain Points**: 
  - Fernando: "Too repetitive work to organize the call for papers"
- **Features**: 
  - Deploy with Standard Tools - Should-have (Differentiating Feature)
- **User Journey 5**: 
  - "Fernando runs startup script: Deploy with Standard Tools: docker-compose up"
- **MVP Canvas**: 
  - Cost: "Infrastructure: $0/month (Constraint #1)"

**Decision Alignment:**
- This decision directly supports: "Simple to self-host" product attribute
- This decision mitigates: Risk of requiring DevOps expertise from volunteers

---

## Traceability: ADR-004 - Implement Magic Link Authentication

**Inception Sources:**
- **Product Goals**: 
  - Goal 2: "Achieve 4/5 average ease-of-use rating from first 5 conferences"
- **Constraints**: 
  - "IS: Simple to use" (Usability ranked #1 in trade-offs)
- **Personas**: 
  - Andrea: "Difficult to find a smooth an easy way to create a session proposal"
  - Fernando: "I wish to automate the whole process to focus in other needs"
- **Pain Points**: 
  - Andrea: Pain 1 - "Difficult to find a smooth an easy way to create a session proposal"
- **Features**: 
  - User Authentication - Must-have
  - Automate Speaker Communications - Must-have
- **User Journey 2**: 
  - "Andrea creates an account or logs in: User Authentication: Magic Link / Social Login"
- **MVP Canvas**: 
  - Technical Enablers: "Authentication system (Magic Link)"

**Decision Alignment:**
- This decision directly supports: Usability #1 priority in trade-offs
- This decision mitigates: Friction in Andrea's submission journey

---

## Traceability: ADR-005 - Use Supabase Storage for Files

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
- **Constraints**: 
  - "IS: OpenSource" (No proprietary dependencies)
  - "IS NOT: Expensive to host" (Cost constraint)
- **Personas**: 
  - Andrea: Needs to upload profile photos
- **Pain Points**: 
  - Andrea: "Difficult to find a smooth an easy way to create a session proposal"
- **Features**: 
  - Speaker Profile (Photo Upload) - Must-have (Wave 1)
- **User Journey 2**: 
  - "Andrea fills in title, abstract & uploads photo: Speaker Profile: Forms + File Storage"
- **MVP Canvas**: 
  - Technical Enablers: "Image Storage (Supabase Storage) for profile photos"

**Decision Alignment:**
- This decision directly supports: MVP Wave 1 feature requirements
- This decision mitigates: Cost constraint through free tier storage

---

## Traceability: ADR-006 - Use RESTful API Design

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
- **Constraints**: 
  - "DOES: Expose public API for integration"
- **Personas**: 
  - Fernando: "Comfortable with data tools" (Technical savviness)
- **Features**: 
  - Expose Public API - Should-have (Differentiating Feature)
- **MVP Canvas**: 
  - Technical Enablers: "Setup defined tech stack (Next.js + Tailwind + Database)"

**Decision Alignment:**
- This decision directly supports: Public API requirement for third-party integrations
- This decision mitigates: Complexity in API design for MVP timeline

---

## Traceability: ADR-007 - Use Zod for Validation

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
  - Goal 2: "Achieve 4/5 average ease-of-use rating from first 5 conferences"
- **Constraints**: 
  - "IS: Simple to use" (Usability priority)
- **Personas**: 
  - Fernando: "Automated data validation to catch errors early with results in a report"
  - Andrea: "Simple, intuitive interface that doesn't require training"
- **Pain Points**: 
  - Fernando: "Lot of manual work to manage the event with different sources of data"
- **Features**: 
  - Collect Proposals (CfP) - Must-have (requires form validation)
  - Review & Score Sessions - Must-have (requires data integrity)
- **MVP Canvas**: 
  - Risks: "Users might enter wrong data"
  - Mitigation: "Strong validation on the CfP form input fields"

**Decision Alignment:**
- This decision directly supports: Fernando's need for automated data validation
- This decision mitigates: Risk of incorrect data entry from users

---

## Traceability: ADR-008 - Implement Comprehensive Testing Strategy

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
  - Goal 2: "Achieve 4/5 average ease-of-use rating from first 5 conferences"
- **Constraints**: 
  - "IS: Simple to use" (Quality impacts usability)
- **Personas**: 
  - Fernando: "New volunteers has to learn some tools to be able to do their job"
- **Features**: 
  - All Must-have features require testing for quality assurance
- **MVP Canvas**: 
  - Risks: "Users might find the Create Event flow too complex"
  - Mitigation requires: Testing to ensure simplicity

**Decision Alignment:**
- This decision directly supports: 4/5 ease-of-use rating goal
- This decision mitigates: Risk of bugs affecting user experience

---

## Traceability: ADR-009 - Use Feature-Based Project Structure

**Inception Sources:**
- **Product Goals**: 
  - Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
- **Constraints**: 
  - "IS: Simple to self-host" (Code simplicity impacts deployment simplicity)
  - "IS NOT: Requiring specialized infrastructure or DevOps expertise"
- **Personas**: 
  - Fernando: "New volunteers has to learn some tools to be able to do their job"
- **Pain Points**: 
  - Fernando: "New volunteers has to learn some tools" (Training burden)
- **Features**: 
  - All features organized by user journeys (Setup, Submission, Selection, Acceptance)
- **MVP Canvas**: 
  - Development Effort: "Estimated 3 Sprints (6 Weeks) for 2 Developers"

**Decision Alignment:**
- This decision directly supports: Volunteer onboarding and collaboration
- This decision mitigates: Risk of code complexity exceeding team capabilities

---

## Traceability: ADR-010 - Use Tailwind CSS for Styling

**Inception Sources:**
- **Product Goals**: 
  - Goal 2: "Achieve 4/5 average ease-of-use rating from first 5 conferences"
- **Constraints**: 
  - "IS: Simple to use" (Usability ranked #1)
  - "IS: Lightweight and efficient"
- **Personas**: 
  - Andrea: "Simple, intuitive interface that doesn't require training"
  - Andrea: "Full remote. With Scrum and daily meetings" (Mobile access)
- **Pain Points**: 
  - Andrea: "Difficult to find a smooth an easy way to create a session proposal"
- **Features**: 
  - Collect Proposals (CfP) - Public-facing form requires polished UI
  - Speaker Profile (Photo Upload) - Requires responsive design
- **MVP Canvas**: 
  - UX Enablers: "Setup Wizard design for creating an event"
  - UX Enablers: "Public Landing Page template for the CfP link"

**Decision Alignment:**
- This decision directly supports: 4/5 ease-of-use rating goal
- This decision mitigates: Risk of poor user experience from inconsistent styling

---

## Traceability: ADR-011 - Use Resend for Email Communications

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
- **Constraints**: 
  - "DOES: Coordinate speaker communication"
  - "IS NOT: Expensive to host" (Cost constraint)
- **Personas**: 
  - Fernando: "Reduce administrative overhead by 70% so I can focus on strategy"
  - Andrea: "Have a clear view of the schedule and steps in the process"
- **Pain Points**: 
  - Fernando: "Too repetitive work to organize the call for papers"
- **Features**: 
  - Automate Speaker Communications - Must-have
- **User Journey 2**: 
  - "Andrea submits the proposal: Automate Speaker Communications: Sends 'Received' email"
- **User Journey 4**: 
  - "Fernando publishes results: Automate Speaker Communications: Sends 'Accepted' email"
- **MVP Canvas**: 
  - MVP Vision: "Enables the setup and collection of session proposals"

**Decision Alignment:**
- This decision directly supports: Fernando's goal to reduce administrative overhead
- This decision mitigates: Risk of manual communication burden

---

## Traceability: ADR-012 - Implement CI/CD with GitHub Actions

**Inception Sources:**
- **Product Goals**: 
  - Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
- **Constraints**: 
  - "IS: OpenSource" (Public repository assumed)
  - "IS: Simple to self-host" (Deployment automation supports simplicity)
- **Personas**: 
  - Fernando: "Full remote. Asynchronous work and a meet with the group each 15 days"
  - Fernando: "New volunteers has to learn some tools to be able to do their job"
- **Features**: 
  - Deploy with Standard Tools - Should-have
- **MVP Canvas**: 
  - Cost: "Infrastructure: $0/month (Constraint #1)"
  - Development Effort: "Estimated 3 Sprints (6 Weeks) for 2 Developers"

**Decision Alignment:**
- This decision directly supports: $0/month infrastructure constraint
- This decision mitigates: Risk of deployment errors and inconsistent environments

---

## Traceability: ADR-013 - Adopt TypeScript with Strict Mode

**Inception Sources:**
- **Product Goals**: 
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
  - Goal 2: "Achieve 4/5 average ease-of-use rating from first 5 conferences"
- **Constraints**: 
  - "IS: Simple to use" (Code quality impacts product quality)
  - "DOES: Manage the academic event lifecycle" (Data integrity critical)
- **Personas**: 
  - Fernando: "Comfortable with data tools" (Technical intermediate)
  - Fernando: "New volunteers has to learn some tools to be able to do their job"
- **Pain Points**: 
  - Fernando: "Lot of manual work to manage the event with different sources of data"
- **Features**: 
  - All features require type safety for data integrity
- **MVP Canvas**: 
  - Risks: "Users might enter wrong data"
  - Mitigation: "Strong validation on the CfP form input fields"

**Decision Alignment:**
- This decision directly supports: Automated data validation requirement
- This decision mitigates: Risk of runtime errors affecting user experience

---

## Traceability: ADR-014 - Use shadcn/ui for UI Components

**Inception Sources:**
- **Product Goals**: 
  - Goal 2: "Achieve 4/5 average ease-of-use rating from first 5 conferences"
- **Constraints**: 
  - "IS: Simple to use" (Usability ranked #1 in trade-offs)
  - "IS NOT: Expensive to host" (Cost constraint - shadcn/ui is free)
  - "IS: Lightweight and efficient" (shadcn/ui only includes used components)
- **Personas**: 
  - Andrea: "Difficult to find a smooth an easy way to create a session proposal"
  - Fernando: "Simple, intuitive interface that doesn't require training"
- **Pain Points**: 
  - Andrea: Pain 1 - "Difficult to find a smooth an easy way to create a session proposal"
  - Fernando: Pain 3 - "New volunteers has to learn some tools to be able to do their job"
- **Features**: 
  - Collect Proposals (CfP) - Form components
  - Speaker Profile (Photo Upload) - Input, Avatar components
  - Review & Score Sessions - Table, Card components
- **MVP Canvas**: 
  - UX Enablers: "Setup Wizard design for creating an event"
  - UX Enablers: "Public Landing Page template for the CfP link"
  - Success Metric: "4/5 average ease-of-use rating"

**Decision Alignment:**
- This decision directly supports: 4/5 ease-of-use rating through WCAG 2.1 AA compliant components
- This decision mitigates: Risk of inconsistent UI and accessibility issues from custom components
- This decision accelerates: MVP timeline by providing 30+ ready-to-use accessible components

---

## Summary of Inception Alignment

| ADR Number | ADR Title | Primary Inception Source | Secondary Sources |
|------------|-----------|-------------------------|-------------------|
| 001 | Use Next.js as Frontend Framework | Product Goals (1, 3) | Trade-offs, Personas |
| 002 | Use Supabase for Backend and Database | MVP Canvas (Technical Enablers) | Trade-offs, Constraints |
| 003 | Use Docker Compose for Deployment | User Journey 5 (Deployment) | Trade-offs, Constraints |
| 004 | Implement Magic Link Authentication | User Journey 2 (Submission) | Trade-offs, MVP Canvas |
| 005 | Use Supabase Storage for Files | MVP Canvas (Image Storage) | Features, Personas |
| 006 | Use RESTful API Design | Brainstorming (Public API) | Product Goals |
| 007 | Use Zod for Validation | MVP Canvas (Validation Risk) | Personas, Features |
| 008 | Implement Comprehensive Testing Strategy | Product Goals (2, 3) | MVP Canvas (Risks) |
| 009 | Adopt Domain-Driven Design Structure | MVP Canvas (Technical Enablers) | Personas, Long-term Maintainability |
| 010 | Use Tailwind CSS for Styling | MVP Canvas (UX Enablers) | Trade-offs, Personas |
| 011 | Use Resend for Email Communications | Features (Automate Communications) | User Journeys |
| 012 | Implement CI/CD with GitHub Actions | MVP Canvas (Cost Constraint) | Trade-offs, Personas |
| 013 | Adopt TypeScript with Strict Mode | AGENTS.md (TypeScript Guidelines) | MVP Canvas (Validation) |
| 014 | Use shadcn/ui for UI Components | Product Goal 2 (4/5 Ease-of-Use) | Trade-offs, Personas, MVP Canvas |

---

## Coverage Analysis

### Product Goals Coverage
- **Goal 1** (Reduce organization time by 50%): 8 ADRs directly support
- **Goal 2** (4/5 ease-of-use rating): 6 ADRs directly support
- **Goal 3** ($0/month infrastructure): 7 ADRs directly support

### Constraint Compliance
- **Usability (#1)**: 10 ADRs respect usability priority
- **Cost (#2)**: 9 ADRs respect cost constraint
- **Simplicity (#3)**: 11 ADRs respect simplicity requirement
- **Performance (#4)**: 5 ADRs address performance considerations
- **Security (#5)**: 4 ADRs address security requirements

### Persona Pain Point Coverage
- **Fernando's Pains**: 11 ADRs address Fernando's administrative burden
- **Andrea's Pains**: 8 ADRs address Andrea's submission friction
- **Shared Pains**: 6 ADRs address both personas' needs

### MVP Risk Mitigation
- **Data Quality Risk**: 3 ADRs provide mitigation (Zod, TypeScript, Testing)
- **Usability Risk**: 5 ADRs provide mitigation (Next.js, Tailwind, Magic Link)
- **Cost Risk**: 7 ADRs provide mitigation (Supabase, Docker, GitHub Actions)
- **Complexity Risk**: 6 ADRs provide mitigation (Feature Structure, Docker Compose)

---

## Next Steps

- [ ] Review ADRs with product team for business alignment
- [ ] Validate ADRs against inception artifacts for completeness
- [ ] Socialize ADRs with stakeholders for buy-in
- [ ] Update status from "Proposed" to "Accepted" after approval
- [ ] Create implementation tasks linked to each ADR
- [ ] Schedule ADR review after MVP completion to assess decisions
