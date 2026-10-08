// A tiny in-memory cache so pages can show recently loaded data instantly
// and then refresh it in the background. It lives only in this browser tab's
// memory (nothing is saved to disk) and is wiped when someone signs out.
const store = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  store.set(key, value);
}

// Forget everything (used on sign-out so no account data is left behind).
export function clearCache(): void {
  store.clear();
}
