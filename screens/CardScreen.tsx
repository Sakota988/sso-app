import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import type { CardItem, Keep4Drop4Card, Blind5RankCard, Budgeting4x5Card } from '../types/deck';

const { width } = Dimensions.get('window');

type Props = {
  card: CardItem;
  cardNumber: number;
  totalCards: number;
  onBack: () => void;
};

// ── KEEP 4 DROP 4 ─────────────────────────────────────────────────
function Keep4Drop4({ card }: { card: Keep4Drop4Card }) {
  const [selections, setSelections] = useState<Record<string, 'keep' | 'drop' | null>>(
    Object.fromEntries(card.traits.map((t) => [t, null]))
  );

  const kept = Object.values(selections).filter((v) => v === 'keep').length;
  const dropped = Object.values(selections).filter((v) => v === 'drop').length;

  const toggle = (trait: string, action: 'keep' | 'drop') => {
    setSelections((prev) => ({
      ...prev,
      [trait]: prev[trait] === action ? null : action,
    }));
  };

  return (
    <View style={styles.typeCard}>
      <View style={styles.scoreRow}>
        <View style={[styles.scoreBadge, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.scoreNum, { color: '#065F46' }]}>{kept}</Text>
          <Text style={[styles.scoreLabel, { color: '#065F46' }]}>zadrži</Text>
        </View>
        <Text style={styles.scoreSlash}>/</Text>
        <View style={[styles.scoreBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.scoreNum, { color: '#991B1B' }]}>{dropped}</Text>
          <Text style={[styles.scoreLabel, { color: '#991B1B' }]}>izbaci</Text>
        </View>
      </View>

      <View style={styles.traitsGrid}>
        {card.traits.map((trait) => {
          const sel = selections[trait];
          return (
            <View key={trait} style={styles.traitRow}>
              <Text style={[styles.traitText, sel === 'drop' && styles.traitDropped]}>
                {trait}
              </Text>
              <View style={styles.traitBtns}>
                <TouchableOpacity
                  style={[styles.traitBtn, sel === 'keep' && styles.traitBtnKeep]}
                  onPress={() => toggle(trait, 'keep')}
                >
                  <Text style={[styles.traitBtnTxt, sel === 'keep' && styles.traitBtnTxtActive]}>
                    ✓
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.traitBtn, sel === 'drop' && styles.traitBtnDrop]}
                  onPress={() => toggle(trait, 'drop')}
                >
                  <Text style={[styles.traitBtnTxt, sel === 'drop' && styles.traitBtnTxtActive]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── BLIND 5 RANK ──────────────────────────────────────────────────
function Blind5Rank({ card }: { card: Blind5RankCard }) {
  const [ranks, setRanks] = useState<Record<string, number | null>>(
    Object.fromEntries(card.items.map((i) => [i, null]))
  );

  const assign = (item: string, rank: number) => {
    setRanks((prev) => {
      // un-assign if another item already has this rank
      const cleared = Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [k, v === rank ? null : v])
      );
      return { ...cleared, [item]: cleared[item] === rank ? null : rank };
    });
  };

  return (
    <View style={styles.typeCard}>
      <View style={styles.rankLegend}>
        <Text style={styles.rankLegendText}>1 = {card.labels.rank1}</Text>
        <Text style={styles.rankLegendText}>5 = {card.labels.rank5}</Text>
      </View>

      {card.items.map((item) => (
        <View key={item} style={styles.rankRow}>
          <Text style={styles.rankItem}>{item}</Text>
          <View style={styles.rankBtns}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.rankBtn, ranks[item] === n && styles.rankBtnActive]}
                onPress={() => assign(item, n)}
              >
                <Text style={[styles.rankBtnTxt, ranks[item] === n && styles.rankBtnTxtActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── BUDGETING 4x5 ─────────────────────────────────────────────────
function Budgeting4x5({ card }: { card: Budgeting4x5Card }) {
  const [selections, setSelections] = useState<Record<string, number>>(
    Object.fromEntries(card.categories.map((c) => [c.categoryId, 0]))
  );

  const spent = Object.values(selections).reduce((a, b) => a + b, 0);
  const remaining = card.budgetTotal - spent;

  return (
    <View style={styles.typeCard}>
      <View style={[styles.budgetBar, remaining < 0 && styles.budgetBarOver]}>
        <Text style={styles.budgetBarText}>
          Potrošeno: {spent}€ / {card.budgetTotal}€
        </Text>
        <Text style={[styles.budgetRemaining, remaining < 0 && styles.budgetOver]}>
          {remaining >= 0 ? `Ostalo: ${remaining}€` : `Prekoračenje: ${Math.abs(remaining)}€`}
        </Text>
      </View>

      {card.categories.map((cat) => (
        <View key={cat.categoryId} style={styles.budgetCategory}>
          <Text style={styles.budgetCatTitle}>{cat.title}</Text>
          {cat.options.map((opt) => {
            const isSelected = selections[cat.categoryId] === opt.cost;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.budgetOption, isSelected && styles.budgetOptionSelected]}
                onPress={() =>
                  setSelections((prev) => ({
                    ...prev,
                    [cat.categoryId]: isSelected ? 0 : opt.cost,
                  }))
                }
              >
                <Text style={[styles.budgetOptionLabel, isSelected && styles.budgetOptionLabelSel]}>
                  {opt.label}
                </Text>
                <Text style={[styles.budgetOptionCost, isSelected && styles.budgetOptionLabelSel]}>
                  {opt.cost}€
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────
export default function CardScreen({ card, cardNumber, totalCards, onBack }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FF9A5C', '#FFD4A3', '#FFF0E6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <View style={[styles.circle, { width: 200, height: 200, top: -60, right: -60 }]} />
      <View style={[styles.circle, { width: 140, height: 140, bottom: 140, left: -50 }]} />

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <ArrowLeft size={22} color="#1A1A1A" strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.counter}>
        <Text style={styles.counterText}>{cardNumber} / {totalCards}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{(card?.type ?? '').replace(/_/g, ' ')}</Text>
          </View>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDesc}>{card.description}</Text>
        </View>

        {/* Type-specific content */}
        {card.type === 'KEEP_4_DROP_4' && <Keep4Drop4 card={card} />}
        {card.type === 'BLIND_5_RANK'  && <Blind5Rank card={card} />}
        {card.type === 'BUDGETING_4x5' && <Budgeting4x5 card={card} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  scroll: { paddingTop: 110, paddingHorizontal: 16, paddingBottom: 40 },

  // Card header
  cardHeader: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF8C42',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  typeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  cardDesc:  { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  // Shared typeCard wrapper
  typeCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    padding: 16,
  },

  // Keep4Drop4
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreNum: { fontSize: 18, fontWeight: '800' },
  scoreLabel: { fontSize: 12, fontWeight: '600' },
  scoreSlash: { fontSize: 18, color: '#D1D5DB', fontWeight: '300' },
  traitsGrid: { gap: 8 },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  traitText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  traitDropped: { color: '#D1D5DB', textDecorationLine: 'line-through' },
  traitBtns: { flexDirection: 'row', gap: 8 },
  traitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  traitBtnKeep: { backgroundColor: '#D1FAE5' },
  traitBtnDrop: { backgroundColor: '#FEE2E2' },
  traitBtnTxt: { fontSize: 14, color: '#9CA3AF' },
  traitBtnTxtActive: { color: '#1A1A1A', fontWeight: '800' },

  // Blind5Rank
  rankLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rankLegendText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  rankRow: {
    marginBottom: 12,
    gap: 8,
  },
  rankItem: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  rankBtns: { flexDirection: 'row', gap: 6 },
  rankBtn: {
    width: (width - 32 - 32 - 24) / 5,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBtnActive: { backgroundColor: '#FF8C42' },
  rankBtnTxt: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  rankBtnTxtActive: { color: '#fff' },

  // Budgeting4x5
  budgetBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF0E6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FF8C42',
  },
  budgetBarOver: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  budgetBarText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  budgetRemaining: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  budgetOver: { color: '#EF4444' },
  budgetCategory: { marginBottom: 16 },
  budgetCatTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF8C42',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  budgetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  budgetOptionSelected: { backgroundColor: '#FFF7ED', borderColor: '#FF8C42' },
  budgetOptionLabel: { fontSize: 14, color: '#374151', fontWeight: '500', flex: 1 },
  budgetOptionLabelSel: { color: '#FF8C42', fontWeight: '700' },
  budgetOptionCost: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
});
