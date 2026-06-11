# 011-Resend Email Amendment: Optional Abstraction

* **Status:** Proposed Amendment (Optional)
* **Date:** 2026-06-11
* **Decision Makers:** Product Team, Technical Lead
* **Amends:** ADR-011 (Use Resend for Email Communications)
* **Related:** ADR-002b (Authentication Strategy and Vendor Abstraction), ADR-009 (Domain-Driven Design Structure)

---

## Purpose of This Amendment

This document proposes an **optional amendment** to ADR-011 to incorporate the DDD abstraction pattern established in ADR-002b. Unlike authentication and storage, email abstraction is **optional** for MVP but recommended for long-term flexibility.

---

## Context: Email Abstraction Consideration

### Original ADR-011 Decision

The original ADR-011 selected Resend for email communications with:
- Direct Resend API integration
- Supabase Auth handling magic link emails
- Resend handling application emails (notifications, invitations)

### Email Abstraction Analysis

**Why Email Abstraction is Optional:**

1. **Lower Migration Risk**: Email providers rarely change pricing dramatically
2. **Standardized Protocols**: SMTP/API patterns are similar across providers
3. **Lower Priority**: Email is less critical than auth/storage for vendor independence
4. **MVP Timeline**: Can defer abstraction until needed

**Why Email Abstraction is Recommended:**

1. **Consistency**: Same pattern as auth and storage abstractions
2. **Vendor Flexibility**: Can swap if Resend pricing changes
3. **A/B Testing**: Can test different email providers
4. **Minimal Overhead**: Interface is simple, low implementation cost

---

## Recommended Approach: Deferred Abstraction

### Decision: Implement Abstraction Later if Needed

**Recommended Strategy:**
1. **MVP Phase**: Use Resend directly (as in original ADR-011)
2. **Post-MVP**: Evaluate if abstraction is needed based on:
   - Resend pricing changes
   - Volume growth requiring different provider
   - Need for A/B testing email providers

**Rationale:**
- Email abstraction adds ~10 hours of initial development
- Can be added later with minimal cost (~15 hours)
- Lower priority than auth/storage abstractions
- Resend free tier (100 emails/day) sufficient for MVP

---

## Optional Implementation Pattern (If Decided)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Application Layer (Use Cases)                          │
│  - SendWelcomeEmailUseCase                              │
│  - SendProposalNotificationUseCase                      │
│  - SendStatusUpdateUseCase                              │
│  - Depends only on: IEmailProvider interface            │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ depends on abstraction
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Domain Layer (Port)                                      │
│  - IEmailProvider interface                               │
│  - Email message (To, From, Subject, Body, Attachments)  │
│  - EmailResult (sentAt, messageId)                        │
└────────────────────────┬─────────────────────────────────┘
                         │ implemented by
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Infrastructure Layer (Adapters)                          │
│  - ResendEmailAdapter (current)                           │
│  - SendGridEmailAdapter (future option)                   │
│  - MailgunEmailAdapter (future option)                    │
│  - SmtpEmailAdapter (self-hosted option)                  │
└─────────────────────────────────────────────────────────┘
```

### Domain Interface (Port)

```typescript
// domains/email/repositories/email-provider.ts
export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface EmailMessage {
  to: EmailAddress[];
  from: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  replyTo?: EmailAddress;
}

export interface EmailSendResult {
  messageId: string;
  sentAt: Date;
  status: 'sent' | 'queued' | 'failed';
}

export interface EmailProvider {
  /**
   * Send an email message
   */
  send(message: EmailMessage): Promise<EmailSendResult>;
  
  /**
   * Send a templated email
   */
  sendTemplate(
    templateId: string,
    recipients: EmailAddress[],
    data: Record<string, any>
  ): Promise<EmailSendResult>;
  
  /**
   * Get email delivery status
   */
  getStatus(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'bounced' | 'failed';
    deliveredAt?: Date;
    error?: string;
  }>;
}
```

### Resend Email Adapter

```typescript
// infrastructure/external/resend-email-adapter.ts
import { 
  IEmailProvider, 
  EmailMessage,
  EmailSendResult,
  EmailAddress,
  EmailAttachment 
} from '@/domains/email/repositories/i-email-provider';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class ResendEmailAdapter implements EmailProvider {
  async send(message: EmailMessage): Promise<EmailSendResult> {
    const to = message.to.map(addr => ({
      email: addr.email,
      name: addr.name
    }));
    
    const from = {
      email: message.from.email,
      name: message.from.name || 'SessioFlow'
    };
    
    const attachments = message.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType
    }));
    
    const { data, error } = await resend.emails.send({
      from: `${from.name} <${from.email}>`,
      to: to.map(addr => addr.email),
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments,
      reply_to: message.replyTo?.email
    });
    
    if (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }
    
    return {
      messageId: data.id,
      sentAt: new Date(),
      status: 'sent'
    };
  }
  
  async sendTemplate(
    templateId: string,
    recipients: EmailAddress[],
    data: Record<string, any>
  ): Promise<EmailSendResult> {
    // Resend doesn't have native templates, implement with React Email
    // or use a separate template engine
    const html = await this.renderTemplate(templateId, data);
    
    return this.send({
      to: recipients,
      from: { email: 'noreply@sessioflow.app', name: 'SessioFlow' },
      subject: this.getSubjectFromTemplate(templateId, data),
      html
    });
  }
  
  async getStatus(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'bounced' | 'failed';
    deliveredAt?: Date;
    error?: string;
  }> {
    // Resend API provides email events for tracking
    const events = await resend.emails.get(messageId);
    
    const lastEvent = events.data?.events[events.data.events.length - 1];
    
    return {
      status: lastEvent?.type === 'email.delivered' ? 'delivered' : 'sent',
      deliveredAt: lastEvent?.created_at ? new Date(lastEvent.created_at) : undefined
    };
  }
  
  private async renderTemplate(
    templateId: string, 
    data: Record<string, any>
  ): Promise<string> {
    // Use React Email or Handlebars for template rendering
    // Implementation depends on template system chosen
    throw new Error('Template rendering not implemented');
  }
  
  private getSubjectFromTemplate(
    templateId: string, 
    data: Record<string, any>
  ): string {
    // Map template IDs to subjects
    const subjectMap: Record<string, string> = {
      'welcome': 'Welcome to SessioFlow!',
      'proposal-submitted': 'Your proposal has been submitted',
      'proposal-accepted': 'Congratulations! Your proposal is accepted',
      'proposal-rejected': 'Update on your proposal submission'
    };
    
    return subjectMap[templateId] || 'SessioFlow Notification';
  }
}
```

### SendGrid Email Adapter (Alternative)

```typescript
// infrastructure/external/sendgrid-email-adapter.ts
import { 
  IEmailProvider, 
  EmailMessage,
  EmailSendResult 
} from '@/domains/email/repositories/i-email-provider';
import { SendGridMail, SendGrid } from '@sendgrid/mail';

SendGridMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class SendGridEmailAdapter implements EmailProvider {
  async send(message: EmailMessage): Promise<EmailSendResult> {
    const msg: SendGridMail.MailDataRequired = {
      to: message.to.map(addr => ({
        email: addr.email,
        name: addr.name
      })),
      from: {
        email: message.from.email,
        name: message.from.name || 'SessioFlow'
      },
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map(att => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType
      }))
    };
    
    const response = await SendGrid.send(msg);
    
    return {
      messageId: response[0].headers.get('x-message-id')!,
      sentAt: new Date(),
      status: 'sent'
    };
  }
  
  async sendTemplate(
    templateId: string,
    recipients: EmailAddress[],
    data: Record<string, any>
  ): Promise<EmailSendResult> {
    const msg: SendGridMail.MailDataRequired = {
      to: recipients.map(addr => ({
        email: addr.email,
        name: addr.name
      })),
      from: 'noreply@sessioflow.app',
      templateId,
      dynamicTemplateData: data
    };
    
    const response = await SendGrid.send(msg);
    
    return {
      messageId: response[0].headers.get('x-message-id')!,
      sentAt: new Date(),
      status: 'sent'
    };
  }
  
  async getStatus(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'bounced' | 'failed';
    deliveredAt?: Date;
    error?: string;
  }> {
    // SendGrid provides event webhook for delivery status
    // Implementation depends on webhook setup
    return { status: 'sent' };
  }
}
```

### Application Service (Use Case - Would Not Change)

```typescript
// application/email/send-proposal-notification-use-case.ts
import { EmailProvider, EmailMessage } from '@/domains/email/repositories/email-provider';

export class SendProposalNotificationUseCase {
  constructor(private emailProvider: EmailProvider) {}
  
  async execute(
    speakerEmail: string, 
    speakerName: string,
    eventName: string,
    status: 'submitted' | 'accepted' | 'rejected'
  ): Promise<void> {
    const subjectMap = {
      'submitted': 'Your proposal has been submitted',
      'accepted': 'Congratulations! Your proposal is accepted',
      'rejected': 'Update on your proposal submission'
    };
    
    const html = this.generateEmailHtml(eventName, status);
    
    const message: EmailMessage = {
      to: [{ email: speakerEmail, name: speakerName }],
      from: { email: 'noreply@sessioflow.app', name: 'SessioFlow' },
      subject: subjectMap[status],
      html
    };
    
    await this.emailProvider.send(message);
  }
  
  private generateEmailHtml(eventName: string, status: string): string {
    // Generate HTML email based on status
    return `
      <html>
        <body>
          <h1>Your proposal for ${eventName}</h1>
          <p>Status: ${status}</p>
          <!-- More content based on status -->
        </body>
      </html>
    `;
  }
}
```

### Composition Root (Single Swap Point)

```typescript
// app/config/email-config.ts
import { IEmailProvider } from '@/domains/email/repositories/i-email-provider';
import { ResendEmailAdapter } from '@/infrastructure/external/resend-email-adapter';

// Current implementation
export const emailProvider: IEmailProvider = new ResendEmailAdapter();

// Future migration: Just change this one line
// export const emailProvider: IEmailProvider = new SendGridEmailAdapter();
// export const emailProvider: IEmailProvider = new MailgunEmailAdapter();
```

---

## Cost Comparison: Email Providers

| Provider | Free Tier | Paid Tiers | Best For |
|----------|-----------|------------|----------|
| **Resend** | 100 emails/day | $20/month for 50K emails | Developers, modern API |
| **SendGrid** | 100 emails/day | $19.95/month for 40K emails | Enterprise, deliverability |
| **Mailgun** | 5K/month (3 months) | $35/month for 50K emails | Developer tools, analytics |
| **AWS SES** | 62K/month (from EC2) | $0.10 per 1K emails | AWS users, volume |

**Note:** All free tiers are sufficient for MVP (50 speakers × a few emails each).

---

## Decision Recommendations

### For MVP (6-week timeline)

**Recommendation:** **Do NOT implement email abstraction yet**

**Rationale:**
- ✅ Resend free tier sufficient for MVP
- ✅ Saves 10 hours of initial development
- ✅ Can add abstraction later if needed (~15 hours)
- ✅ Lower priority than auth/storage abstractions

**Action:**
- Use Resend directly as in original ADR-011
- Document the option to add abstraction later
- Monitor email volume and costs

### Post-MVP (If Needed)

**Trigger to Add Abstraction:**
- Resend pricing changes unfavorably
- Need to A/B test email providers
- Volume growth requiring different provider
- Consistency with auth/storage patterns desired

**Migration Cost (If Added Later):**
- Create `IEmailProvider` interface: 2-3 hours
- Create Resend adapter: 2-3 hours
- Create alternative adapter: 4-6 hours
- Update composition root: 0.5 hours
- Testing: 2-3 hours
- **Total:** 10.5-15.5 hours

---

## Comparison: With vs Without Email Abstraction

| Aspect | Without Abstraction (Original ADR-011) | With Abstraction (Optional) |
|--------|----------------------------------------|-----------------------------|
| **Initial Effort** | 0-2 hours | 10-12 hours |
| **Migration Cost** | 40-80 hours | 8-14 hours |
| **Vendor Lock-in** | Medium | Low |
| **Consistency** | Different from auth/storage | Consistent pattern |
| **MVP Timeline Impact** | None | +10 hours |
| **Long-term Flexibility** | Limited | High |

---

## Links

* [ADR-002b: Authentication Strategy and Vendor Abstraction](./_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md)
* [ADR-009: Domain-Driven Design Structure](./009-adopt-domain-driven-design-structure.md)
* [Resend Documentation](https://resend.com/docs)
* [SendGrid Documentation](https://docs.sendgrid.com/)
* [Mailgun Documentation](https://documentation.mailgun.com/)
* [React Email Templates](https://react.email/)

---

## Decision

**Status:** Optional - Pending Review

**Recommendation:** **Defer email abstraction until needed**

**Rationale:**
- Lower priority than auth and storage abstractions
- Resend free tier sufficient for MVP
- Can be added later with minimal cost
- Saves 10 hours for MVP timeline

**If Approved:**
- [ ] Implement `IEmailProvider` interface
- [ ] Create ResendEmailAdapter
- [ ] Update application services to use abstraction
- [ ] Write tests with mock provider

**If Deferred:**
- [ ] Document the option for future implementation
- [ ] Monitor email volume and costs
- [ ] Re-evaluate post-MVP if needed

---

## Appendix: When to Add Email Abstraction

**Add email abstraction if any of these occur:**

1. **Cost Trigger**: Resend pricing becomes unfavorable
   - Current: 100 emails/day free
   - If MVP exceeds this consistently

2. **Feature Trigger**: Need advanced email features
   - A/B testing different providers
   - Advanced analytics
   - Custom delivery rules

3. **Compliance Trigger**: Data residency requirements
   - Need email service in specific region
   - GDPR requirements for email data

4. **Consistency Trigger**: Want uniform architecture
   - All external dependencies use same abstraction pattern
   - Team prefers consistent patterns across codebase

**Decision Framework:**

```
┌─────────────────────────────────────────────────────────┐
│  Should We Add Email Abstraction?                       │
├─────────────────────────────────────────────────────────┤
│  MVP Phase (6 weeks)                                    │
│  └─> NO - Use Resend directly                          │
│      Reason: Lower priority, sufficient free tier       │
│                                                        │
│  Post-MVP (Product-Market Fit)                         │
│  └─> Evaluate based on triggers above                  │
│      If any trigger met: Implement abstraction          │
│      If no triggers: Continue with Resend               │
│                                                        │
│  Scale Phase (10K+ users)                              │
│  └─> YES - Implement abstraction                       │
│      Reason: Cost optimization, provider flexibility    │
└─────────────────────────────────────────────────────────┘
```
