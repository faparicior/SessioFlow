/**
 * Typed reader for the platform's JSON envelope (`{ data }` on success,
 * `{ error: { code, message } }` on failure — AGENTS.md response conventions /
 * `mapDomainErrorToResponse`).
 *
 * Lives in `src/lib` and is imported with relative paths: the frontend `xo`
 * type-aware lint program cannot resolve the `@frontend/*` / `@/*` aliases, so
 * alias imports only survive when used as JSX components — anything actually
 * called must be imported relatively to stay type-checked (and lintable).
 */
export type ApiError = {
  code?: string;
  message?: string;
};

export type ApiEnvelope<T> = {
  data?: T;
  error?: ApiError;
};

/**
 * Reads the envelope defensively: empty or non-JSON bodies resolve to an empty
 * envelope so callers can fall back to a generic message.
 */
export async function readEnvelope<T>(
  response: Response,
): Promise<ApiEnvelope<T>> {
  const text = await response.text();

  if (text === '') {
    return {};
  }

  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return {};
  }
}

/** Convenience fallback message when the API returned no `error.message`. */
export const GENERIC_FAILURE_MESSAGE =
  'Something went wrong. Please try again.';

/** Extracts a user-facing message from an API error envelope. */
export function describeApiError(envelope: ApiEnvelope<unknown>): string {
  return envelope.error?.message ?? GENERIC_FAILURE_MESSAGE;
}
