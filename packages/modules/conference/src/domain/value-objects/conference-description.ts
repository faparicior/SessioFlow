export class ConferenceDescription {
  static create(value?: string): ConferenceDescription {
    return new ConferenceDescription(value?.trim() ?? '');
  }

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  equals(other: ConferenceDescription): boolean {
    return this._value === other._value;
  }
}
