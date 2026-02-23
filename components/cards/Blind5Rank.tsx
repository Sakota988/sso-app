import { useRef, useState } from 'react';
import { useGameStore, type Blind5RankResult } from '../../store/gameStore';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import type { Blind5RankCard } from '../../types/deck';
import ShareResultCard from '../ShareResultCard';
import ShareButton from '../ShareButton';
import CardTitle from './CardTitle';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W     = width - 48;
const HEADER_TOP = isSmall ? 44 : 64;
const PANEL_H = isSmall ? 120 : 155;
const RANK_BTN_SIZE = Math.floor((CARD_W - 48 - 40) / 5);

type Props = {
  card: Blind5RankCard;
  onBack: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

export default function Blind5Rank({ card, onBack, deckId }: Props) {
  const { items, labels } = card;
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
        {/* Header */}
        <View style={[styles.header, { paddingTop: HEADER_TOP }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeft size={20} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require('../../assets/na_slepo_back.png')}
              style={styles.titleImage}
              resizeMode="contain"
            />
            {!!card.description && (
              <Text style={styles.gameDesc} numberOfLines={1}>
                {card.description}
              </Text>
            )}
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              {isDone ? total : index + 1} / {total}
            </Text>
          </View>
        </View>

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

        <CardTitle title={card.title} />

        {/* Card area */}
        <View style={styles.cardArea}>
          {isDone ? (
            <View style={[styles.doneCard, { width: CARD_W }]}>
              <Text style={styles.doneEmoji}>🏆</Text>
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

              <TouchableOpacity
                style={styles.restartBtn}
                onPress={handleRestart}
                activeOpacity={0.8}
              >
                <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
              </TouchableOpacity>

              <ShareButton viewRef={shareCardRef} />
            </View>
          ) : (
            <Animated.View
              style={[
                styles.itemCard,
                { width: CARD_W },
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
                      style={[styles.rankBtn, isTaken && styles.rankBtnTaken]}
                      onPress={() => handleRank(n)}
                      disabled={isTaken}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.rankBtnText, isTaken && styles.rankBtnTextTaken]}>
                        {n}
                      </Text>
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

  // ── Card area ───────────────────────────────────────────────────
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // ── Item card ───────────────────────────────────────────────────
  itemCard: {
    backgroundColor: '#3D5AF1',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 20 : 28,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: isSmall ? 22 : 30,
    fontWeight: '900',
    color: '#fff',
    marginBottom: isSmall ? 20 : 28,
    letterSpacing: -0.3,
    lineHeight: isSmall ? 28 : 38,
  },
  rankPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  rankBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  rankBtn: {
    width: RANK_BTN_SIZE,
    height: RANK_BTN_SIZE,
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
    fontSize: isSmall ? 18 : 22,
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

  // ── Done card ───────────────────────────────────────────────────
  doneCard: {
    backgroundColor: '#3D5AF1',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 20 : 28,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    gap: 6,
  },
  doneEmoji: { fontSize: isSmall ? 36 : 44 },
  doneTxt: { fontSize: isSmall ? 22 : 28, fontWeight: '900', color: '#fff' },
  doneSubTxt: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginBottom: 8,
  },
  doneSummary: {
    alignSelf: 'stretch',
    gap: 8,
    marginBottom: 8,
  },
  doneSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  doneRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FF6B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneRankText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  doneItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  restartBtn: {
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
  },
  restartBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },

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
