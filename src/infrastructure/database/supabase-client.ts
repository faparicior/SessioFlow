export type SupabaseTable<T> = {
  select(_columns?: string): {
    eq(_column: string, _value: unknown): SupabaseQuery<T>;
  };
  insert(_data: Partial<T>): {
    eq(_column: string, _value: unknown): SupabaseQuery<T>;
  };
  upsert(_data: Partial<T>): {
    eq(_column: string, _value: unknown): SupabaseQuery<T>;
  };
  delete(): {
    eq(_column: string, _value: unknown): SupabaseQuery<T>;
  };
  eq(_column: string, _value: unknown): SupabaseQuery<T>;
  order(_column: string, _options?: {ascending?: boolean}): {
    eq(_column: string, _value: unknown): SupabaseQuery<T>;
  };
};

export type SupabaseQuery<T> = {
  eq(_column: string, _value: unknown): SupabaseQuery<T>;
  single(): Promise<{data: T | undefined; error: Error | undefined}>;
  maybeSingle(): Promise<{data: T[] | undefined; error: Error | undefined}>;
};

export type SupabaseClient = {
  from<T>(table: string): SupabaseTable<T>;
};

export class InMemoryConferenceClient implements SupabaseClient {
  from<T>(_table: string): SupabaseTable<T> {
    return {
      select() {
        return {eq: () => ({single: async () => ({data: null, error: null})})};
      },
      insert() {
        return {eq: () => ({single: async () => ({data: null, error: null})})};
      },
      upsert() {
        return {eq: () => ({single: async () => ({data: null, error: null})})};
      },
      delete() {
        return {eq: () => ({single: async () => ({data: null, error: null})})};
      },
      eq() {
        return {single: async () => ({data: null, error: null})};
      },
      order() {
        return {eq: () => ({single: async () => ({data: null, error: null})})};
      },
    };
  }
}
