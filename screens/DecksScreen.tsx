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
import { useDeckNav } from '../contexts/DeckNavContext';
import WelcomeModal from '../components/WelcomeModal';
import type { DeckDisplay, DeckMeta } from '../types/deck';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

// ── Per-deck cover images (keyed by deckId) ───────────────────────
const DECK_IMAGES: Record<string, ReturnType<typeof require>> = {
  'starter':      require('../assets/starter.png'),
  'budzetiranje': require('../assets/budzet.png'),
  // 'red-flags': require('../assets/red_flags_pack.png'),  ← add when asset is ready
};

// ── Fallback images by deck type ──────────────────────────────────
const TYPE_IMAGES: Record<string, ReturnType<typeof require>> = {
  'mixed': require('../assets/starter.png'),
  'budzet': require('../assets/budzet.png'),
};

const FALLBACK_IMAGE = require('../assets/starter.png');

// ── Load decks from JSON ──────────────────────────────────────────
const deckData: { decks: DeckMeta[] } = require('../data/decks.json');

const DECKS: DeckDisplay[] = deckData.decks.map((d) => ({
  ...d,
  image: DECK_IMAGES[d.deckId] ?? TYPE_IMAGES[(d as any).type] ?? FALLBACK_IMAGE,
}));

// ── Components ────────────────────────────────────────────────────
function DeckCard({ deck }: { deck: DeckDisplay }) {
  const { openDeck } = useDeckNav();
  const isFree = deck.isFree;

  return (
    <TouchableOpacity
      style={[styles.card, !isFree && styles.cardLocked]}
      activeOpacity={isFree ? 0.82 : 1}
      onPress={() => { if (isFree) openDeck(deck); }}
    >
      <Image source={deck.image} style={styles.cardImage} resizeMode="contain" />

      <View style={[styles.badge, isFree ? styles.badgeFree : styles.badgePro]}>
        <Text style={[styles.badgeText, isFree ? styles.badgeTextFree : styles.badgeTextPro]}>
          {isFree ? 'FREE' : '🔒 PRO'}
        </Text>
      </View>

      {!isFree && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedIcon}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DecksScreen() {
  return (
    <View style={styles.root}>
      <WelcomeModal />
      <LinearGradient
        colors={['#FF9A5C', '#FFD4A3', '#FFF0E6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      <View style={[styles.circle, { width: 240, height: 240, top: -80, right: -70 }]} />
      <View style={[styles.circle, { width: 180, height: 180, bottom: 160, left: -70 }]} />
      <View style={[styles.circle, { width: 120, height: 120, top: 280, right: -30 }]} />
      <View style={[styles.circle, { width: 90,  height: 90,  top: 140, left: 16 }]} />

      <FlatList
        data={DECKS}
        keyExtractor={(d) => d.deckId}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        }
        renderItem={({ item }) => <DeckCard deck={item} />}
      />
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  logo: {
    width: 260,
    height: 180,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#C46A28',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.25 }],
  },
  lockedOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  lockedIcon: { fontSize: 32 },
  lockedText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeFree: { backgroundColor: '#D1FAE5' },
  badgePro:  { backgroundColor: '#1A1A1A' },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  badgeTextFree: { color: '#065F46' },
  badgeTextPro:  { color: '#FFFFFF' },
});
