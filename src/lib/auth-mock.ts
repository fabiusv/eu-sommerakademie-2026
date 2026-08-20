// Frontend-only placeholder for the future authentication backend.
// Swap the body of this function for a real request (e.g. a server action or
// `fetch("/api/auth/...")`) once auth is implemented — every caller already
// treats this as an async boundary, so nothing above it needs to change.

export type MockAuthPayload = Record<string, string>;

export async function mockAuthRequest(_payload: MockAuthPayload): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 850 + Math.random() * 350));
}
