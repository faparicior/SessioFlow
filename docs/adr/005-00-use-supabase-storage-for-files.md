# 005-use-supabase-storage-for-files

* **Status:** ⚠️ **SUPERSEDED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Superseded By:** ADR-005-01 (Supabase Storage with DDD Abstraction)
* **Amended By:** ADR-005-01

## Context and Problem Statement

SessioFlow requires file storage capabilities for:

1. **Speaker Profile Photos**: MVP Wave 1 feature allowing speakers (Andrea) to upload profile pictures
2. **Future Session Attachments**: Potential for session abstracts, slides, or supporting documents

The User Journey Mapping (Journey 2) explicitly includes "Andrea fills in title, abstract & uploads photo" as a critical step. The MVP Canvas identifies "Image Storage (Supabase Storage) for profile photos" as a technical enabler.

This decision must align with:
- **Usability** (ranked #1): Photo upload must be smooth and intuitive
- **Cost** (ranked #2): Must respect $0/month infrastructure constraint
- **Security** (ranked #5): Must protect uploaded files with appropriate access controls
- **Simplicity** (ranked #3): Should not add significant complexity to the deployment

**Decision Drivers:**
- Must support image uploads with minimal user friction (Andrea's Need 1: "Single point with all information")
- Must integrate with existing Supabase backend to reduce architectural complexity
- Must implement access controls to prevent unauthorized file access
- Must provide image optimization for fast loading (performance target: <3ms page load)
- Must stay within free tier limits (1GB storage in Supabase free tier)
- Must support GDPR compliance for user-uploaded content

## Considered Options

1. **Supabase Storage (Integrated with Supabase Backend)**
2. **AWS S3 (Separate Storage Service)**
3. **Cloudinary (Image-Optimized Storage)**
4. **Local File System Storage**

## Decision Outcome

**Chosen Option:** "Supabase Storage (Integrated with Supabase Backend)"

**Justification:**
Supabase Storage is the optimal choice because it provides seamless integration with the chosen backend while meeting all constraints:

1. **Cost Compliance**: Free tier includes 1GB storage and 2GB/month bandwidth—sufficient for MVP (50+ speakers with profile photos)
2. **Architectural Simplicity**: Uses the same Supabase client and authentication system, eliminating the need for additional service integration
3. **Security Integration**: Row-Level Security (RLS) policies apply to storage buckets, ensuring only authorized users can access files (addresses GDPR risk)
4. **Developer Experience**: Same JavaScript client handles database and storage operations, reducing code complexity
5. **Usability**: Built-in upload components and URL generation enable smooth photo upload experience for Andrea

### Consequences

* **Positive:**
  - Unified authentication: Same Supabase client handles both database queries and file uploads
  - RLS policies ensure speakers can only upload to their own profiles
  - CDN-backed delivery ensures fast image loading globally
  - Simple API for upload progress tracking and error handling
  - Free tier sufficient for MVP validation without cost concerns

* **Negative:**
  - 1GB free tier limit may be reached with high-resolution photos
  - Limited image transformation capabilities compared to specialized services
  - Vendor lock-in to Supabase ecosystem
  - No built-in image moderation or content scanning

* **Risks:**
  - Malicious users could upload inappropriate images (requires client-side validation)
  - Large images could consume storage quota quickly
  - No automatic image optimization may impact page load performance
  - Storage deletion policies must be carefully configured for GDPR compliance

### Pros and Cons of the Options

#### Option 1: Supabase Storage (Integrated with Supabase Backend)

* Good, because it uses the same Supabase client for database and storage, reducing code complexity
* Good, because Row-Level Security policies apply to storage, ensuring GDPR compliance
* Good, because the free tier (1GB storage, 2GB bandwidth) is sufficient for MVP validation
* Good, because it requires no additional service configuration or API keys
* Bad, because it lacks built-in image optimization and transformation features
* Bad, because it has limited storage compared to dedicated cloud storage services
* Bad, because it creates additional dependency on Supabase infrastructure

#### Option 2: AWS S3 (Separate Storage Service)

* Good, because it provides virtually unlimited storage capacity
* Good, because it offers fine-grained access control and lifecycle policies
* Bad, because it requires separate AWS account setup and credential management
* Bad, because free tier is limited (5GB for 12 months, then pay-per-use)
* Bad, because it adds architectural complexity (separate authentication, signing)
* Bad, because it exceeds the "Simplicity" priority for MVP development

#### Option 3: Cloudinary (Image-Optimized Storage)

* Good, because it provides automatic image optimization, resizing, and format conversion
* Good, because it includes built-in CDN for fast global delivery
* Bad, because free tier has limitations (25GB storage, 25GB bandwidth/month)
* Bad, because it adds another service dependency and API key management
* Bad, because it may be overkill for MVP with only profile photos
* Bad, because it creates vendor lock-in with proprietary transformation API

#### Option 4: Local File System Storage

* Good, because it requires no external service dependencies
* Good, because it provides complete control over file storage and retention
* Bad, because it requires custom backup and disaster recovery procedures
* Bad, because it doesn't scale across multiple server instances
* Bad, because it requires manual configuration for HTTPS and CDN
* Bad, because it conflicts with Docker Compose deployment model (stateful containers)
* Bad, because it increases self-hosting complexity for volunteers

## Image Optimization Strategy

Given Supabase Storage's lack of built-in image optimization, the following approach will be used:

1. **Client-Side Compression**: Use browser APIs to compress images before upload (target: <500KB per photo)
2. **Dimension Constraints**: Enforce maximum dimensions (800x800px) to prevent oversized files
3. **Format Selection**: Accept JPEG and WebP formats for optimal compression
4. **Responsive Images**: Generate multiple sizes using Next.js Image component for different contexts

## Links

* [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
* [User Journey 2: Photo Upload](../inception/6-user-journey-mapping.md#journey-2-submitting-a-talk-andrea)
* [MVP Canvas - Technical Enablers](../inception/8-mvp-canvas-definition.md#6-technical--ux-enablers)
* [Persona: Andrea - Profile Photo Need](../inception/3-personas.md#persona-name-andrea-the-experienced-speaker)
