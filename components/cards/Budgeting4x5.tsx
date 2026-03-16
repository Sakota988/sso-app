import { useRef, useState } from 'react';
import { useGameStore, type Budgeting4x5Result } from '../../store/gameStore';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Budgeting4x5Card } from '../../types/deck';
import ShareResultCard from '../ShareResultCard';
import CardHeader from '../common/CardHeader';
import CardTitle from '../common/CardTitle';
import Budgeting4x5CardArea from './Budgeting4x5CardArea';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W     = width - 40;
const HEADER_TOP = isSmall ? 44 : 64;
const PANEL_H    = isSmall ? 100 : 130;
type Props = {
  card: Budgeting4x5Card;
  onBack: () => void;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

type Selection = { label: string; cost: number; auto?: boolean };

export default function Budgeting4x5({ card, onBack, onNext, deckId }: Props) {
  const { categories, budgetTotal } = card;
  const total = categories.length;

  const stored = useGameStore(
    (s) => s.results[card.cardId]?.type === 'BUDGETING_4x5'
      ? (s.results[card.cardId] as Budgeting4x5Result)
      : undefined
  );

  const [index, setIndex] = useState(() => (stored ? total : 0));
  const [selections, setSelections] = useState<Record<string, Selection>>(
    () => (stored?.selections as Record<string, Selection>) ?? {}
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shareCardRef = useRef<View | null>(null);

  const saveResult = useGameStore((s) => s.saveResult);

  const shareCategories = categories.map((cat) => {
    const sel = selections[cat.categoryId];
    return {
      title: cat.title,
      choice: sel?.label ?? '—',
      cost: sel?.cost ?? 0,
      auto: sel?.auto,
    };
  });

  const isDone = index >= total;
  const spent = Object.values(selections).reduce((sum, s) => sum + s.cost, 0);
  const remaining = budgetTotal - spent;
  const fillPct = Math.max(0, remaining / budgetTotal);
  const isLow = remaining <= Math.ceil(budgetTotal * 0.2);

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

  function finishGame(finalSelections: Record<string, Selection>) {
    const finalSpent = Object.values(finalSelections).reduce(
      (sum, s) => sum + s.cost,
      0
    );
    setSelections(finalSelections);
    setIndex(total);
    saveResult({
      type: 'BUDGETING_4x5',
      cardId: card.cardId,
      deckId,
      cardTitle: card.title,
      selections: finalSelections,
      spent: finalSpent,
      budgetTotal,
      playedAt: Date.now(),
    });
  }

  function handleSelect(opt: Selection) {
    if (spent + opt.cost > budgetTotal) return;
    animateTransition(() => {
      const newSelections: Record<string, Selection> = {
        ...selections,
        [categories[index].categoryId]: opt,
      };
      const newSpent = Object.values(newSelections).reduce((sum, s) => sum + s.cost, 0);
      const nextIndex = index + 1;

      // Budget exhausted but categories remain — auto-fill the rest with X
      if (newSpent >= budgetTotal && nextIndex < total) {
        for (let i = nextIndex; i < total; i++) {
          newSelections[categories[i].categoryId] = { label: '✕', cost: 0, auto: true };
        }
        finishGame(newSelections);
      } else if (nextIndex >= total) {
        // Normal last-category completion
        finishGame(newSelections);
      } else {
        setSelections(newSelections);
        setIndex(nextIndex);
      }
    });
  }

  function handleRestart() {
    setIndex(0);
    setSelections({});
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }

  return (
    <View style={styles.root}>
      <ShareResultCard
        ref={shareCardRef}
        type="budgeting4x5"
        cardTitle={card.title}
        categories={shareCategories}
        spent={spent}
        budgetTotal={budgetTotal}
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
          imageSource={require('../../assets/titlovi/budzet_title.png')}
          onBack={onBack}
          description={card.description}
          rightSlot={
            <Text style={styles.progressText}>
              {isDone ? total : index + 1} / {total}
            </Text>
          }
        />

        {/* Budget bar */}
        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>BUDŽET</Text>
          <View style={styles.budgetTrack}>
            <View
              style={[
                styles.budgetFill,
                { width: `${fillPct * 100}%` as `${number}%` },
                isLow && styles.budgetFillLow,
              ]}
            />
          </View>
          <Text style={[styles.budgetValue, isLow && styles.budgetValueLow]}>
            {remaining}
          </Text>
        </View>

        <CardTitle title={card.title} color="#2E7BE8" />

        <Budgeting4x5CardArea
          cardWidth={CARD_W}
          isDone={isDone}
          categories={categories}
          index={index}
          selections={selections}
          spent={spent}
          budgetTotal={budgetTotal}
          onSelect={handleSelect}
          onRestart={handleRestart}
          onNext={onNext}
          shareCardRef={shareCardRef}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />

        {/* Bottom panel — selections made so far */}
        {!isDone && (
          <View style={[styles.panel, { height: PANEL_H }]}>
            <Text style={styles.panelHead}>✓ ODABRANO</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              style={styles.panelScroll}
            >
              {Object.keys(selections).length === 0 ? (
                <Text style={styles.panelEmpty}>—</Text>
              ) : (
                categories
                  .filter((c) => selections[c.categoryId])
                  .map((c) => {
                    const sel = selections[c.categoryId];
                    return (
                      <View key={c.categoryId} style={styles.panelItem}>
                        <Text style={styles.panelItemCat}>{c.title}: </Text>
                        <Text style={styles.panelItemChoice} numberOfLines={1}>
                          {sel.label}
                        </Text>
                        <Text style={styles.panelItemCost}> ({sel.cost})</Text>
                      </View>
                    );
                  })
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

  // ── Budget bar ──────────────────────────────────────────────────
  budgetSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  budgetLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF6B1A',
    letterSpacing: 1,
  },
  budgetTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  budgetFillLow: { backgroundColor: '#EF4444' },
  budgetValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
    minWidth: 28,
    textAlign: 'right',
  },
  budgetValueLow: { color: '#EF4444' },

  // ── Bottom panel ────────────────────────────────────────────────
  panel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: isSmall ? 10 : 12,
    paddingHorizontal: 16,
    paddingBottom: isSmall ? 12 : 16,
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
    marginBottom: 6,
  },
  panelItemCat: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  panelItemChoice: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  panelItemCost: { fontSize: 12, fontWeight: '700', color: '#FF6B1A' },
});
