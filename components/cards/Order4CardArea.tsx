import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, ExternalLink, ThumbsUp, Trophy, XCircle } from 'lucide-react-native';
import type { OpenQuestionAnswer } from '../../types/deck';
import ShareButton from '../ShareButton';
import DoneCardButtons from '../common/DoneCardButtons';

const { height } = Dimensions.get('window');
const isSmall = height < 700;

type Props = {
  cardWidth: number;
  isDone: boolean;
  question: string;
  displayItems: string[];
  userOrder: string[];
  correctOrder: string[];
  score: number;
  isPerfect: boolean;
  onTap: (item: string) => void;
  onUndo: () => void;
  onOpenSource: () => void;
  onRestart: () => void;
  onNext: () => void;
  shareCardRef: React.RefObject<View | null>;
  fadeAnim: Animated.Value;
  answer: OpenQuestionAnswer;
};

export default function Order4CardArea({
  cardWidth,
  isDone,
  question,
  displayItems,
  userOrder,
  correctOrder,
  score,
  isPerfect,
  onTap,
  onUndo,
  onOpenSource,
  onRestart,
  onNext,
  shareCardRef,
  fadeAnim,
  answer,
}: Props) {
  return (
    <View style={styles.cardArea}>
      <Animated.View style={[{ width: cardWidth }, { opacity: fadeAnim }]}>
        {!isDone ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PITANJE</Text>
            <Text style={styles.questionText}>{question}</Text>

            <View style={styles.itemsGrid}>
              {displayItems.map((item) => {
                const posIndex = userOrder.indexOf(item);
                const isSelected = posIndex !== -1;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.itemBtn, isSelected && styles.itemBtnSelected]}
                    onPress={() => onTap(item)}
                    disabled={isSelected}
                    activeOpacity={0.75}
                  >
                    {isSelected && (
                      <View style={styles.positionBadge}>
                        <Text style={styles.positionBadgeText}>{posIndex + 1}</Text>
                      </View>
                    )}
                    <Text
                      style={[styles.itemBtnText, isSelected && styles.itemBtnTextSelected]}
                      numberOfLines={2}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {userOrder.length > 0 && (
              <TouchableOpacity style={styles.undoBtn} onPress={onUndo} activeOpacity={0.8}>
                <Text style={styles.undoBtnTxt}>← Poništi zadnji</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            style={styles.resultScroll}
            contentContainerStyle={styles.resultCard}
            showsVerticalScrollIndicator={false}
          >
            {isPerfect
              ? <Trophy size={isSmall ? 36 : 44} color="#FFD700" strokeWidth={1.8} />
              : score >= 2
                ? <ThumbsUp size={isSmall ? 36 : 44} color="#4ADE80" strokeWidth={1.8} />
                : <XCircle size={isSmall ? 36 : 44} color="#FB923C" strokeWidth={1.8} />
            }
            <Text style={styles.resultTitle}>
              {isPerfect ? 'Savršeno!' : score >= 2 ? 'Dobro!' : 'Skoro!'}
            </Text>
            <Text style={styles.resultScore}>{score} / 4 tačno</Text>

            <View style={styles.comparisonBlock}>
              <View style={styles.comparisonCol}>
                <Text style={styles.comparisonHead}>TVOJ REDOSLIJED</Text>
                {userOrder.map((item, i) => {
                  const correct = item === correctOrder[i];
                  return (
                    <View
                      key={item}
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
                      <Text style={styles.compItemText} numberOfLines={1}>
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

              {!isPerfect && (
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonHead}>TAČAN REDOSLIJED</Text>
                  {correctOrder.map((item, i) => (
                    <View key={item} style={[styles.compRow, styles.compRowCorrectFull]}>
                      <View style={[styles.compBadge, styles.compBadgeCorrect]}>
                        <Text style={styles.compBadgeText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.compItemText} numberOfLines={1}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.answerBlock}>
              <Text style={styles.answerTitle}>{answer.title}</Text>
              <Text style={styles.answerDesc}>{answer.description}</Text>

              {!!answer.sourceUrl && (
                <TouchableOpacity
                  style={styles.sourceBtn}
                  onPress={onOpenSource}
                  activeOpacity={0.8}
                >
                  <ExternalLink size={13} color="rgba(255,255,255,0.65)" strokeWidth={2} />
                  <Text style={styles.sourceBtnTxt}>Izvor</Text>
                </TouchableOpacity>
              )}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#134E4A',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 14 : 18,
    gap: isSmall ? 12 : 16,
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
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemBtn: {
    width: '47.5%',
    minHeight: isSmall ? 52 : 64,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemBtnSelected: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  positionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },
  itemBtnText: {
    fontSize: isSmall ? 13 : 15,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  itemBtnTextSelected: {
    color: 'rgba(255,255,255,0.3)',
  },
  undoBtn: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  undoBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.3,
  },
  resultScroll: {
    borderRadius: 24,
    flexGrow: 0,
    maxHeight: height * 0.75,
  },
  resultCard: {
    backgroundColor: '#134E4A',
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
  answerBlock: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: isSmall ? 12 : 16,
    gap: 6,
    alignItems: 'center',
  },
  answerTitle: {
    fontSize: isSmall ? 13 : 15,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  answerDesc: {
    fontSize: isSmall ? 12 : 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: isSmall ? 18 : 20,
    textAlign: 'center',
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  sourceBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.4,
  },
});
