import { useCallback } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { CheckCircle2, GripVertical, ThumbsUp, Trophy, XCircle } from 'lucide-react-native';
import ShareButton from '../ShareButton';
import DoneCardButtons from '../common/DoneCardButtons';

const { height } = Dimensions.get('window');
const isSmall = height < 700;
const ACCENT = '#9D174D';

type Props = {
  cardWidth: number;
  isDone: boolean;
  question: string;
  userOrder: string[];
  answers: string[];
  score: number;
  isPerfect: boolean;
  onReorder: (next: string[]) => void;
  onSubmit: () => void;
  onRestart: () => void;
  onNext: () => void;
  shareCardRef: React.RefObject<View | null>;
  fadeAnim: Animated.Value;
};

export default function TopXCardArea({
  cardWidth,
  isDone,
  question,
  userOrder,
  answers,
  score,
  isPerfect,
  onReorder,
  onSubmit,
  onRestart,
  onNext,
  shareCardRef,
  fadeAnim,
}: Props) {
  const n = answers.length;

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<string>) => {
      const index = getIndex() ?? 0;
      return (
        <ScaleDecorator>
          <TouchableOpacity
            style={[styles.optionRow, isActive && styles.optionRowActive]}
            onLongPress={drag}
            delayLongPress={160}
            disabled={isActive}
            activeOpacity={0.85}
            accessibilityLabel={item}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.optionText} numberOfLines={2}>
              {item}
            </Text>
            <GripVertical size={18} color="rgba(255,255,255,0.55)" strokeWidth={2.2} />
          </TouchableOpacity>
        </ScaleDecorator>
      );
    },
    [],
  );

  return (
    <View style={styles.cardArea}>
      <Animated.View style={[{ width: cardWidth, flex: 1 }, { opacity: fadeAnim }]}>
        {!isDone ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PITANJE</Text>
            <Text style={styles.questionText}>{question}</Text>
            <Text style={styles.dragHint}>Zadrži i prevuci da promeniš redosled</Text>

            <DraggableFlatList
              data={userOrder}
              keyExtractor={(item) => item}
              onDragEnd={({ data }) => onReorder(data)}
              renderItem={renderItem}
              containerStyle={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} activeOpacity={0.8}>
              <Text style={styles.submitBtnTxt}>PROVERI LISTU</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.resultScroll}
            contentContainerStyle={styles.resultCard}
            showsVerticalScrollIndicator={false}
          >
            {isPerfect ? (
              <Trophy size={isSmall ? 36 : 44} color="#FFD700" strokeWidth={1.8} />
            ) : score >= Math.ceil(n / 2) ? (
              <ThumbsUp size={isSmall ? 36 : 44} color="#4ADE80" strokeWidth={1.8} />
            ) : (
              <XCircle size={isSmall ? 36 : 44} color="#FB923C" strokeWidth={1.8} />
            )}
            <Text style={styles.resultTitle}>
              {isPerfect ? 'Savršeno!' : score >= Math.ceil(n / 2) ? 'Dobro!' : 'Skoro!'}
            </Text>
            <Text style={styles.resultScore}>
              {score} / {n} tačno
            </Text>

            <View style={styles.comparisonBlock}>
              <View style={styles.comparisonCol}>
                <Text style={styles.comparisonHead}>TVOJ REDOSLED</Text>
                {userOrder.map((item, i) => {
                  const correct = item === answers[i];
                  return (
                    <View
                      key={`user-${item}`}
                      style={[styles.compRow, correct ? styles.compRowCorrect : styles.compRowWrong]}
                    >
                      <View
                        style={[
                          styles.compBadge,
                          correct ? styles.compBadgeCorrect : styles.compBadgeWrong,
                        ]}
                      >
                        <Text style={styles.compBadgeText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.compItemText} numberOfLines={2}>
                        {item}
                      </Text>
                      {correct ? (
                        <CheckCircle2 size={14} color="#10B981" strokeWidth={2.5} />
                      ) : (
                        <XCircle size={14} color="#EF4444" strokeWidth={2.5} />
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.comparisonCol}>
                <Text style={styles.comparisonHead}>TAČAN REDOSLED</Text>
                {answers.map((item, i) => (
                  <View key={`ans-${item}`} style={[styles.compRow, styles.compRowCorrectFull]}>
                    <View style={[styles.compBadge, styles.compBadgeCorrect]}>
                      <Text style={styles.compBadgeText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.compItemText} numberOfLines={2}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <ShareButton viewRef={shareCardRef} />
            <DoneCardButtons onNext={onNext} onRestart={onRestart} />
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 14 : 18,
    gap: isSmall ? 10 : 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.8,
  },
  questionText: {
    fontSize: isSmall ? 14 : 17,
    fontWeight: '800',
    color: '#fff',
    lineHeight: isSmall ? 20 : 24,
    letterSpacing: -0.2,
  },
  dragHint: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: isSmall ? 48 : 56,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  optionRowActive: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderColor: 'rgba(255,255,255,0.55)',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: isSmall ? 14 : 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.1,
  },
  submitBtn: {
    backgroundColor: '#FF6B1A',
    borderRadius: 14,
    paddingVertical: isSmall ? 12 : 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  submitBtnTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },
  resultScroll: {
    borderRadius: 24,
    flexGrow: 0,
    maxHeight: height * 0.75,
  },
  resultCard: {
    backgroundColor: ACCENT,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 18 : 24,
    alignItems: 'center',
    gap: isSmall ? 10 : 14,
  },
  resultTitle: {
    fontSize: isSmall ? 22 : 28,
    fontWeight: '900',
    color: '#fff',
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    marginTop: -6,
  },
  comparisonBlock: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
  },
  comparisonCol: {
    flex: 1,
    gap: 6,
  },
  comparisonHead: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  compRowCorrect: { backgroundColor: 'rgba(16,185,129,0.18)' },
  compRowWrong: { backgroundColor: 'rgba(239,68,68,0.18)' },
  compRowCorrectFull: { backgroundColor: 'rgba(255,255,255,0.1)' },
  compBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compBadgeCorrect: { backgroundColor: '#10B981' },
  compBadgeWrong: { backgroundColor: '#EF4444' },
  compBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  compItemText: {
    flex: 1,
    fontSize: isSmall ? 11 : 12,
    fontWeight: '700',
    color: '#fff',
  },
});
