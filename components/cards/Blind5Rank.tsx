import { useRef, useState } from 'react';
import { useGameStore, type Blind5RankResult } from '../../store/gameStore';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Blind5RankCard } from '../../types/deck';
import { shuffle } from '../../utils/shuffle';
import ShareResultCard from '../ShareResultCard';
import CardHeader from '../common/CardHeader';
import CardTitle from '../common/CardTitle';
import Blind5RankCardArea from './Blind5RankCardArea';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W = width - 48;
const PANEL_H = isSmall ? 120 : 155;

type Props = {
  card: Blind5RankCard;
  onBack: () => void;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

export default function Blind5Rank({ card, onBack, onNext, deckId }: Props) {
  const { labels } = card;
  const [items, setItems] = useState<string[]>(() => shuffle([...card.items]));
  const total = items.length;

  const stored = useGameStore(
    (s) => s.results[card.cardId]?.type === 'BLIND_5_RANK'
      ? (s.results[card.cardId] as Blind5RankResult)
      : undefined
  );

  const [index, setIndex] = useState(() => (stored ? total : 0));
  const [ranks, setRanks] = useState<Record<string, number>>(() => stored?.ranks ?? {});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shareCardRef = useRef<View | null>(null);

  const saveResult = useGameStore((s) => s.saveResult);

  const isDone = index >= total;
  const usedRanks = new Set(Object.values(ranks));

  function animateTransition(callback: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 55, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(-30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  function handleRank(rank: number) {
    if (usedRanks.has(rank)) return;
    animateTransition(() => {
      const newRanks = { ...ranks, [items[index]]: rank };
      const nextIndex = index + 1;
      setRanks(newRanks);
      setIndex(nextIndex);

      if (nextIndex >= total) {
        saveResult({
          type: 'BLIND_5_RANK',
          cardId: card.cardId,
          deckId,
          cardTitle: card.title,
          ranks: newRanks,
          labels,
          playedAt: Date.now(),
        });
      }
    });
  }

  function handleRestart() {
    setIndex(0);
    setRanks({});
    setItems(shuffle([...card.items]));
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }

  const rankedItems = [...items]
    .filter((item) => ranks[item] !== undefined)
    .sort((a, b) => ranks[a] - ranks[b]);

  return (
    <View style={styles.root}>
      <ShareResultCard
        ref={shareCardRef}
        type="blind5rank"
        cardTitle={card.title}
        ranks={ranks}
        labels={labels}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFCB96' }]} />

      <View style={[styles.bgCircle, { width: 260, height: 260, top: -90, right: -90 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, top: 240, left: -70 }]} />
      <View style={[styles.bgCircle, { width: 110, height: 110, bottom: 230, right: -25 }]} />

      <View style={styles.safe}>
        <CardHeader
          imageSource={require('../../assets/titlovi/slepo_title.png')}
          onBack={onBack}
          description={card.description}
          titleImageStyle={{ height: 55 }}
          rightSlot={
            <Text style={styles.progressText}>
              {isDone ? total : index + 1} / {total}
            </Text>
          }
        />

        {/* Legend bar */}
        {/* <View style={styles.legendSection}>
          <Text style={styles.legendBound}>1 = {labels.rank1}</Text>
          <View style={styles.legendTrack}>
            {[1, 2, 3, 4, 5].map((n) => (
              <View
                key={n}
                style={[styles.legendDot, usedRanks.has(n) && styles.legendDotUsed]}
              />
            ))}
          </View>
          <Text style={styles.legendBound}>5 = {labels.rank5}</Text>
        </View> */}

        <CardTitle title={card.title} color="#3D5AF1" />

        <Blind5RankCardArea
          cardWidth={CARD_W}
          isDone={isDone}
          items={items}
          index={index}
          total={total}
          labels={labels}
          ranks={ranks}
          rankedItems={rankedItems}
          onRank={handleRank}
          onRestart={handleRestart}
          onNext={onNext}
          shareCardRef={shareCardRef}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />

        {/* Bottom panel — rankings so far */}
        {!isDone && (
          <View style={[styles.panel, { height: PANEL_H }]}>
            <Text style={styles.panelHead}>RANGIRANO</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              style={styles.panelScroll}
            >
              {rankedItems.length === 0 ? (
                <Text style={styles.panelEmpty}>—</Text>
              ) : (
                rankedItems.map((item) => (
                  <View key={item} style={styles.panelItem}>
                    <View style={styles.panelRankBadge}>
                      <Text style={styles.panelRankText}>{ranks[item]}</Text>
                    </View>
                    <Text style={styles.panelItemText} numberOfLines={1}>
                      {item}
                    </Text>
                  </View>
                ))
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
  titleImage: { width: '100%', height: 40 },
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
  progressText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },

  // ── Legend bar ──────────────────────────────────────────────────
  legendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  legendBound: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    flexShrink: 1,
  },
  legendTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  legendDotUsed: { backgroundColor: '#FF6B1A' },

  // ── Image Blind5Rank ────────────────────────────────────────────────
  imageBlind5Rank: {
    height: 55,
  },
  // ── Bottom panel ────────────────────────────────────────────────
  panel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: isSmall ? 12 : 16,
    paddingHorizontal: 20,
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
    color: '#FF6B1A',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelScroll: { flex: 1 },
  panelEmpty: { fontSize: 13, color: '#D1D5DB', fontStyle: 'italic' },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  panelRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#FF6B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelRankText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  panelItemText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
});
