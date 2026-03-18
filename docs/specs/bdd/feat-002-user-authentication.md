# Feature: User Authentication

**Feature ID**: FEAT-002  
**Category**: Authentication  
**Priority**: High  
**Status**: 📋 Planned  

**Related Specs**:
- [FEAT-001: Setup Event (Event Creation Wizard)](./feat-001-setup-event.md)
- [FEAT-003: Speaker Profile with Photo Upload](./feat-003-speaker-profile.md)
- [FEAT-004: Collect Proposals (CfP)](./feat-004-collect-proposals.md)
- [GB-VAL-001: Date Validation Rules](./_global-behaviours/validation/gb-val-001-date-validation.md)

---

## Description

Implement secure authentication system for Organizers and Speakers using email-based magic links. Provides role-based access control, session management, and account creation workflows without password requirements.

---

## Background

```gherkin
Given the user is on the authentication page
And the user has a valid email address
```

---

## Scenarios

### Scenario 1: Organizer Signup with Magic Link (Happy Path)

```gherkin
Feature: Organizer Authentication Flow

  Background:
    Given the user is on the login page

  Scenario: Complete organizer signup flow
    When the user enters email "fernando@test.com"
    And selects "Sign up as Organizer"
    Then an email should be sent with magic link
    And the user should see confirmation: "Check your email"
    And the magic link should expire in 15 minutes
    And clicking the link should authenticate the user
    And the user should be redirected to the events dashboard
    And a user record should be created with role "organizer"
    And the user should have access to:
      | Permission | Access |
      | Create Events | ✅ Yes |
      | View Submissions | ✅ Yes |
      | Score Sessions | ❌ No |
      | Manage Schedule | ❌ No |
```

---

### Scenario 2: Speaker Account Creation

```gherkin
Feature: Speaker Registration

  Background:
    Given the user is on the login page
    And the user does not have an account

  Scenario: Speaker account creation
    When the user enters email "andrea@speaker.com"
    And selects "I want to submit a proposal"
    Then an email should be sent with magic link
    And the magic link should authenticate the user
    And the user should be redirected to speaker onboarding
    And the user should be prompted to complete profile
    And the user record should have role "speaker"
    And the user should not have access to organizer features

  Scenario: Existing speaker login
    Given an existing speaker with email "andrea@speaker.com"
    When the user enters the same email
    And selects "Submit a proposal"
    Then the user should be authenticated successfully
    And the user should be redirected to speaker dashboard
    And the existing profile should be preserved
```

---

### Scenario 3: Role-Based Access Control

```gherkin
Feature: Access Control

  Background:
    Given user "Fernando" has role "organizer"
    And user "Andrea" has role "speaker"

  Scenario: Organizer cannot access speaker-only features
    When Fernando attempts to submit a proposal
    Then the action should be blocked
    And error should display: "Organizers cannot submit proposals"
    And redirect should go to event dashboard

  Scenario: Speaker cannot access organizer features
    Given Andrea is logged in as a speaker
    When Andrea attempts to create an event
    Then the action should be blocked
    And error should display: "This action requires organizer access"
    And the user should be redirected to speaker dashboard

  Scenario: User role validation
    When an organizer tries to view speaker submissions for their event
    Then all submissions visible should belong to this event
    And the organizer should not see submissions from other events
    And the organizer should see proposal scores and reviews

  Scenario: Speaker submission restrictions
    Given Andrea has submitted to Event A
    When Andrea tries to submit to Event A again
    Then duplicate submission should be prevented
    And error should display: "You have already submitted to this event"
    And the original submission should remain unchanged
```

---

### Scenario 4: Passwordless Login Recovery

```gherkin
Feature: Account Recovery

  Background:
    Given a user registered with email "lost@example.com"
    And the user has forgotten they have an account

  Scenario: Recover access with magic link
    When the user enters "lost@example.com" on login page
    And clicks "Send Magic Link"
    Then an email should be sent to that address
    And the user should be able to login without password
    And the magic link should work once per email click
    And the user should be authenticated successfully

  Scenario: Multiple magic links
    Given a user has sent 3 magic links in the past hour
    When the user clicks on the oldest link
    Then the oldest link should be invalid
    And the most recent link should work
    And the system should invalidate previous links
```

---

### Scenario 5: Session Management

```gherkin
Feature: Session Handling

  Background:
    Given a user is authenticated

  Scenario: Session persistence
    When the user closes the browser
    And reopens the application
    Then the user should remain logged in
    And the session should persist for 7 days
    And the user should not need to re-authenticate

  Scenario: Session expiry
    Given a user has been logged in for 7 days
    When the 7-day session expires
    Then the user should be logged out
    And the user should be redirected to login page
    And the session token should be invalidated

  Scenario: Manual logout
    When the authenticated user clicks "Logout"
    Then the session should be terminated
    And the user should be redirected to login page
    And the session token should be invalidated
    And the user cannot access protected routes
```

---

### Scenario 6: Email Validation

```gherkin
Feature: Email Validation

  Background:
    Given the user is on the authentication page

  Scenario: Valid email format
    When the user enters "valid.email@example.com"
    Then the email should pass format validation
    And the "Send Magic Link" button should be enabled
    And the email format should be accepted

  Scenario: Invalid email format
    When the user enters "invalid-email"
    Then validation should fail
    And error should display: "Please enter a valid email address"
    And the button should remain disabled

  Scenario: Duplicate email registration
    Given a user already exists with email "test@example.com"
    When a new registration attempt with same email
    Then the system should offer login
    And message should display: "Account already exists. Login instead?"
    And redirect to login page with email pre-filled

  Scenario: Empty email submission
    When the user clicks "Send Magic Link" without email
    Then validation error should display
    And "Email is required" error should appear
    And no email should be sent
```

---

### Scenario 7: Email Verification

```gherkin
Feature: Email Verification

  Background:
    Given the user has entered email and requested magic link

  Scenario: Valid magic link click
    When user clicks the magic link in email
    And the link has not expired
    Then the user should be authenticated
    And email_verified should be set to true
    And user should be redirected appropriately

  Scenario: Expired magic link
    Given the magic link was sent 20 minutes ago
    When the user clicks the link
    Then authentication should fail
    And error should display: "This link has expired. Please request a new one."
    And user should be offered to request fresh link

  Scenario: Already-used link
    Given the user has already clicked the magic link once
    When the user tries to click it again
    Then the link should be invalid
    And error should display: "This link has already been used"
    And user should be prompted to login normally
```

---

### Scenario 8: OAuth Alternative (Future)

```gherkin
Feature: OAuth Integration (Deferred)

  Background:
    Given the authentication page

  Scenario: Sign in with Google (planned)
    Given OAuth credentials are configured
    When user clicks "Sign in with Google"
    Then OAuth flow should initiate
    And user should authenticate via Google
    And Google email should be used for account creation
    And user role should default to "speaker"
    
  Note: OAuth is in Wave 3, not MVP scope
```

---

## Scenario Implementation

### Files

#### Backend/API
- `supabase/migrations/create_auth_tables.sql` - User profiles table
- `supabase/functions/send-magic-link.ts` - Email function
- `lib/auth/session.ts` - Session management utilities
- `lib/auth/roles.ts` - Role-based access control

#### Validation
- `lib/validations/auth.ts` - Zod schemas for auth flows
- `lib/utils/email-validation.ts` - Email format validation

#### Frontend Components
- `app/(auth)/login/page.tsx` - Login page
- `components/auth/magic-link-form.tsx` - Email input form
- `components/auth/role-selector.tsx` - Organizer/Speaker choice
- `components/auth/redirect-gate.tsx` - Route protection
- `app/(auth)/onboard/profile/page.tsx` - Speaker onboarding

#### Server Actions
- `app/(auth)/actions.ts` - `sendMagicLink()`, `verifyMagicLink()`

---

### Data Structures

```typescript
// User profile with roles
export interface User {
  id: string;
  email: string;
  role: 'organizer' | 'speaker';
  email_verified: boolean;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

// Session management
export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Magic link token
export interface MagicLink {
  id: string;
  email: string;
  token: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

// Role permissions
export const ROLE_PERMISSIONS = {
  organizer: {
    create_events: true,
    view_submissions: true,
    score_sessions: true,
    manage_schedule: true,
    manage_settings: true,
  },
  speaker: {
    create_events: false,
    view_submissions: false,
    score_sessions: false,
    manage_schedule: false,
    manage_settings: false,
    submit_proposals: true,
    view_own_submissions: true,
  }
};
```

---

### Validation Rules

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Email Format | Email | Valid RFC 5322 | "Please enter a valid email address" |
| Email Required | Email | Not empty | "Email is required" |
| Magic Link Expiry | Token | 15 minutes | "This link has expired" |
| Token Uniqueness | Token | Single use | "This link has already been used" |
| Role Selection | Role | organizer/speaker | (no error, selection required) |
| Duplicate Email | Email | Unique | "Account already exists" |
| Session Duration | Session | 7 days | (auto-expires) |

---

## Implementation Notes

### Core Logic Pseudocode

```typescript
// Send magic link
async function sendMagicLink(email: string, role: User['role']): Promise<void> {
  // Validate email format
  const emailValidation = validateEmailFormat(email);
  if (!emailValidation.valid) {
    throw new Error("Invalid email format");
  }
  
  // Check if email exists
  const existingUser = await db.users
    .where({ email })
    .first();
  
  // Generate token
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  
  // Store magic link token
  await db.magicLinks.insert({
    email,
    token,
    role,
    expires_at: expiresAt,
    used: false
  });
  
  // Send email
  await sendEmail({
    to: email,
    subject: "Your SessioFlow login link",
    template: "magic-link",
    data: {
      link: `${BASE_URL}/auth/verify?token=${token}`,
      expiresIn: "15 minutes"
    }
  });
}

// Verify magic link
async function verifyMagicLink(token: string): Promise<User> {
  // Find magic link record
  const magicLink = await db.magicLinks
    .where({ token })
    .first();
  
  if (!magicLink) {
    throw new Error("Invalid token");
  }
  
  // Check expiration
  if (new Date() > new Date(magicLink.expires_at)) {
    throw new Error("Link has expired");
  }
  
  // Check if already used
  if (magicLink.used) {
    throw new Error("Link has already been used");
  }
  
  // Mark as used
  await db.magicLinks
    .update({ id: magicLink.id }, { used: true });
  
  // Find or create user
  let user = await db.users
    .where({ email: magicLink.email })
    .first();
  
  if (!user) {
    user = await db.users.insert({
      email: magicLink.email,
      role: magicLink.role,
      email_verified: true
    });
  }
  
  // Create session
  const sessionToken = generateSessionToken(user.id);
  await createSession(user.id, sessionToken);
  
  // Create session cookie
  setSessionCookie(sessionToken);
  
  return user;
}

// Route protection HOC
function requireRole(requiredRole: User['role']) {
  return function ProtectedComponent<P>(
    Component: React.ComponentType<P>
  ) {
    return function ProtectedRoute(props: P) {
      const user = getCurrentUser();
      
      if (!user) {
        return <Redirect to="/login" />;
      }
      
      if (user.role !== requiredRole) {
        return <Redirect to="/dashboard" />;
      }
      
      return <Component {...props} />;
    };
  };
}
```

---

### UI Components

```tsx
// Magic link login form
export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'organizer' | 'speaker'>('speaker');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      await sendMagicLink(email, role);
      setStatus('sent');
    } catch (error) {
      setStatus('error');
    }
  };
  
  if (status === 'sent') {
    return (
      <div className="auth-success">
        <Text>Email sent! Check your inbox.</Text>
        <Text>Link expires in 15 minutes.</Text>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <RoleSelector value={role} onChange={setRole} />
      
      <EmailInput
        value={email}
        onChange={setEmail}
        placeholder="your@email.com"
      />
      
      <Button
        type="submit"
        disabled={!isValidEmail(email) || status === 'sending'}
      >
        {status === 'sending' ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  );
}

// Route protection wrapper
export function AuthGuard({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: User['role'];
}) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Spinner />;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Redirect to="/dashboard" />;
  }
  
  return <>{children}</>;
}
```

---

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| Magic Link Tokens | Use cryptographically secure random tokens (32 bytes, hex encoded) |
| Token Expiration | 15-minute expiry enforced server-side |
| Single Use | Token marked used immediately after first successful authentication |
| Session Hijacking | HTTP-only, secure cookies with SameSite=strict |
| CSRF Protection | Supabase handles CSRF automatically |
| Rate Limiting | Max 3 magic links per email per hour |
| Email Enumeration | Generic error messages (don't reveal if email exists) |
| Password Storage | Not applicable (passwordless) |
| Session Storage | Database session storage with automatic cleanup |
| XSS Prevention | React automatic escaping, Content-Security-Policy header |

---

## Testing Strategy

### Unit Tests (`tests/unit/auth-validation.test.ts`)

- [ ] Email format validation with valid emails
- [ ] Email format rejection with invalid formats
- [ ] Magic link token generation uniqueness
- [ ] Token expiration logic
- [ ] Role permission checking
- [ ] Session creation and validation
- [ ] Duplicate email handling

### Feature Tests (`tests/features/authentication.test.tsx`)

- [ ] Magic link form submission
- [ ] Role selector interaction
- [ ] Email validation feedback
- [ ] Success state display
- [ ] Error state display
- [ ] Loading states
- [ ] Redirect after success

### Integration Tests (`tests/integration/auth-api.test.ts`)

- [ ] Magic link email sending
- [ ] Token verification flow
- [ ] User creation on first login
- [ ] Session creation and storage
- [ ] Route protection enforcement
- [ ] Role-based access control
- [ ] Concurrent magic link handling

### E2E Tests (`tests/e2e/authentication.spec.ts`)

- [ ] Complete organizer signup flow
- [ ] Complete speaker signup flow
- [ ] Login with magic link
- [ ] Session persistence across browser close
- [ ] Logout functionality
- [ ] Session expiry behavior
- [ ] Protected route enforcement

---

## Acceptance Criteria

- [ ] Users can sign up with email and role selection
- [ ] Magic link email is sent within 5 seconds
- [ ] Magic link works for both organizer and speaker roles
- [ ] Magic link expires after 15 minutes
- [ ] Magic link can only be used once
- [ ] Existing users are recognized and logged in
- [ ] New users are created with appropriate role
- [ ] Session persists for 7 days
- [ ] Logout clears session immediately
- [ ] Route protection prevents unauthorized access
- [ ] Organizers cannot access speaker-only features
- [ ] Speakers cannot access organizer-only features
- [ ] All 8 scenarios pass in automated test suite
- [ ] Email validation prevents invalid formats
- [ ] Rate limiting prevents abuse (3/hour)
- [ ] Security audit passes for auth implementation

---

**Implementation Priority**: 
1. Database schema and roles (Day 1-2)
2. Magic link backend (Day 3-4)
3. Frontend form and flows (Day 5-7)
4. Route protection and RBAC (Day 8-10)
5. Integration and E2E tests (Day 11-14)

**Estimated Effort**: 2 weeks for 2 developers

**Next Related Feature**: FEAT-003: Speaker Profile with Photo Upload
