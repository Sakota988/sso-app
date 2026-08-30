import { useCallback, useRef, useState, type ReactElement, type ReactNode } from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  type RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ensureMinRefreshVisible } from './AppRefreshControl';
import { runDedupedRefresh } from '../../lib/api/refreshPolicy';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPINNER_COLOR = '#FF6B1A';
const SPINNER_BG = '#FFFFFF';

type Props = {
  children: ReactNode;
  /** Pass a pre-built control (e.g. from usePullToRefresh). */
  refreshControl?: ReactElement<RefreshControlProps>;
  /** Or let this component manage refresh internally. */
  dedupeKey?: string;
  onRefreshData?: () => Promise<void>;
  progressViewOffset?: number;
};

export default function RefreshableScrollView({
  children,
  refreshControl: externalRefreshControl,
  dedupeKey,
  onRefreshData,
  progressViewOffset,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefreshData);
  onRefreshRef.current = onRefreshData;
  const insets = useSafeAreaInsets();

  const androidOffset = progressViewOffset ?? insets.top + 8;

  const handleRefresh = useCallback(async () => {
    if (!dedupeKey || !onRefreshRef.current) return;
    const startedAt = Date.now();
    setRefreshing(true);
    try {
      await runDedupedRefresh(dedupeKey, () => onRefreshRef.current!());
    } finally {
      await ensureMinRefreshVisible(startedAt);
      setRefreshing(false);
    }
  }, [dedupeKey]);

  const refreshControl =
    externalRefreshControl ??
    (dedupeKey && onRefreshData ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={SPINNER_COLOR}
        colors={[SPINNER_COLOR, '#FF8C42']}
        progressBackgroundColor={SPINNER_BG}
        {...(Platform.OS === 'android' ? { progressViewOffset: androidOffset } : {})}
      />
    ) : undefined);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
      nestedScrollEnabled
      alwaysBounceVertical
      bounces
      overScrollMode="always"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1, minHeight: SCREEN_HEIGHT + 1 },
});
