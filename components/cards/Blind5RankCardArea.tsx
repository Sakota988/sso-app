import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Trophy } from 'lucide-react-native';
import ShareButton from '../ShareButton';
import DoneCardButtons from '../common/DoneCardButtons';

const { height } = Dimensions.get('window');
const isSmall = height < 700;

type Props = {
  cardWidth: number;
  isDone: boolean;
  items: string[];
  index: number;
  total: number;
  labels: { rank1: string; rank5: string };
  ranks: Record<string, number>;
  rankedItems: string[];
  onRank: (rank: number) => void;
  onRestart: () => void;
  onNext: () => void;
  shareCardRef: React.RefObject<View | null>;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
};

const rankBtnSize = (w: number) => Math.floor((w - 48 - 40) / 5);

export default function Blind5RankCardArea({
  cardWidth,
  isDone,
  items,
  index,
  total,
  labels,
  ranks,
  rankedItems,
  onRank,
  onRestart,
  onNext,
  shareCardRef,
  fadeAnim,
  slideAnim,
}: Props) {
  const usedRanks = new Set(Object.values(ranks));
  const RANK_BTN = rankBtnSize(cardWidth);

  return (
    <View style={styles.cardArea}>
      {isDone ? (
        <View style={[styles.doneCard, { width: cardWidth }]}>
          <Trophy size={isSmall ? 28 : 34} color="#FFD700" strokeWidth={1.8} />
          <Text style={styles.doneTxt}>Gotovo!</Text>
          <Text style={styles.doneSubTxt}>Tvoj ranking</Text>

          <View style={styles.doneSummary}>
            {rankedItems.map((item) => (
              <View key={item} style={styles.doneSummaryRow}>
                <View style={styles.doneRankBadge}>
                  <Text style={styles.doneRankText}>{ranks[item]}</Text>
                </View>
                <Text style={styles.doneItemText} numberOfLines={2}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <DoneCardButtons onNext={onNext} onRestart={onRestart} marginTop={6} />

          <ShareButton viewRef={shareCardRef} />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.itemCard,
            { width: cardWidth },
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={styles.itemLabel}>STAVKA {index + 1} / {total}</Text>
          <Text style={styles.itemTitle}>{items[index]}</Text>

          <Text style={styles.rankPrompt}>Odaberi rang:</Text>

          <View style={styles.rankBtnRow}>
            {[1, 2, 3, 4, 5].map((n) => {
              const isTaken = usedRanks.has(n);
              return (
                <TouchableOpacity
                  key={n}
                  style={[styles.rankBtn, { width: RANK_BTN, height: RANK_BTN }, isTaken && styles.rankBtnTaken]}
                  onPress={() => onRank(n)}
                  disabled={isTaken}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.rankBtnText, isTaken && styles.rankBtnTextTaken]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rankLegendRow}>
            <Text style={styles.rankLegendHint}>{labels.rank1}</Text>
            <Text style={styles.rankLegendHint}>{labels.rank5}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#3D5AF1',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 12 : 14,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: isSmall ? 15 : 17,
    fontWeight: '900',
    color: '#fff',
    marginBottom: isSmall ? 10 : 12,
    letterSpacing: -0.3,
    lineHeight: isSmall ? 20 : 24,
  },
  rankPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  rankBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rankBtn: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBtnTaken: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  rankBtnText: {
    fontSize: isSmall ? 16 : 19,
    fontWeight: '900',
    color: '#fff',
  },
  rankBtnTextTaken: { color: 'rgba(255,255,255,0.2)' },
  rankLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankLegendHint: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  doneCard: {
    backgroundColor: '#3D5AF1',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 12 : 16,
    alignItems: 'center',
    gap: 4,
  },
  doneTxt: { fontSize: isSmall ? 18 : 22, fontWeight: '900', color: '#fff' },
  doneSubTxt: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginBottom: 4,
  },
  doneSummary: {
    alignSelf: 'stretch',
    gap: 6,
    marginBottom: 6,
  },
  doneSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 10,
  },
  doneRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FF6B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneRankText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  doneItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
