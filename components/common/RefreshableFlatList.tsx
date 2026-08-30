import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  type FlatListProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ensureMinRefreshVisible } from './AppRefreshControl';
import { runDedupedRefresh } from '../../lib/api/refreshPolicy';

const SPINNER_COLOR = '#FF6B1A';
const SPINNER_BG = '#FFFFFF';

type Props<T> = FlatListProps<T> & {
  dedupeKey: string;
  onRefreshData: () => Promise<void>;
  progressViewOffset?: number;
};

export default function RefreshableFlatList<T>({
  dedupeKey,
  onRefreshData,
  progressViewOffset,
  ...flatListProps
}: Props<T>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefreshData);
  onRefreshRef.current = onRefreshData;
  const insets = useSafeAreaInsets();

  const androidOffset =
    progressViewOffset ?? insets.top + (Platform.OS === 'android' ? 8 : 0);

  const handleRefresh = useCallback(async () => {
    const startedAt = Date.now();
    setRefreshing(true);
    try {
      await runDedupedRefresh(dedupeKey, () => onRefreshRef.current());
    } finally {
      await ensureMinRefreshVisible(startedAt);
      setRefreshing(false);
    }
  }, [dedupeKey]);

  return (
    <FlatList
      {...flatListProps}
      style={[{ flex: 1 }, flatListProps.style]}
      overScrollMode="always"
      alwaysBounceVertical
      bounces
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={SPINNER_COLOR}
          colors={[SPINNER_COLOR, '#FF8C42']}
          progressBackgroundColor={SPINNER_BG}
          {...(Platform.OS === 'android' ? { progressViewOffset: androidOffset } : {})}
        />
      }
    />
  );
}
