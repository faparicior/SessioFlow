# 004-implement-magic-link-authentication

* **Status:** ⚠️ **SUPERSEDED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Superseded By:** ADR-004-01 (Magic Link Authentication with DDD Abstraction)
* **Amended By:** ADR-004-01

## Context and Problem Statement

SessioFlow requires an authentication system that serves two distinct user types:

1. **Fernando (Organizer)**: Needs secure admin access to create events, review submissions, and manage schedules
2. **Andrea (Speaker)**: Needs simple account creation to submit proposals and access event information

The User Journey Mapping reveals critical authentication touchpoints:
- Journey 2: Andrea must "create an account or log in" before submitting a proposal
- Journey 3: Fernando must authenticate with "Authorized Admin" role check
- Both personas need to remember their submissions and status across sessions

The Trade-offs document ranks Security #5 (a hygiene factor, not a differentiator), emphasizing that "standard framework security features" are sufficient. The MVP must balance security with Usability (ranked #1)—authentication should not create friction that prevents Andrea from submitting proposals.

**Decision Drivers:**
- Must minimize friction for speakers submitting proposals (Usability ranked #1)
- Must support role-based access control (organizer vs. speaker)
- Must be implementable within 6-week MVP timeline
- Must work within $0/month infrastructure constraint
- Must support GDPR compliance for speaker data (MVP Canvas risk)
- Must accommodate users who may not remember passwords or create accounts frequently

## Considered Options

1. **Magic Link Authentication (Passwordless Email Links)**
2. **Traditional Username/Password with Hashing**
3. **Social Login (OAuth: Google, GitHub, etc.)**
4. **Hybrid: Magic Link + Social Login**

## Decision Outcome

**Chosen Option:** "Hybrid: Magic Link + Social Login"

**Justification:**
The hybrid approach provides the optimal balance of usability, security, and implementation complexity:

1. **Usability Priority**: Magic links eliminate password creation and recovery friction, directly supporting the #1 trade-off priority (Usability). Andrea can submit proposals without remembering credentials
2. **Security Baseline**: Meets the #5 ranked Security requirement through Supabase's built-in authentication with encrypted tokens, avoiding custom security implementation
3. **User Preference**: Social login accommodates users who prefer quick sign-in with existing accounts (especially developers familiar with GitHub/Google)
4. **MVP Timeline**: Supabase Auth provides both magic link and OAuth out of the box, requiring minimal custom code
5. **GDPR Compliance**: Supabase handles data protection requirements, reducing legal risk for speaker information

### Consequences

* **Positive:**
  - Eliminates password reset support requests, reducing organizer overhead
  - Reduces barrier to entry for first-time speakers (Andrea's Pain 1: "Difficult to find a smooth way to create a session proposal")
  - Social login provides faster onboarding for tech-savvy users
  - Supabase Auth includes built-in rate limiting and security features
  - Email verification ensures valid contact information for communications

* **Negative:**
  - Magic links require email delivery, creating dependency on email service reliability
  - Social login adds configuration complexity for each provider
  - Users without email access cannot authenticate (edge case)
  - Magic links expire, requiring re-request if not used promptly

* **Risks:**
  - Email deliverability issues could prevent account creation (spam filters, etc.)
  - Social provider API changes could break authentication flow
  - GDPR requires explicit consent for data processing via email
  - Magic links sent to compromised email accounts create security vulnerability

### Pros and Cons of the Options

#### Option 1: Magic Link Authentication (Passwordless Email Links)

* Good, because it eliminates password management entirely, reducing user friction
* Good, because it reduces security surface area (no password database to hack)
* Good, because it provides email verification by default, ensuring valid contact information
* Good, because it aligns with Andrea's need for a "smooth an easy way to create a session proposal"
* Bad, because it requires reliable email delivery infrastructure
* Bad, because some users are uncomfortable clicking links from unknown senders
* Bad, because it doesn't support multi-device simultaneous sessions as intuitively as passwords

#### Option 2: Traditional Username/Password with Hashing

* Good, because it is familiar to all users with established mental models
* Good, because it works without email delivery dependencies
* Bad, because password recovery creates support overhead for volunteers
* Bad, because users frequently forget passwords or reuse weak passwords
* Bad, because it requires custom implementation of secure password hashing and storage
* Bad, because it adds friction that could prevent Andrea from completing submission (Usability impact)

#### Option 3: Social Login (OAuth: Google, GitHub, etc.)

* Good, because it provides one-click authentication for users with existing accounts
* Good, because it reduces registration friction significantly
* Bad, because it requires managing multiple provider credentials and configurations
* Bad, because it creates dependency on third-party services (vendor lock-in)
* Bad, because it doesn't work for users without social media accounts
* Bad, because GDPR requires explicit consent for data sharing with providers

#### Option 4: Hybrid: Magic Link + Social Login

* Good, because it provides multiple authentication paths, accommodating different user preferences
* Good, because it maximizes conversion rate by reducing friction for all user types
* Good, because Supabase Auth supports both methods with minimal configuration
* Good, because it supports the MVP goal of 80% completion rate for proposal submissions
* Bad, because it requires maintaining two authentication flows
* Bad, because it adds slight complexity to the authentication UI
* Bad, because it increases testing surface (both flows must work correctly)

## Links

* [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
* [User Journey 2: Submitting a Talk](../inception/6-user-journey-mapping.md#journey-2-submitting-a-talk-andrea)
* [MVP Canvas - Technical Enablers](../inception/8-mvp-canvas-definition.md#6-technical--ux-enablers)
* [Persona: Andrea - Pain Points](../inception/3-personas.md#persona-name-andrea-the-experienced-speaker)
