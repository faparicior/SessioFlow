# 005-Supabase Storage Amendment: DDD Abstraction

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-11
* **Decision Makers:** Product Team, Technical Lead
* **Amends:** ADR-005 (Use Supabase Storage for Files)
* **Related:** ADR-002b (Authentication Strategy and Vendor Abstraction), ADR-009 (Domain-Driven Design Structure)

---

## Purpose of This Amendment

This document amends **ADR-005** to incorporate the DDD abstraction pattern established in ADR-002b. The original ADR-005 assumed tight coupling to Supabase Storage, but with DDD abstraction, the storage layer becomes vendor-agnostic and swappable.

---

## Critical Update: Storage Abstraction Pattern

### Original ADR-005 Assumption

The original ADR-005 assumed:
- Direct Supabase Storage SDK integration
- File uploads/downloads tightly coupled to Supabase
- Migration away from Supabase Storage would require significant refactoring
- Limited to Supabase's 1GB free tier

### New Reality with DDD Abstraction

With ADR-002b's DDD pattern:
- **All file operations** flow through `StorageProvider` interface
- **Supabase Storage** becomes one implementation (adapter)
- **Migration cost** reduced from 52-112 hours to 8-14 hours
- **Provider independence** - can swap to Cloudflare R2, MinIO, or AWS S3

---

## Revised Decision

### Updated Decision: Storage with DDD Abstraction

**Chosen Option:** "Supabase Storage with DDD Abstraction Layer"

**Updated Justification:**
With DDD abstraction (ADR-002b), the storage strategy provides optimal flexibility:

1. **Cost Compliance**: Start with Supabase free tier (1GB), migrate to cheaper options if needed
2. **Vendor Independence**: Can swap Supabase ↔ Cloudflare R2 ↔ MinIO with 8-14 hours effort
3. **No Egress Fees**: Can migrate to Cloudflare R2 (no egress fees) for better cost at scale
4. **GDPR Compliance**: Can choose provider based on data residency requirements
5. **MVP Timeline**: Start with Supabase for speed, migrate later if needed

---

## Implementation Pattern

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Application Layer (Use Cases)                          │
│  - UploadProfilePhotoUseCase                            │
│  - GetProfilePhotoUrlUseCase                            │
│  - DeleteFileUseCase                                    │
│  - Depends only on: StorageProvider interface          │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ depends on abstraction
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Domain Layer (Port)                                      │
│  - StorageProvider interface                             │
│  - File metadata (FileId, ContentType, Size)             │
│  - UploadResult, FileUrl value objects                    │
└────────────────────────┬─────────────────────────────────┘
                         │ implemented by
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Infrastructure Layer (Adapters)                          │
│  - SupabaseStorageAdapter (current)                       │
│  - CloudflareR2Adapter (future option)                    │
│  - MinioAdapter (self-hosted option)                      │
│  - LocalStorageAdapter (development)                      │
└─────────────────────────────────────────────────────────┘
```

### Domain Interface (Port)

```typescript
// domains/storage/repositories/storage-provider.ts
export interface FileMetadata {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  ownerId: string; // For access control
}

export interface UploadFileRequest {
  file: Buffer;
  filename: string;
  contentType: string;
  path: string; // e.g., 'profiles/user-id/photo.jpg'
  ownerId: string;
}

export interface UploadFileResult {
  fileId: string;
  url: string;
  metadata: FileMetadata;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  upload(request: UploadFileRequest): Promise<UploadFileResult>;
  
  /**
   * Download a file from storage
   */
  download(path: string): Promise<Buffer>;
  
  /**
   * Get a URL for accessing a file
   * For public files: returns direct URL
   * For private files: returns presigned URL with expiry
   */
  getUrl(path: string, options?: { expiresInSeconds?: number }): Promise<string>;
  
  /**
   * Delete a file from storage
   */
  delete(path: string): Promise<void>;
  
  /**
   * Check if a file exists
   */
  exists(path: string): Promise<boolean>;
}
```

### Supabase Storage Adapter (Current Implementation)

```typescript
// infrastructure/external/supabase-storage-adapter.ts
import { 
  StorageProvider, 
  FileMetadata,
  UploadFileRequest,
  UploadFileResult 
} from '@/domains/storage/repositories/storage-provider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BUCKET_NAME = 'sessioflow-files';

export class SupabaseStorageAdapter implements StorageProvider {
  async upload(request: UploadFileRequest): Promise<UploadFileResult> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(request.path, request.file, {
        contentType: request.contentType,
        upsert: false
      });
    
    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }
    
    const url = await this.getUrl(request.path);
    
    const metadata: FileMetadata = {
      id: crypto.randomUUID(),
      filename: request.filename,
      contentType: request.contentType,
      size: request.file.length,
      uploadedAt: new Date(),
      ownerId: request.ownerId
    };
    
    return {
      fileId: metadata.id,
      url,
      metadata
    };
  }
  
  async download(path: string): Promise<Buffer> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);
    
    if (error) {
      throw new Error(`Storage download failed: ${error.message}`);
    }
    
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  async getUrl(path: string, options?: { expiresInSeconds?: number }): Promise<string> {
    if (options?.expiresInSeconds) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, options.expiresInSeconds);
      
      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }
      
      return data.signedUrl;
    }
    
    // Public URL
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
  
  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (error) {
      throw new Error(`Storage deletion failed: ${error.message}`);
    }
  }
  
  async exists(path: string): Promise<boolean> {
    try {
      const { data } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });
      
      return data?.some(file => file.name === path) ?? false;
    } catch {
      return false;
    }
  }
}
```

### Cloudflare R2 Adapter (Future Implementation)

```typescript
// infrastructure/external/cloudflare-r2-adapter.ts
import { 
  StorageProvider, 
  FileMetadata,
  UploadFileRequest,
  UploadFileResult 
} from '@/domains/storage/repositories/storage-provider';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class CloudflareR2Adapter implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      }
    });
    this.bucket = process.env.R2_BUCKET_NAME!;
  }
  
  async upload(request: UploadFileRequest): Promise<UploadFileResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: request.path,
      Body: request.file,
      ContentType: request.contentType
    });
    
    await this.client.send(command);
    
    const url = await this.getUrl(request.path);
    
    const metadata: FileMetadata = {
      id: crypto.randomUUID(),
      filename: request.filename,
      contentType: request.contentType,
      size: request.file.length,
      uploadedAt: new Date(),
      ownerId: request.ownerId
    };
    
    return {
      fileId: metadata.id,
      url,
      metadata
    };
  }
  
  async download(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path
    });
    
    const response = await this.client.send(command);
    const body = response.Body as any;
    
    const arrayBuffer = await body.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  async getUrl(path: string, options?: { expiresInSeconds?: number }): Promise<string> {
    if (options?.expiresInSeconds) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path
      });
      
      const url = await getSignedUrl(this.client, command, {
        expiresIn: options.expiresInSeconds
      });
      
      return url;
    }
    
    // Public URL
    return `https://${this.bucket}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${path}`;
  }
  
  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path
    });
    
    await this.client.send(command);
  }
  
  async exists(path: string): Promise<boolean> {
    // R2 doesn't have a direct exists method, try to get metadata
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path
      });
      
      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }
}
```

### Application Service (Use Case - Never Changes)

```typescript
// application/storage/upload-profile-photo-use-case.ts
import { StorageProvider, UploadFileRequest } from '@/domains/storage/repositories/storage-provider';

export class UploadProfilePhotoUseCase {
  private MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  constructor(private storageProvider: StorageProvider) {}
  
  async execute(file: Buffer, ownerId: string): Promise<UploadFileResult> {
    // Validate file
    if (file.length > this.MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 5MB');
    }
    
    // Determine content type (in real implementation, use magic numbers or file extension)
    const contentType = this.detectContentType(file);
    
    if (!this.ALLOWED_TYPES.includes(contentType)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
    }
    
    // Generate unique path
    const filename = `${ownerId}_${Date.now()}.jpg`;
    const path = `profiles/${filename}`;
    
    // Upload to storage
    const request: UploadFileRequest = {
      file,
      filename,
      contentType,
      path,
      ownerId
    };
    
    const result = await this.storageProvider.upload(request);
    
    return result;
  }
  
  private detectContentType(file: Buffer): string {
    // Simple detection based on file signature
    const signature = file.slice(0, 4).toString('hex');
    
    if (signature.startsWith('ffd8ff')) {
      return 'image/jpeg';
    } else if (signature === '89504e47') {
      return 'image/png';
    } else if (signature === '52494646') {
      return 'image/webp';
    }
    
    return 'application/octet-stream';
  }
}
```

### Composition Root (Single Swap Point)

```typescript
// app/config/storage-config.ts
import { StorageProvider } from '@/domains/storage/repositories/storage-provider';
import { SupabaseStorageAdapter } from '@/infrastructure/external/supabase-storage-adapter';

// Current implementation
export const storageProvider: StorageProvider = new SupabaseStorageAdapter();

// Future migration: Just change this one line
// export const storageProvider: StorageProvider = new CloudflareR2Adapter();
// export const storageProvider: StorageProvider = new MinioAdapter();
```

---

## Revised Consequences

### Positive Consequences (Updated)

- ✅ **Unified authentication**: Same pattern as auth provider abstraction
- ✅ **RLS policies**: Can implement access control in domain layer
- ✅ **CDN delivery**: Both Supabase and R2 provide CDN-backed delivery
- ✅ **Simple API**: Consistent interface across providers
- ✅ **Cost optimization**: Can migrate to cheaper storage if needed
- ✅ **Vendor independence**: No lock-in to Supabase Storage
- ✅ **GDPR compliance**: Can choose provider based on data residency

### Negative Consequences (Updated)

- ⚠️ **1GB limit**: Supabase free tier may be reached with high-res photos
- ⚠️ **Image optimization**: Still requires client-side compression
- ⚠️ **Abstraction overhead**: Initial 10-17 hours investment
- ⚠️ **Multiple providers**: Need to maintain adapters for each storage option

### Risks (Updated)

- ⚠️ **Inappropriate uploads**: Requires client-side validation
- ⚠️ **Storage quota**: Large images consume quota quickly
- ⚠️ **No auto-optimization**: May impact page load performance
- ✅ **Mitigated**: Vendor lock-in reduced by DDD abstraction

---

## Migration Scenarios

### Scenario 1: Supabase Storage → Cloudflare R2

**Trigger:** Need to reduce costs or avoid egress fees

**Benefits of R2:**
- 10GB free storage (vs 1GB with Supabase)
- No egress fees (Supabase charges for downloads)
- S3-compatible API

**Effort:** 8-14 hours
1. Create `CloudflareR2Adapter` implementing `StorageProvider` (4-6 hours)
2. Update composition root (0.5 hours)
3. Migrate existing files (2-3 hours)
4. Test new provider (2-3 hours)
5. Deploy (0.5 hours)

**Zero changes to:**
- Domain layer
- Application layer
- Interface layer
- Business logic

### Scenario 2: Supabase Storage → MinIO (Self-Hosted)

**Trigger:** Need full data control for self-hosted deployments

**Effort:** 8-14 hours
1. Create `MinioAdapter` implementing `StorageProvider` (4-6 hours)
2. Update composition root (0.5 hours)
3. Test new provider (2-3 hours)
4. Deploy (0.5 hours)

---

## Comparison: With vs Without DDD Abstraction

| Aspect | Without DDD (Original ADR-005) | With DDD (This Amendment) |
|--------|-------------------------------|---------------------------|
| **Migration Cost** | 52-112 hours | 8-14 hours |
| **Files Changed** | 50-200+ | 2-3 |
| **Risk Level** | High | Low |
| **Downtime** | Possible | None |
| **Business Logic Changes** | Required | None |
| **Testing Effort** | Full regression | Adapter tests only |
| **Vendor Lock-in** | High | Low |

---

## Cost Comparison: Storage Providers

| Provider | Free Tier | Egress Fees | Best For |
|----------|-----------|-------------|----------|
| **Supabase Storage** | 1GB storage, 2GB/month bandwidth | Included in free tier | MVP, small events |
| **Cloudflare R2** | 10GB storage, 10GB/month Class A ops | **No egress fees** | High traffic, cost optimization |
| **MinIO** | Self-hosted (your infrastructure) | Your infrastructure costs | Full control, data residency |
| **AWS S3** | 5GB for 12 months | $0.09/GB after free tier | Enterprise, existing AWS users |

**Recommendation:** Start with Supabase for MVP, migrate to Cloudflare R2 if storage needs grow beyond 1GB.

---

## Links

* [ADR-002b: Authentication Strategy and Vendor Abstraction](./_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md)
* [ADR-009: Domain-Driven Design Structure](./009-adopt-domain-driven-design-structure.md)
* [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
* [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
* [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
* [AWS S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

---

## Decision

**Status:** ✅ **APPROVED**

**Approved By:** Technical Lead, Product Team  
**Approval Date:** 2026-06-25

**Decision:** Storage with DDD Abstraction

**This Amendment Supersedes:**
- Original ADR-005 assumption of tight Supabase Storage coupling
- Migration cost estimates (updated from 52-112 hours to 8-14 hours)
- Vendor lock-in assessment (reduced from High to Low)

**Implementation Directive:**
- [x] Implement `StorageProvider` interface as the storage port
- [x] Create vendor-specific adapters (SupabaseStorageAdapter, CloudflareR2Adapter, etc.)
- [x] All file operations must go through the abstraction
- [x] Application layer depends only on `StorageProvider` interface
- [ ] Begin implementation of storage abstraction

---

## Appendix: Testing Strategy

### Unit Tests with Mock Provider

```typescript
// tests/unit/storage/upload-profile-photo.test.ts
import { UploadProfilePhotoUseCase } from '@/application/storage/upload-profile-photo-use-case';
import { StorageProvider, UploadFileRequest, UploadFileResult } from '@/domains/storage/repositories/storage-provider';

// Mock provider for testing
class MockStorageProvider implements StorageProvider {
  uploadCalls: UploadFileRequest[] = [];
  
  async upload(request: UploadFileRequest): Promise<UploadFileResult> {
    this.uploadCalls.push(request);
    
    return {
      fileId: 'mock-file-id',
      url: 'https://mock-storage.example.com/profiles/test.jpg',
      metadata: {
        id: 'mock-file-id',
        filename: request.filename,
        contentType: request.contentType,
        size: request.file.length,
        uploadedAt: new Date(),
        ownerId: request.ownerId
      }
    };
  }
  
  async download(path: string): Promise<Buffer> {
    return Buffer.from('mock file content');
  }
  
  async getUrl(path: string): Promise<string> {
    return `https://mock-storage.example.com/${path}`;
  }
  
  async delete(path: string): Promise<void> {}
  async exists(path: string): Promise<boolean> { return true; }
}

describe('UploadProfilePhotoUseCase', () => {
  it('should upload file successfully', async () => {
    const mockStorage = new MockStorageProvider();
    const useCase = new UploadProfilePhotoUseCase(mockStorage);
    
    const file = Buffer.from('mock image data');
    const result = await useCase.execute(file, 'user-123');
    
    expect(result.fileId).toBe('mock-file-id');
    expect(mockStorage.uploadCalls.length).toBe(1);
    expect(mockStorage.uploadCalls[0].ownerId).toBe('user-123');
  });
  
  it('should reject files larger than 5MB', async () => {
    const mockStorage = new MockStorageProvider();
    const useCase = new UploadProfilePhotoUseCase(mockStorage);
    
    const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
    
    await expect(useCase.execute(largeFile, 'user-123'))
      .rejects
      .toThrow('File too large');
  });
  
  it('should reject invalid file types', async () => {
    const mockStorage = new MockStorageProvider();
    const useCase = new UploadProfilePhotoUseCase(mockStorage);
    
    const pdfFile = Buffer.from('PDF content', 'utf-8');
    
    await expect(useCase.execute(pdfFile, 'user-123'))
      .rejects
      .toThrow('Invalid file type');
  });
});
```

**Benefits:**
- ✅ No external storage dependencies in tests
- ✅ Tests run in milliseconds
- ✅ Can test error scenarios easily
- ✅ Can verify business logic without actual uploads
