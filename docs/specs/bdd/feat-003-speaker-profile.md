# Feature: Speaker Profile with Photo Upload

**Feature ID**: FEAT-003  
**Category**: User Management  
**Priority**: High  
**Status**: 📋 Planned  

**Related Specs**:
- [FEAT-001: Setup Event (Event Creation Wizard)](./feat-001-setup-event.md)
- [FEAT-002: User Authentication](./feat-002-user-authentication.md)
- [FEAT-004: Collect Proposals (CfP)](./feat-004-collect-proposals.md)

---

## Description

Enable speakers to create and manage their profile with bio, photo upload, and social links. Provides organizers with speaker visibility requirements and allows speakers to present themselves professionally at events.

---

## Background

```gherkin
Given the speaker is authenticated
And the speaker needs to submit a proposal
```

---

## Scenarios

### Scenario 1: Complete Speaker Profile (Happy Path)

```gherkin
Feature: Create Complete Speaker Profile

  Background:
    Given the speaker is authenticated
    And the speaker does not have a profile

  Scenario: First-time profile creation
    When the speaker navigates to "My Profile"
    Then the speaker should see a profile creation form
    And the form should request:
      | Field | Type | Required |
      | Full Name | Text | Yes |
      | Professional Title | Text | No |
      | Bio | Text area | Yes |
      | Photo | File upload | No |
      | Twitter/X Handle | Text | No |
      | LinkedIn URL | URL | No |
      | GitHub URL | URL | No |
    When the speaker fills in:
      | Field | Value |
      | Full Name | Andrea Developer |
      | Professional Title | Senior Software Engineer |
      | Bio | 10 years of experience in frontend development and open source contributor |
      | Twitter | @andreadev |
    And submits the profile
    Then the profile should be created successfully
    And the speaker should be redirected to profile view
    And the profile should appear in event speaker listings
    And the profile should be visible to event organizers
```

---

### Scenario 2: Photo Upload Functionality

```gherkan
Feature: Profile Photo Upload

  Background:
    Given the speaker has a profile without a photo

  Scenario: Upload profile photo
    When the speaker clicks "Upload Photo"
    And selects an image file (portrait.jpg, 2.5MB)
    Then the image should be uploaded to storage
    And the image should be optimized (resized to 400x400px)
    And the image should be compressed (max 500KB)
    And the profile should update with photo URL
    And a thumbnail should be generated (100x100px)

  Scenario: Unsupported file type
    When the speaker selects video.mp4
    Then the upload should fail
    And error should display: "Only image files (JPEG, PNG, WebP) are allowed"
    And the file input should be cleared
    And the profile photo should remain unchanged

  Scenario: File size exceeded
    Given the speaker selects image.png (5MB)
    Then upload should be rejected
    And error should display: "Image must be less than 3MB"
    And the file input should accept new file

  Scenario: Delete profile photo
    Given the speaker has a profile photo uploaded
    When the speaker clicks "Remove Photo"
    And confirms deletion
    Then the photo should be deleted from storage
    And the profile should show default avatar
    And the deletion should be permanent
```

---

### Scenario 3: Organizer Profile Requirements

```gherkin
Feature: Mandatory Profile Settings

  Background:
    Given an event is configured by organizer

  Scenario: Organizer enables photo requirement
    Given organizer has set "require_profile_photo = true"
    When a speaker submits a proposal
    Then speaker profile photo should be required
    And error should display: "Profile photo is required for this event"
    And proposal submission should be blocked
    And speaker should be redirected to profile page

  Scenario: Organizer disables photo requirement
    Given organizer has set "require_profile_photo = false"
    When a speaker submits a proposal
    Then profile photo should be optional
    And speaker can submit without photo
    And speaker may use default avatar

  Scenario: Speaker without photo in required event
    Given speaker has no profile photo
    And event requires profile photo
    When speaker tries to submit proposal
    Then profile creation should be mandatory
    Then speaker cannot proceed without photo
```

---

### Scenario 4: Profile Visibility and Privacy

```gherkin
Feature: Profile Privacy

  Background:
    Given a speaker has created a profile

  Scenario: Public profile visibility
    Given speaker profile is complete
    When event attendees visit speaker's event page
    Then public profile should be visible
    And name, title, and bio should be shown
    And profile photo should be displayed (if provided)
    And social links should be accessible

  Scenario: Private profile
    Given speaker has profile with social links
    And speaker has not submitted to any event
    Then profile should be private
    And only speaker can view full profile
    And organizers cannot see profile until proposal submission

  Scenario: Profile during active proposal
    Given speaker has submitted to Event A
    When attendee of Event A visits speaker profiles
    Then speaker profile should be visible to attendees
    And complete profile should be public
    And social links should be accessible
```

---

### Scenario 5: Profile Editing

```gherkin
Feature: Edit Existing Profile

  Background:
    Given the speaker has an existing profile

  Scenario: Update profile information
    When speaker clicks "Edit Profile"
    And changes bio to "12 years experience in full-stack development"
    And updates LinkedIn URL
    And submits the changes
    Then profile should be updated successfully
    And changes should be visible immediately
    And version history should be maintained (optional)

  Scenario: Cancel editing
    Given speaker is editing profile
    And has changed multiple fields
    When speaker clicks "Cancel"
    And confirms cancellation
    Then changes should be discarded
    And speaker should return to profile view
    And original data should remain unchanged

  Scenario: Validate bio length
    When speaker enters bio with 2000 characters
    Then validation should fail
    And error should display: "Bio must be 5-500 characters"
    And submission should be prevented

  Scenario: Required field validation
    When speaker removes "Full Name" from profile data
    Then validation should fail
    And error should display: "Full name is required"
    And submission should be blocked
```

---

### Scenario 6: Multiple Profile Links

```gherkin
Feature: Social Links Management

  Background:
    Given the speaker has a profile

  Scenario: Add social links
    When speaker adds Twitter handle "@andreadev"
    Then it should be validated as valid Twitter URL
    And link icon should display for Twitter
    And clickable link should appear in profile

  Scenario: Invalid URL format
    When speaker enters "not-a-valid-url" in LinkedIn field
    Then validation should fail
    And error should display: "Please enter a valid URL"
    And field should show red error state

  Scenario: Remove social links
    Given speaker has Twitter and LinkedIn configured
    When speaker clears Twitter handle
    Then Twitter link should be removed from profile
    And only LinkedIn should appear (if configured)
```

---

### Scenario 7: Profile Completion Feedback

```gherkin
Feature: Profile Completion State

  Background:
    Given the speaker has a profile

  Scenario: View profile completion status
    When speaker views their profile
    Then profile completion percentage should display
    And incomplete fields should be highlighted
    And "Complete your profile" prompt should appear

  Scenario: Minimum profile for proposal submission
    Given speaker has only name filled
    When speaker tries to submit proposal
    Then profile completion should be insufficient
    And required fields message should display
    And speaker should be guided to complete bio at minimum

  Scenario: Full profile badge
    Given speaker has all optional fields filled
    Then "Full Profile" badge should display
    And profile completion should show 100%
    And speaker should have maximum visibility
```

---

### Scenario 8: Default Avatar

```gherkin
Feature: Default Avatar Handling

  Background:
    Given the speaker profile system

  Scenario: No photo shows default avatar
    When speaker has no profile photo
    Then default avatar should appear
    And avatar should have speaker initials
    And avatar should show consistent color based on name

  Scenario: Default avatar customization
    Given user is "Andrea Developer"
    Then default avatar should show "AD" initials
    And avatar background should be consistent for this user
    And avatar should be generated client-side

  Scenario: Avatar accessibility
    Given default avatar displays
    Then alt text should be "Profile photo for Andrea Developer"
    And image should have proper ARIA attributes
    And keyboard users should not interact with avatar
```

---

## Scenario Implementation

### Files

#### Backend/API
- `supabase/migrations/create_profiles.sql` - Speaker profiles table
- `supabase/migrations/create_profile_links.sql` - Social links table
- `supabase/storage/profile-photos/` - Image storage bucket
- `supabase/functions/resize-image.ts` - Image processing functions
- `lib/storage/image-upload.ts` - Upload utilities

#### Validation
- `lib/validations/profile.ts` - Profile validation schemas
- `lib/utils/image-validation.ts` - Image format checkers

#### Frontend Components
- `app/(app)/profile/page.tsx` - Profile page
- `components/profile/profile-form.tsx` - Profile edit form
- `components/profile/photo-upload.tsx` - Photo upload component
- `components/profile/avatar.tsx` - Avatar display component
- `components/profile/social-links.tsx` - Social links component

---

### Data Structures

```typescript
// Speaker profile entity
export interface SpeakerProfile {
  id: string;
  user_id: string;
  full_name: string;
  professional_title?: string;
  bio: string;
  photo_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

// Social media links
export interface ProfileLink {
  id: string;
  profile_id: string;
  type: 'twitter' | 'linkedin' | 'github' | 'website';
  value: string;
  display_text: string;
  order: number;
}

// Profile creation input
export type CreateProfileInput = {
  fullName: string;
  professionalTitle?: string;
  bio: string;
  photo?: File | null;
  socialLinks: Partial<{
    twitter: string;
    linkedin: string;
    github: string;
    website: string;
  }>;
};

// Profile view response
export type ProfilePublicView = {
  fullName: string;
  professionalTitle?: string;
  bio: string;
  photoUrl?: string;
  socialLinks: Array<{
    type: ProfileLink['type'];
    url: string;
    displayText: string;
  }>;
};
```

---

### Validation Rules

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Name Required | Full Name | Not empty | "Full name is required" |
| Name Length | Full Name | 2-100 characters | "Name must be 2-100 characters" |
| Bio Required | Bio | Not empty | "Bio is required" |
| Bio Length | Bio | 5-500 characters | "Bio must be 5-500 characters" |
| Photo Type | Photo | image/jpeg, image/png, image/webp | "Only images allowed (JPEG, PNG, WebP)" |
| Photo Size | Photo | Max 3MB | "Image must be less than 3MB" |
| URL Format | Social Links | Valid URL format | "Please enter a valid URL" |
| URL Prefix | Social Links | https:// | "URL must start with https://" |

---

## Implementation Notes

### Core Logic Pseudocode

```typescript
// Upload and process image
async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error("Only image files are allowed");
  }
  
  if (file.size > 3 * 1024 * 1024) { // 3MB
    throw new Error("Image must be less than 3MB");
  }
  
  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${crypto.randomUUID()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Resize and compress
  const { data: resized } = await resizeImage(file, {
    width: 400,
    height: 400,
    quality: 0.8
  });
  
  // Upload optimized version
  const { data: optimized } = await supabase.storage
    .from('profile-photos')
    .upload(`${fileName}-optimized`, resized, {
      cacheControl: '86400',
      contentType: file.type
    });
  
  // Generate thumbnail
  const { data: thumb } = await resizeImage(file, {
    width: 100,
    height: 100,
    quality: 0.7
  });
  
  await supabase.storage
    .from('profile-photos')
    .upload(`${fileName}-thumb`, thumb);
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName);
  
  const { data: { publicUrl: thumbUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(`${fileName}-thumb`);
  
  return { publicUrl, thumbUrl };
}

// Create or update profile
async function updateProfile(
  userId: string,
  input: CreateProfileInput
): Promise<SpeakerProfile> {
  const validated = profileSchema.parse(input);
  
  let photoUrls: { publicUrl?: string; thumbnailUrl?: string } = {};
  
  if (validated.photo) {
    photoUrls = await uploadProfilePhoto(userId, validated.photo);
  }
  
  // Upsert profile
  const { data: profile, error } = await supabase
    .from('speaker_profiles')
    .upsert({
      user_id: userId,
      full_name: validated.fullName,
      professional_title: validated.professionalTitle,
      bio: validated.bio,
      photo_url: photoUrls.publicUrl,
      thumbnail_url: photoUrls.thumbnailUrl
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update social links
  await updateSocialLinks(profile.id, validated.socialLinks);
  
  return profile;
}
```

---

### UI Components

```tsx
// Profile form
export function ProfileForm({ profile }: { profile?: SpeakerProfile }) {
  const [formData, setFormData] = useForm<CreateProfileInput>({
    fullName: profile?.full_name || '',
    professionalTitle: profile?.professional_title || '',
    bio: profile?.bio || '',
    photo: null,
    socialLinks: {
      twitter: extractTwitter(profile),
      linkedin: extractLinkedIn(profile),
      github: extractGitHub(profile),
      website: extractWebsite(profile)
    }
  });
  
  const onSubmit = async (data: CreateProfileInput) => {
    await updateProfile(currentUser.id, data);
    showNotification('Profile updated successfully!');
  };
  
  return (
    <Form onSubmit={onSubmit} data={formData}>
      <TextInput
        label="Full Name"
        value={formData.fullName}
        onChange={setFieldValue('fullName')}
        required
        maxLength={100}
      />
      
      <TextInput
        label="Professional Title"
        value={formData.professionalTitle}
        onChange={setFieldValue('professionalTitle')}
        placeholder="Senior Software Engineer"
      />
      
      <TextArea
        label="Bio"
        value={formData.bio}
        onChange={setFieldValue('bio')}
        required
        maxLength={500}
        rows={5}
        placeholder="Tell us about yourself..."
      />
      
      <PhotoUpload
        currentPhoto={profile?.photo_url}
        thumbnail={profile?.thumbnail_url}
        onUpload={(file) => setFieldValue('photo', file)}
      />
      
      <SocialLinks
        twitter={formData.socialLinks.twitter}
        linkedin={formData.socialLinks.linkedin}
        github={formData.socialLinks.github}
        website={formData.socialLinks.website}
        onChange={setFieldValue('socialLinks')}
      />
      
      <FormActions>
        <Button type="submit">Save Profile</Button>
        <Button variant="secondary" onClick={handleCancel} type="button">
          Cancel
        </Button>
      </FormActions>
    </Form>
  );
}

// Profile view
export function ProfileView({ profile }: { profile?: SpeakerProfile }) {
  const completion = calculateCompletionScore(profile);
  
  return (
    <div className="profile-container">
      <Avatar 
        name={profile?.full_name}
        photoUrl={profile?.photo_url}
        size="large"
      />
      
      <ProfileHeader>
        <h1>{profile?.full_name}</h1>
        {profile?.professional_title && (
          <Subtitle>{profile.professional_title}</Subtitle>
        )}
        <CompletionBadge percent={completion} />
      </ProfileHeader>
      
      <section className="bio-section">
        <h2>About</h2>
        <p>{profile?.bio}</p>
      </section>
      
      <section className="social-links">
        {profile && renderSocialLinks(profile)}
      </section>
      
      {isOwner(profile) && (
        <EditButton onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </EditButton>
      )}
    </div>
  );
}
```

---

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| Image Upload | File type validation server-side and client-side |
| File Size | Max 3MB limit enforced server-side |
| Image Processing | Resize and compress before storage |
| Storage Access | Supabase bucket with RLS (Row Level Security) |
| XSS Prevention | Escape all profile content on display |
| Hotlinking | Image URLs signed with expiration |
| Unauthorized Access | RLS: users can only modify own profile |
| URL Validation | Strict URL format validation for social links |
| Content Security | CSP headers prevent external script injection |

---

## Testing Strategy

### Unit Tests (`tests/unit/profile-validation.test.ts`)

- [ ] Bio length validation (5-500 characters)
- [ ] Image file type validation
- [ ] Image size validation (max 3MB)
- [ ] URL format validation for social links
- [ ] Completion score calculation
- [ ] Avatar initial generation logic

### Feature Tests (`tests/features/profile-management.test.tsx`)

- [ ] Profile creation form submission
- [ ] Photo upload interaction
- [ ] Image preview before upload
- [ ] Social links addition/removal
- [ ] Profile editing flow
- [ ] Cancel edit behavior
- [ ] Profile completion feedback
- [ ] Default avatar rendering

### Integration Tests (`tests/integration/profile-api.test.ts`)

- [ ] Image upload to Supabase Storage
- [ ] Image resize and compression
- [ ] Profile creation and update
- [ ] Social links CRUD operations
- [ ] Photo deletion
- [ ] Profile retrieval with/without photo

### E2E Tests (`tests/e2e/profile-flow.spec.ts`)

- [ ] Complete profile creation from scratch
- [ ] Upload and replace profile photo
- [ ] Add and remove social links
- [ ] Edit existing profile
- [ ] Profile visibility restrictions
- [ ] Photo required flow for event

---

## Acceptance Criteria

- [ ] Speakers can create complete profiles with all fields
- [ ] Photo upload works for all supported image formats
- [ ] Images are automatically resized and compressed
- [ ] Uploaded photos display with thumbnail version
- [ ] Default avatar shows with user initials
- [ ] Social links validate URL format correctly
- [ ] Photo requirement from organizer is enforced
- [ ] Speakers cannot submit without photo when required
- [ ] Profile editing updates data correctly
- [ ] Cancel edit preserves original data
- [ ] Profile completion percentage displays accurately
- [ ] Profile visibility respects privacy rules
- [ ] All 8 scenarios pass in automated test suite
- [ ] Image upload max 3MB enforced
- [ ] Bio field validates 5-500 character range
- [ ] All accessibility requirements met (alt text, ARIA)

---

**Implementation Priority**: 
1. Profile database schema (Day 1)
2. Image upload and processing (Day 2-3)
3. Profile form components (Day 4-5)
4. Profile view and editing (Day 6-7)
5. Integration with Organizer settings (Day 8)
6. Testing and polish (Day 9-10)

**Estimated Effort**: 2 weeks for 2 developers

**Next Related Feature**: FEAT-004: Collect Proposals (CfP)
