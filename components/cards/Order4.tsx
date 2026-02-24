import { useRef, useState } from 'react';
import { useGameStore, type Order4Result } from '../../store/gameStore';
import {
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react-native';
import type { Order4Card } from '../../types/deck';
import { shuffle } from '../../utils/shuffle';
import CardHeader from './CardHeader';
import CardTitle from './CardTitle';
import ShareResultCard from '../ShareResultCard';
import ShareButton from '../ShareButton';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W = width - 48;
const HEADER_TOP = isSmall ? 44 : 64;
const PANEL_H = isSmall ? 130 : 160;

type Props = {
  card: Order4Card;
  onBack: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

export default function Order4({ card, onBack, deckId }: Props) {
  const stored = useGameStore(
    (s) =>
      s.results[card.cardId]?.type === 'ORDER_4'
        ? (s.results[card.cardId] as Order4Result)
        : undefined
  );

  const [userOrder, setUserOrder] = useState<string[]>(() => stored?.userOrder ?? []);
  const [displayItems, setDisplayItems] = useState<string[]>(() => shuffle([...card.items]));
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<View | null>(null);
  const saveResult = useGameStore((s) => s.saveResult);

  const isDone = userOrder.length === 4;

  function calcScore(order: string[]) {
    return order.reduce(
      (acc, item, i) => acc + (item === card.correctOrder[i] ? 1 : 0),
      0
    );
  }

  function fadeTransition(callback: () => void) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  function handleTap(item: string) {
    if (userOrder.includes(item) || isDone) return;
    const newOrder = [...userOrder, item];
    setUserOrder(newOrder);

    if (newOrder.length === 4) {
      fadeTransition(() => {
        saveResult({
          type: 'ORDER_4',
          cardId: card.cardId,
          deckId,
          cardTitle: card.title,
          userOrder: newOrder,
          correctOrder: [...card.correctOrder],
          score: calcScore(newOrder),
          playedAt: Date.now(),
        });
      });
    }
  }

  function handleUndo() {
    if (userOrder.length === 0 || isDone) return;
    setUserOrder((prev) => prev.slice(0, -1));
  }

  function handleRestart() {
    fadeTransition(() => {
      setUserOrder([]);
      setDisplayItems(shuffle([...card.items]));
    });
  }

  function handleOpenSource() {
    if (card.answer.sourceUrl) {
      Linking.openURL(card.answer.sourceUrl).catch(() => {});
    }
  }

  const score = isDone ? calcScore(userOrder) : 0;
  const isPerfect = score === 4;

  return (
    <View style={styles.root}>
      <ShareResultCard
        ref={shareCardRef}
        type="order4"
        cardTitle={card.title}
        question={card.question}
        userOrder={userOrder}
        correctOrder={[...card.correctOrder]}
        score={score}
      />
      <LinearGradient
        colors={['#FF9A5C', '#FFCB96', '#FFF3E6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      <View style={[styles.bgCircle, { width: 260, height: 260, top: -90, right: -90 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, top: 240, left: -70 }]} />
      <View style={[styles.bgCircle, { width: 110, height: 110, bottom: 230, right: -25 }]} />

      <View style={styles.safe}>
        <CardHeader
          imageSource={require('../../assets/titlovi/raspored_title.png')}
          onBack={onBack}
          description={card.description}
          rightSlot={
            isDone ? (
              <Text style={[styles.progressText, { color: isPerfect ? '#059669' : '#B45309' }]}>
                {score}/4
              </Text>
            ) : (
              <Text style={styles.progressText}>{userOrder.length}/4</Text>
            )
          }
          progressPillStyle={
            isDone ? (isPerfect ? styles.pillPerfect : styles.pillDone) : undefined
          }
        />

        {!isDone && <CardTitle title={card.title} color="#134E4A" />}

        {/* ── Card area ── */}
        <View style={styles.cardArea}>
          <Animated.View style={[{ width: CARD_W }, { opacity: fadeAnim }]}>
            {!isDone ? (
              /* ── Input phase ── */
              <View style={styles.card}>
                <Text style={styles.cardLabel}>PITANJE</Text>
                <Text style={styles.questionText}>{card.question}</Text>

                <View style={styles.itemsGrid}>
                  {displayItems.map((item) => {
                    const posIndex = userOrder.indexOf(item);
                    const isSelected = posIndex !== -1;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.itemBtn, isSelected && styles.itemBtnSelected]}
                        onPress={() => handleTap(item)}
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
                  <TouchableOpacity style={styles.undoBtn} onPress={handleUndo} activeOpacity={0.8}>
                    <Text style={styles.undoBtnTxt}>← Poništi zadnji</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* ── Result phase ── */
              <ScrollView
                style={styles.resultScroll}
                contentContainerStyle={styles.resultCard}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.resultEmoji}>
                  {isPerfect ? '🏆' : score >= 2 ? '👍' : '😅'}
                </Text>
                <Text style={styles.resultTitle}>
                  {isPerfect ? 'Savršeno!' : score >= 2 ? 'Dobro!' : 'Skoro!'}
                </Text>
                <Text style={styles.resultScore}>{score} / 4 tačno</Text>

                {/* Side-by-side comparison */}
                <View style={styles.comparisonBlock}>
                  <View style={styles.comparisonCol}>
                    <Text style={styles.comparisonHead}>TVOJ REDOSLIJED</Text>
                    {userOrder.map((item, i) => {
                      const correct = item === card.correctOrder[i];
                      return (
                        <View key={item} style={[styles.compRow, correct ? styles.compRowCorrect : styles.compRowWrong]}>
                          <View style={[styles.compBadge, correct ? styles.compBadgeCorrect : styles.compBadgeWrong]}>
                            <Text style={styles.compBadgeText}>{i + 1}</Text>
                          </View>
                          <Text style={styles.compItemText} numberOfLines={1}>{item}</Text>
                          {correct
                            ? <CheckCircle2 size={14} color="#10B981" strokeWidth={2.5} />
                            : <XCircle size={14} color="#EF4444" strokeWidth={2.5} />
                          }
                        </View>
                      );
                    })}
                  </View>

                  {!isPerfect && (
                    <View style={styles.comparisonCol}>
                      <Text style={styles.comparisonHead}>TAČAN REDOSLIJED</Text>
                      {card.correctOrder.map((item, i) => (
                        <View key={item} style={[styles.compRow, styles.compRowCorrectFull]}>
                          <View style={[styles.compBadge, styles.compBadgeCorrect]}>
                            <Text style={styles.compBadgeText}>{i + 1}</Text>
                          </View>
                          <Text style={styles.compItemText} numberOfLines={1}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Answer explanation */}
                <View style={styles.answerBlock}>
                  <Text style={styles.answerTitle}>{card.answer.title}</Text>
                  <Text style={styles.answerDesc}>{card.answer.description}</Text>

                  {!!card.answer.sourceUrl && (
                    <TouchableOpacity
                      style={styles.sourceBtn}
                      onPress={handleOpenSource}
                      activeOpacity={0.8}
                    >
                      <ExternalLink size={13} color="rgba(255,255,255,0.65)" strokeWidth={2} />
                      <Text style={styles.sourceBtnTxt}>Izvor</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <ShareButton viewRef={shareCardRef} />

                <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.8}>
                  <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Animated.View>
        </View>

        {/* ── Bottom panel — order being built ── */}
        {!isDone && (
          <View style={[styles.panel, { height: PANEL_H }]}>
            <Text style={styles.panelHead}>
              {userOrder.length === 0 ? 'TAPNI DA POREĐAŠ' : 'TVOJ REDOSLIJED'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.panelRow}
            >
              {userOrder.length === 0 ? (
                [1, 2, 3, 4].map((n) => (
                  <View key={n} style={styles.panelSlotEmpty}>
                    <Text style={styles.panelSlotNum}>{n}</Text>
                  </View>
                ))
              ) : (
                <>
                  {userOrder.map((item, i) => (
                    <View key={item} style={styles.panelSlot}>
                      <Text style={styles.panelSlotNum}>{i + 1}</Text>
                      <Text style={styles.panelSlotText} numberOfLines={2}>{item}</Text>
                    </View>
                  ))}
                  {Array.from({ length: 4 - userOrder.length }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.panelSlotEmpty}>
                      <Text style={styles.panelSlotNum}>{userOrder.length + i + 1}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // ── Header ──────────────────────────────────────────────────────
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
  gameLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F766E',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
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
    justifyContent: 'center',
  },
  pillPerfect: { backgroundColor: 'rgba(209,250,229,0.95)' },
  pillDone: { backgroundColor: 'rgba(254,243,199,0.95)' },
  progressText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },

  // ── Card area ────────────────────────────────────────────────────
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  // ── Input card ───────────────────────────────────────────────────
  card: {
    backgroundColor: '#134E4A',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 18 : 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    gap: isSmall ? 12 : 16,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.8,
  },
  questionText: {
    fontSize: isSmall ? 17 : 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: isSmall ? 24 : 28,
    letterSpacing: -0.2,
  },

  // ── Item buttons ─────────────────────────────────────────────────
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

  // ── Result card ──────────────────────────────────────────────────
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
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'center',
    gap: isSmall ? 10 : 14,
  },
  resultEmoji: { fontSize: isSmall ? 36 : 44 },
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

  // ── Comparison block ─────────────────────────────────────────────
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

  // ── Answer block ─────────────────────────────────────────────────
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

  restartBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
  },
  restartBtnTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
  },

  // ── Bottom panel ─────────────────────────────────────────────────
  panel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: isSmall ? 12 : 16,
    paddingHorizontal: 16,
    paddingBottom: isSmall ? 16 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
  },
  panelHead: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  panelRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  panelSlot: {
    width: isSmall ? 72 : 84,
    minHeight: isSmall ? 62 : 72,
    backgroundColor: '#134E4A',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  panelSlotEmpty: {
    width: isSmall ? 72 : 84,
    minHeight: isSmall ? 62 : 72,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelSlotNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F59E0B',
  },
  panelSlotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 15,
  },
});
