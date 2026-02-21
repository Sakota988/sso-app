import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Blind5RankCard } from '../../types/deck';

const { width } = Dimensions.get('window');

type Props = { card: Blind5RankCard };

export default function Blind5Rank({ card }: Props) {
  const [ranks, setRanks] = useState<Record<string, number | null>>(
    Object.fromEntries(card.items.map((i) => [i, null]))
  );

  const assign = (item: string, rank: number) => {
    setRanks((prev) => {
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

const styles = StyleSheet.create({
  typeCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    padding: 16,
  },
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
});
