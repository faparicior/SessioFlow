export class ConferenceSlug {
  static generate(name: string): ConferenceSlug {
    const slugValue = name
      .toLowerCase()
      .replaceAll(/[^a-z\d]+/gv, '-')
      .replaceAll(/^-+|-+$/gv, '');
    return new ConferenceSlug(slugValue);
  }

  static create(value: string): ConferenceSlug {
    return new ConferenceSlug(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ConferenceSlug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private constructor(private readonly value: string) {}
}
