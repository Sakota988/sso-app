import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play } from 'lucide-react-native';
import type { DeckDisplay, CardItem } from '../types/deck';
import { getCardFile } from '../data/cardFileRegistry';
import CardScreen from './CardScreen';

const { width } = Dimensions.get('window');
const CARD_WIDTH  = (width - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

// ── Static card image map: deckId → card back image ───────────────
const CARD_IMAGES: Record<string, ReturnType<typeof require>> = {
  'starter':   require('../assets/zardzi4izbaci4_card.png'),
  'red-flags': require('../assets/zardzi4izbaci4_card.png'), // replace when ready
};

type Props = {
  deck: DeckDisplay;
  onBack: () => void;
};

function CardGridItem({
  card,
  index,
  deckId,
  onPress,
}: {
  card: CardItem;
  index: number;
  deckId: string;
  onPress: () => void;
}) {
  const img = CARD_IMAGES[deckId] ?? require('../assets/zardzi4izbaci4_card.png');
  return (
    <TouchableOpacity style={styles.cardItem} onPress={onPress} activeOpacity={0.82}>
      <Image source={img} style={styles.cardItemImage} resizeMode="cover" />
      <View style={styles.cardNumber}>
        <Text style={styles.cardNumberText}>{index + 1}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DeckDetailsScreen({ deck, onBack }: Props) {
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);

  const content = getCardFile(deck.contentFile);
  const cards: CardItem[] = content?.cards ?? [];

  if (selectedCard) {
    const idx = cards.findIndex((c) => c.cardId === selectedCard.cardId);
    return (
      <CardScreen
        card={selectedCard}
        cardNumber={idx + 1}
        totalCards={cards.length}
        onBack={() => setSelectedCard(null)}
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

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <ArrowLeft size={22} color="#1A1A1A" strokeWidth={2.5} />
      </TouchableOpacity>

      <FlatList
        data={cards}
        keyExtractor={(c) => c.cardId}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.coverCard}>
              <Image source={deck.image} style={styles.coverImage} resizeMode="cover" />
            </View>
            <Text style={styles.deckTitle}>{deck.title}</Text>
            <Text style={styles.deckDesc}>{deck.description}</Text>
            <Text style={styles.deckCount}>{cards.length} kartica</Text>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Kartice</Text>
              <View style={[styles.badge, deck.isFree ? styles.badgeFree : styles.badgePro]}>
                <Text style={[styles.badgeText, deck.isFree ? styles.badgeTextFree : styles.badgeTextPro]}>
                  {deck.isFree ? 'FREE' : '🔒 PRO'}
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <CardGridItem
            card={item}
            index={index}
            deckId={deck.deckId}
            onPress={() => setSelectedCard(item)}
          />
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.playBtn} activeOpacity={0.85}>
          <Play size={20} color="#fff" fill="#fff" />
          <Text style={styles.playText}>Igraj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  list: {
    paddingTop: 100,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  row: { gap: 16, marginBottom: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  coverCard: {
    width: 130,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF0E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 14,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.55 }],
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  deckDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  deckCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 20,
  },
  sectionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeFree: { backgroundColor: '#D1FAE5' },
  badgePro:  { backgroundColor: '#1A1A1A' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  badgeTextFree: { color: '#065F46' },
  badgeTextPro:  { color: '#FFFFFF' },
  cardItem: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFF0E6',
    shadowColor: '#C46A28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  cardItemImage: { width: '100%', height: '100%' },
  cardNumber: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumberText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  footer: { position: 'absolute', bottom: 32, left: 20, right: 20 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF8C42',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  playText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
