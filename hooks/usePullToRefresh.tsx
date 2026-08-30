import { useCallback, useRef, useState } from 'react';
import AppRefreshControl, { ensureMinRefreshVisible } from '../components/common/AppRefreshControl';
import { runDedupedRefresh } from '../lib/api/refreshPolicy';

type Options = {
  /** Used only to dedupe concurrent pulls for the same resource. */
  dedupeKey: string;
  onRefresh: () => Promise<void>;
  progressViewOffset?: number;
};

export function usePullToRefresh({
  dedupeKey,
  onRefresh,
  progressViewOffset,
}: Options) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const handleRefresh = useCallback(async () => {
    const startedAt = Date.now();
    setRefreshing(true);
    try {
      await runDedupedRefresh(dedupeKey, () => onRefreshRef.current());
    } catch {
      // Screen callback handles errors silently during refresh.
    } finally {
      await ensureMinRefreshVisible(startedAt);
      setRefreshing(false);
    }
  }, [dedupeKey]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    refreshControlProps: {
      refreshing,
      onRefresh: handleRefresh,
      progressViewOffset,
    },
  };
}

export { AppRefreshControl };
