export class Result<T> {
  static ok<T>(value: T): Result<T> {
    return new Result<T>(value, undefined, false);
  }

  static fail<T>(error: string): Result<T> {
    return new Result<T>(undefined, error, true);
  }

  static fromError<T>(error: Error): Result<T> {
    return new Result<T>(undefined, error.message, true);
  }

  private constructor(
    public readonly value: T | undefined,
    public readonly error: string | undefined,
    public readonly isFailure: boolean,
  ) {}

  get isOk(): boolean {
    return !this.isFailure;
  }
}
