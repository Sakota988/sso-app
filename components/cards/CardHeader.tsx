import type { ViewStyle } from 'react-native';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

const { height } = Dimensions.get('window');
const isSmall = height < 700;
const HEADER_TOP = isSmall ? 44 : 64;

type Props = {
  imageSource: ReturnType<typeof require>;
  onBack: () => void;
  description?: string;
  rightSlot: React.ReactNode;
  progressPillStyle?: ViewStyle;
};

export default function CardHeader({
  imageSource,
  onBack,
  description,
  rightSlot,
  progressPillStyle,
}: Props) {
  return (
    <View style={[styles.header, { paddingTop: HEADER_TOP }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
        <ArrowLeft size={20} color="#1A1A1A" strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Image source={imageSource} style={styles.titleImage} resizeMode="cover" />
        {!!description && (
          <Text style={styles.gameDesc} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      <View style={[styles.progressPill, progressPillStyle]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  titleImage: {
    width: '100%',
    height: 45,
  },
  gameDesc: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  progressPill: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 52,
    alignItems: 'center',
  },
});
