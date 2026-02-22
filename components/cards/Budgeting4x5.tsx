import { useRef, useState } from 'react';
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
import type { Budgeting4x5Card } from '../../types/deck';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W = width - 48;
const HEADER_TOP = isSmall ? 44 : 64;
const PANEL_H = isSmall ? 120 : 155;

type Props = {
  card: Budgeting4x5Card;
  onBack: () => void;
  cardNumber: number;
  totalCards: number;
};

type Selection = { label: string; cost: number; auto?: boolean };

export default function Budgeting4x5({ card, onBack }: Props) {
  const { categories, budgetTotal } = card;
  const total = categories.length;

  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Selection>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

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
        setSelections(newSelections);
        setIndex(total);
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
              source={require('../../assets/budzet.png')}
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

        {/* Card area */}
        <View style={styles.cardArea}>
          {isDone ? (
            <View style={[styles.doneCard, { width: CARD_W }]}>
              <Text style={styles.doneEmoji}>🎉</Text>
              <Text style={styles.doneTxt}>Gotovo!</Text>
              <Text style={styles.doneSpent}>
                Potrošeno {spent} / {budgetTotal}
              </Text>

              <View style={styles.doneSummary}>
                {categories.map((cat) => {
                  const sel = selections[cat.categoryId];
                  const isAuto = sel?.auto === true;
                  return (
                    <View
                      key={cat.categoryId}
                      style={[styles.doneSummaryRow, isAuto && styles.doneSummaryRowAuto]}
                    >
                      <Text style={[styles.doneSummaryCat, isAuto && styles.doneSummaryCatAuto]}>
                        {cat.title}
                      </Text>
                      <Text
                        style={[styles.doneSummaryChoice, isAuto && styles.doneSummaryChoiceAuto]}
                        numberOfLines={1}
                      >
                        {sel?.label ?? '—'}
                      </Text>
                      {!isAuto && (
                        <View style={styles.doneCostBadge}>
                          <Text style={styles.doneCostBadgeText}>{sel?.cost ?? 0}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.restartBtn}
                onPress={handleRestart}
                activeOpacity={0.8}
              >
                <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.categoryCard,
                { width: CARD_W },
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
              ]}
            >
              <Text style={styles.catLabel}>KATEGORIJA {index + 1} / {total}</Text>
              <Text style={styles.catTitle}>{categories[index].title}</Text>

              <View style={styles.optionsList}>
                {categories[index].options.map((opt) => {
                  const isOver = spent + opt.cost > budgetTotal;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[styles.optionRow, isOver && styles.optionRowOver]}
                      onPress={() => handleSelect(opt)}
                      disabled={isOver}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.optionLabel, isOver && styles.optionLabelOver]}>
                        {opt.label}
                      </Text>
                      <View style={[styles.costBadge, isOver && styles.costBadgeOver]}>
                        <Text style={[styles.costBadgeText, isOver && styles.costBadgeTextOver]}>
                          {opt.cost} €
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}
        </View>

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
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
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

  // ── Card area ───────────────────────────────────────────────────
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // ── Category card ───────────────────────────────────────────────
  categoryCard: {
    backgroundColor: '#3D5AF1',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 18 : 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  catLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  catTitle: {
    fontSize: isSmall ? 22 : 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: isSmall ? 14 : 18,
    letterSpacing: -0.3,
  },
  optionsList: { gap: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: isSmall ? 10 : 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  optionRowOver: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  optionLabelOver: { color: 'rgba(255,255,255,0.3)' },
  costBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  costBadgeOver: { backgroundColor: 'rgba(0,0,0,0.1)' },
  costBadgeText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  costBadgeTextOver: { color: 'rgba(255,255,255,0.25)' },

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
  doneSpent: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
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
    gap: 8,
  },
  doneSummaryCat: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.6,
    width: 72,
    textTransform: 'uppercase',
  },
  doneSummaryChoice: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  doneCostBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  doneCostBadgeText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  doneSummaryRowAuto: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  doneSummaryCatAuto: { color: 'rgba(255,255,255,0.3)' },
  doneSummaryChoiceAuto: {
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '800',
    fontSize: 16,
  },
  restartBtn: {
    marginTop: 10,
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
    marginBottom: 6,
  },
  panelItemCat: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  panelItemChoice: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  panelItemCost: { fontSize: 12, fontWeight: '700', color: '#FF6B1A' },
});
