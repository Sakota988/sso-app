import { useRef, useState } from 'react';
import { useGameStore, type Keep4Drop4Result } from '../../store/gameStore';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Keep4Drop4Card } from '../../types/deck';
import { shuffle } from '../../utils/shuffle';
import CardHeader from '../common/CardHeader';
import CardTitle from '../common/CardTitle';
import ShareResultCard from '../ShareResultCard';
import Keep4Drop4CardArea from './Keep4Drop4CardArea';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W = width - 48;
const PANEL_H = isSmall ? 140 : 190;
const HEADER_TOP = isSmall ? 44 : 64;

const MAX_KEEP = 4;

type Props = {
  card: Keep4Drop4Card;
  onBack: () => void;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

export default function Keep4Drop4({ card, onBack, onNext, deckId }: Props) {
  const [traits, setTraits] = useState<string[]>(() => shuffle([...card.traits]));
  const total = traits.length;

  const stored = useGameStore(
    (s) => s.results[card.cardId]?.type === 'KEEP_4_DROP_4'
      ? (s.results[card.cardId] as Keep4Drop4Result)
      : undefined
  );

  const [index, setIndex] = useState(() => (stored ? total : 0));
  const [kept, setKept] = useState<string[]>(() => stored?.kept ?? []);
  const [dropped, setDropped] = useState<string[]>(() => stored?.dropped ?? []);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shareCardRef = useRef<View | null>(null);

  const saveResult = useGameStore((s) => s.saveResult);

  const isDone = index >= total;
  const keepSlotsLeft = MAX_KEEP - kept.length;
  const remainingCount = total - index;
  const mustKeep = !isDone && keepSlotsLeft > 0 && remainingCount <= keepSlotsLeft;
  const mustDrop = !isDone && keepSlotsLeft <= 0;

  function animateTransition(dir: 1 | -1, callback: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * 55, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(-dir * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  function finish(finalKept: string[], finalDropped: string[]) {
    setKept(finalKept);
    setDropped(finalDropped);
    setIndex(total);
    saveResult({
      type: 'KEEP_4_DROP_4',
      cardId: card.cardId,
      deckId,
      cardTitle: card.title,
      kept: finalKept,
      dropped: finalDropped,
      playedAt: Date.now(),
    });
  }

  function handleKeep() {
    if (mustDrop || isDone) return;
    animateTransition(1, () => {
      const trait = traits[index];
      const newKept = [...kept, trait];

      // Kept the 4th — auto-drop everything remaining
      if (newKept.length >= MAX_KEEP) {
        finish(newKept, [...dropped, ...traits.slice(index + 1)]);
        return;
      }

      const nextIdx = index + 1;
      const newRemaining = total - nextIdx;
      const newSlots = MAX_KEEP - newKept.length;

      // Remaining traits ≤ empty keep slots — must keep all of them
      if (newRemaining > 0 && newRemaining <= newSlots) {
        finish([...newKept, ...traits.slice(nextIdx)], dropped);
      } else {
        setKept(newKept);
        setIndex(nextIdx);
      }
    });
  }

  function handleDrop() {
    if (mustKeep || isDone) return;
    animateTransition(-1, () => {
      const trait = traits[index];
      const newDropped = [...dropped, trait];

      const nextIdx = index + 1;
      const newRemaining = total - nextIdx;
      const currentSlots = MAX_KEEP - kept.length;

      // Remaining traits ≤ empty keep slots — must keep all of them
      if (newRemaining > 0 && newRemaining <= currentSlots) {
        finish([...kept, ...traits.slice(nextIdx)], newDropped);
      } else {
        setDropped(newDropped);
        setIndex(nextIdx);
      }
    });
  }

  return (
    <View style={styles.root}>
      <ShareResultCard
        ref={shareCardRef}
        type="keep4drop4"
        cardTitle={card.title}
        kept={kept}
        dropped={dropped}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFCB96' }]} />

      {/* Decorative background circles */}
      <View style={[styles.bgCircle, { width: 260, height: 260, top: -90, right: -90 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, top: 240, left: -70 }]} />
      <View style={[styles.bgCircle, { width: 110, height: 110, bottom: 230, right: -25 }]} />

      <View style={styles.safe}>
        {/* ── Header ── */}
        <CardHeader
          imageSource={require('../../assets/titlovi/zadrzi_title.png')}
          onBack={onBack}
          description={card.description}
          rightSlot={
            <Text style={styles.progressText}>
              {isDone ? total : index + 1} / {total}
            </Text>
          }
        />

        <CardTitle title={card.title} color="#3D5AF1" />

        <Keep4Drop4CardArea
          cardWidth={CARD_W}
          isDone={isDone}
          trait={isDone ? '' : traits[index]}
          mustKeep={mustKeep}
          mustDrop={mustDrop}
          keptCount={kept.length}
          showBack2={index + 2 < total}
          showBack1={index + 1 < total}
          onKeep={handleKeep}
          onDrop={handleDrop}
          onRestart={() => {
            setIndex(0);
            setKept([]);
            setDropped([]);
            setTraits(shuffle([...card.traits]));
            fadeAnim.setValue(1);
            slideAnim.setValue(0);
          }}
          onNext={onNext}
          shareCardRef={shareCardRef}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />

        {/* ── Bottom panel ── */}
        <View style={styles.panel}>
          <View style={styles.panelRow}>
            {/* Kept column */}
            <View style={styles.panelCol}>
              <Text style={styles.panelHeadKeep}>
                ✓ ZADRŽANO ({kept.length}/{MAX_KEEP})
              </Text>
              <ScrollView
                style={styles.panelScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {kept.length === 0 ? (
                  <Text style={styles.panelEmpty}>—</Text>
                ) : (
                  kept.map((t) => (
                    <Text key={t} style={styles.panelItemKeep}>
                      • {t}
                    </Text>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.panelDivider} />

            {/* Dropped column */}
            <View style={styles.panelCol}>
              <Text style={styles.panelHeadDrop}>
                ✕ IZBAČENO ({dropped.length})
              </Text>
              <ScrollView
                style={styles.panelScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {dropped.length === 0 ? (
                  <Text style={styles.panelEmpty}>—</Text>
                ) : (
                  dropped.map((t) => (
                    <Text key={t} style={styles.panelItemDrop}>
                      • {t}
                    </Text>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
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
    paddingTop: HEADER_TOP,
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
  progressText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },

  // ── Bottom panel ─────────────────────────────────────────────────
  panel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: isSmall ? 12 : 18,
    paddingHorizontal: 20,
    paddingBottom: isSmall ? 16 : 24,
    height: PANEL_H,
  },
  panelRow: {
    flexDirection: 'row',
    gap: 14,
    height: '100%',
  },
  panelCol: { flex: 1 },
  panelScroll: { maxHeight: PANEL_H - 60 },
  panelDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  panelHeadKeep: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelHeadDrop: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelEmpty: { fontSize: 13, color: '#D1D5DB', fontStyle: 'italic' },
  panelItemKeep: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 5,
    lineHeight: 18,
  },
  panelItemDrop: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 5,
    lineHeight: 18,
    textDecorationLine: 'line-through',
  },
});
