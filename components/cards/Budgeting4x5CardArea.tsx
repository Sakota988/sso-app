import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BudgetCategory } from '../../types/deck';
import ShareButton from '../ShareButton';

const { height } = Dimensions.get('window');
const isSmall = height < 700;

type Selection = { label: string; cost: number; auto?: boolean };

type Props = {
  cardWidth: number;
  isDone: boolean;
  categories: BudgetCategory[];
  index: number;
  selections: Record<string, Selection>;
  spent: number;
  budgetTotal: number;
  onSelect: (opt: Selection) => void;
  onRestart: () => void;
  shareCardRef: React.RefObject<View | null>;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
};

export default function Budgeting4x5CardArea({
  cardWidth,
  isDone,
  categories,
  index,
  selections,
  spent,
  budgetTotal,
  onSelect,
  onRestart,
  shareCardRef,
  fadeAnim,
  slideAnim,
}: Props) {
  const category = categories[index];

  return (
    <View style={styles.cardArea}>
      {isDone ? (
        <View style={[styles.doneCard, { width: cardWidth }]}>
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
            onPress={onRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
          </TouchableOpacity>

          <ShareButton viewRef={shareCardRef} />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.categoryCard,
            { width: cardWidth },
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={styles.catLabel}>KATEGORIJA {index + 1} / {categories.length}</Text>
          <Text style={styles.catTitle}>{category.title}</Text>

          <View style={styles.optionsList}>
            {category.options.map((opt) => {
              const isOver = spent + opt.cost > budgetTotal;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.optionRow, isOver && styles.optionRowOver]}
                  onPress={() => onSelect(opt)}
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
  );
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  categoryCard: {
    backgroundColor: '#2E7BE8',
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

  doneCard: {
    backgroundColor: '#2E7BE8',
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
});
