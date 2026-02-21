import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import type { CardItem } from '../types/deck';
import Keep4Drop4 from '../components/cards/Keep4Drop4';
import Blind5Rank from '../components/cards/Blind5Rank';
import Budgeting4x5 from '../components/cards/Budgeting4x5';

type Props = {
  card: CardItem;
  cardNumber: number;
  totalCards: number;
  onBack: () => void;
};

// ── Main screen ───────────────────────────────────────────────────
export default function CardScreen({ card, cardNumber, totalCards, onBack }: Props) {
  // KEEP_4_DROP_4 owns the full screen (its own chrome + layout)
  if (card.type === 'KEEP_4_DROP_4') {
    return (
      <Keep4Drop4
        card={card}
        onBack={onBack}
        cardNumber={cardNumber}
        totalCards={totalCards}
      />
    );
  }

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
  cardDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
});
