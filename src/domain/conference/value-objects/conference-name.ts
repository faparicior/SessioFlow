import {Result} from '@/domain/shared/result.ts';

export class ConferenceName {
  static create(name: string): Result<ConferenceName> {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return Result.fail('Conference name cannot be empty');
    }

    if (trimmed.length < 3) {
      return Result.fail('Conference name must be at least 3 characters');
    }

    if (trimmed.length > 100) {
      return Result.fail('Conference name cannot exceed 100 characters');
    }

    return Result.ok(new ConferenceName(trimmed));
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ConferenceName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private constructor(private readonly value: string) {}
}
