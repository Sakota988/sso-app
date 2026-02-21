import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Budgeting4x5Card } from '../../types/deck';

type Props = { card: Budgeting4x5Card };

export default function Budgeting4x5({ card }: Props) {
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

const styles = StyleSheet.create({
  typeCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    padding: 16,
  },
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
