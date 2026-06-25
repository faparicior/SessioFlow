# 011-use-resend-for-email-communications

* **Status:** ⚠️ **SUPERSEDED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Superseded By:** ADR-011-01 (Resend Email with Optional Abstraction)
* **Amended By:** ADR-011-01

## Context and Problem Statement

SessioFlow requires an email delivery solution for:

1. **Magic Link Authentication**: Email-based login for organizers and speakers
2. **Automated Communications**: Status change notifications (submitted/accepted/rejected)
3. **Event Invitations**: Co-speaker invitation links
4. **Welcome Emails**: Onboarding new users to the platform

The Feature Brainstorming identified "Automate Speaker Communications" as a Must-have feature with the description: "Automatically send email updates to speakers when their status changes." This directly addresses Fernando's goal to "Reduce administrative overhead by 70%."

The User Journey Mapping shows email as a critical touchpoint:
- Journey 2: Andrea receives "Received" confirmation email after submission
- Journey 4: Andrea receives "Accepted" email with link to logistics dashboard

**Decision Drivers:**
- Must provide reliable email delivery for authentication and notifications
- Must support $0/month infrastructure constraint for MVP
- Must be easy to integrate with Next.js and Supabase
- Must deliver emails with high deliverability (avoid spam folders)
- Must provide basic analytics (delivery status, open rates)
- Must support templating for consistent communication design

## Considered Options

1. **Resend (Modern Email API for Developers)**
2. **SendGrid (Traditional Email Service)**
3. **Mailgun (Developer-Focused Email API)**
4. **Supabase Email (Built-in with Supabase Auth)**

## Decision Outcome

**Chosen Option:** "Resend (Modern Email API for Developers) + Supabase Auth for Magic Links"

**Justification:**
Resend combined with Supabase Auth provides the optimal balance of features, cost, and developer experience:

1. **Cost Compliance**: Resend free tier includes 100 emails/day (3,000/month), sufficient for MVP validation
2. **Developer Experience**: Clean API and excellent TypeScript support reduce integration time
3. **Deliverability**: Built on AWS SES infrastructure with optimized deliverability
4. **Supabase Integration**: Supabase handles magic link emails; Resend handles application emails
5. **MVP Timeline**: Simple integration with Next.js API Routes and React Email components

### Consequences

* **Positive:**
  - Clean, modern API with excellent TypeScript support
  - Beautiful default email templates with React component-based customization
  - Built-in analytics for tracking delivery and engagement
  - Reliable delivery through AWS SES infrastructure
  - Free tier sufficient for MVP (3,000 emails/month)

* **Negative:**
  - Vendor lock-in to Resend API
  - Limited customization compared to self-hosted solutions
  - Free tier has daily limits that may require upgrade for larger events
  - Less mature than SendGrid/Mailgun with fewer enterprise features

* **Risks:**
  - Email deliverability depends on proper domain configuration (SPF, DKIM)
  - Free tier limits may be reached with high-volume events
  - Template changes require code deployment (no visual editor)
  - Dependency on external service for critical authentication flow

### Pros and Cons of the Options

#### Option 1: Resend (Modern Email API for Developers)

* Good, because it provides a modern, developer-friendly API with excellent TypeScript support
* Good, because it includes React Email components for building beautiful, maintainable email templates
* Good, because it has built-in analytics for tracking delivery, opens, and clicks
* Good, because the free tier (100 emails/day) is sufficient for MVP validation
* Good, because it integrates well with Next.js and modern development workflows
* Bad, because it is a newer service with less enterprise maturity than SendGrid
* Bad, because it creates vendor lock-in to Resend's API
* Bad, because free tier limits may require upgrade for larger events

#### Option 2: SendGrid (Traditional Email Service)

* Good, because it is an established service with proven reliability and deliverability
* Good, because it provides extensive documentation and enterprise features
* Bad, because the free tier (100 emails/day) has similar limits but less modern developer experience
* Bad, because API is more complex and less TypeScript-friendly than Resend
* Bad, because template editor is less intuitive than React-based approach
* Bad, because it adds more configuration overhead for MVP timeline

#### Option 3: Mailgun (Developer-Focused Email API)

* Good, because it provides powerful API with extensive features for developers
* Good, because it offers good deliverability and detailed analytics
* Bad, because free tier is limited (5,000 emails/month for 3 months, then pay-per-use)
* Bad, because it has a steeper learning curve than Resend
* Bad, because pricing becomes expensive at scale compared to alternatives
* Bad, because it requires more setup and configuration for MVP

#### Option 4: Supabase Email (Built-in with Supabase Auth)

* Good, because it is integrated with Supabase Auth for magic links
* Good, because it requires no additional service configuration
* Bad, because it only handles authentication emails, not application emails
* Bad, because it has limited customization for email templates
* Bad, because it doesn't provide analytics for application communications
* Bad, because it doesn't address the "Automate Speaker Communications" feature requirement

## Email Strategy

### Supabase Auth Emails
- Magic link authentication
- Email confirmation
- Password reset (if needed)

### Resend Application Emails
- Proposal submission confirmation
- Acceptance/rejection notifications
- Co-speaker invitations
- Event updates and announcements

### Email Templates
- Built with React Email components
- Consistent branding across all communications
- Mobile-responsive design
- Plain text fallback for accessibility

## Links

* [Resend Documentation](https://resend.com/docs)
* [Feature: Automate Speaker Communications](../inception/5-brainstorming.md#core-features)
* [User Journey 2: Email Confirmation](../inception/6-user-journey-mapping.md#journey-2-submitting-a-talk-andrea)
* [User Journey 4: Acceptance Email](../inception/6-user-journey-mapping.md#journey-4-acceptance--logistics)
