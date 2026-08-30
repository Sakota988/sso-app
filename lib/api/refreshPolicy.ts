type RefreshEntry = {
  inFlight?: Promise<unknown>;
};

const entries = new Map<string, RefreshEntry>();

/** Prevents concurrent duplicate requests for the same key (e.g. double-pull). */
export async function runDedupedRefresh<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T | undefined> {
  let entry = entries.get(key);
  if (!entry) {
    entry = {};
    entries.set(key, entry);
  }

  if (entry.inFlight) {
    return entry.inFlight as Promise<T | undefined>;
  }

  const promise = fn().finally(() => {
    entry!.inFlight = undefined;
  });

  entry.inFlight = promise;
  return promise;
}
