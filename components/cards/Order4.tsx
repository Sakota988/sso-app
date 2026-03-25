import { useRef, useState } from 'react';
import { useGameStore, type Order4Result } from '../../store/gameStore';
import {
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Order4Card } from '../../types/deck';
import { shuffle } from '../../utils/shuffle';
import CardHeader from '../common/CardHeader';
import CardTitle from '../common/CardTitle';
import ShareResultCard from '../ShareResultCard';
import Order4CardArea from './Order4CardArea';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W = width - 48;
const PANEL_H = isSmall ? 130 : 160;

type Props = {
  card: Order4Card;
  onBack: () => void;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

export default function Order4({ card, onBack, onNext, deckId }: Props) {
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
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFCB96' }]} />

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

        <Order4CardArea
          cardWidth={CARD_W}
          isDone={isDone}
          question={card.question}
          displayItems={displayItems}
          userOrder={userOrder}
          correctOrder={[...card.correctOrder]}
          score={score}
          isPerfect={isPerfect}
          onTap={handleTap}
          onUndo={handleUndo}
          onOpenSource={handleOpenSource}
          onRestart={handleRestart}
          onNext={onNext}
          shareCardRef={shareCardRef}
          fadeAnim={fadeAnim}
          answer={card.answer}
        />

        {/* ── Bottom panel — order being built ── */}
        {!isDone && (
          <View style={[styles.panel, { height: PANEL_H }]}>
            <Text style={styles.panelHead}>
              {userOrder.length === 0 ? 'TAPNI DA POREĐAŠ' : 'TVOJ REDOSLED'}
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

  // ── Bottom panel ─────────────────────────────────────────────────
  panel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: isSmall ? 12 : 16,
    paddingHorizontal: 16,
    paddingBottom: isSmall ? 16 : 24,
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
