import { Platform, RefreshControl, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPINNER_COLOR = '#FF6B1A';
const SPINNER_BG = '#FFFFFF';

type Props = Pick<RefreshControlProps, 'refreshing' | 'onRefresh'> & {
  progressViewOffset?: number;
};

export default function AppRefreshControl({ refreshing, onRefresh, progressViewOffset }: Props) {
  const insets = useSafeAreaInsets();
  const androidOffset = progressViewOffset ?? insets.top + 8;

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={SPINNER_COLOR}
      colors={[SPINNER_COLOR, '#FF8C42']}
      progressBackgroundColor={SPINNER_BG}
      {...(Platform.OS === 'android' ? { progressViewOffset: androidOffset } : {})}
    />
  );
}

export const REFRESH_MIN_VISIBLE_MS = 450;

export async function ensureMinRefreshVisible(startedAt: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  const remaining = REFRESH_MIN_VISIBLE_MS - elapsed;
  if (remaining > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, remaining));
  }
}
