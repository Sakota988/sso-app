import { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { useGameStore } from '../store/gameStore';
import WelcomeModal from '../components/WelcomeModal';
import type { DeckDisplay, DeckMeta } from '../types/deck';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

// ── Per-deck cover images (keyed by deckId) ───────────────────────
const DECK_IMAGES: Record<string, ReturnType<typeof require>> = {
  'deck-1': require('../assets/decks_backs/deck_4_back.png'),
  'deck-2': require('../assets/decks_backs/deck_5_back.png'),
  'deck-3': require('../assets/decks_backs/deck_1_back.png'),
  'deck-4': require('../assets/decks_backs/deck_2_back.png'),
  'deck-5': require('../assets/decks_backs/deck_3_back.png'),
};

// ── Fallback images by deck type ──────────────────────────────────
const TYPE_IMAGES: Record<string, ReturnType<typeof require>> = {
  'mixed': require('../assets/decks_backs/deck_4_back.png'),
};

const FALLBACK_IMAGE = require('../assets/decks_backs/deck_1_back.png');

// ── Skeleton ─────────────────────────────────────────────────────
function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  return (
    <Animated.View style={[styles.card, styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonTop} />
      <View style={styles.skeletonLine} />
    </Animated.View>
  );
}

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

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
      <View style={styles.cardTitleWrap}>
        <Text style={styles.cardTitle} numberOfLines={2}>{deck.title}</Text>
      </View>

      <View style={styles.cardCountWrap}>
        <Text style={styles.cardCount}>{deck.cardCount} kartica</Text>
      </View>

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
  const [isReady, setIsReady] = useState(false);
  const listOpacity = useRef(new Animated.Value(0)).current;
  const results = useGameStore((s) => s.results);
  const completedCount = Object.keys(results).length;
  const totalCards = DECKS.reduce((sum, d) => sum + d.cardCount, 0);
  const completionPercent = totalCards > 0 ? Math.round((completedCount / totalCards) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);
    return () => clearTimeout(timer);
  }, [listOpacity]);

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

      {!isReady && (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonLogo} />
            <View style={styles.skeletonTagline} />
            <View style={styles.skeletonStatsRow}>
              <View style={styles.skeletonStatPill} />
            </View>
            <View style={styles.skeletonSectionRow} />
          </View>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      )}

      <Animated.View style={[styles.listWrapper, { opacity: listOpacity }]}>
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
              <Text style={styles.tagline}>Izaberi špil i zaigraj</Text>
              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statNumber}>{completionPercent}%</Text>
                  <Text style={styles.statLabel}>Pitanja završeno</Text>
                </View>
              </View>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Špilovi</Text>
                <Text style={styles.sectionCount}>{DECKS.length} dostupno</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => <DeckCard deck={item} />}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  skeletonHeader: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  skeletonLogo: {
    width: 260,
    height: 180,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  skeletonTagline: {
    width: 160,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: 8,
    marginBottom: 16,
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skeletonStatPill: {
    width: 80,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  skeletonSectionRow: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 12,
  },
  skeletonCard: {
    backgroundColor: 'rgba(0,0,0,0.07)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  skeletonTop: {
    position: 'absolute',
    top: 16,
    left: 14,
    right: 14,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 260,
    height: 180,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: -8,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#C46A28',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B1A',
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
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
  cardTitleWrap: {
    position: 'absolute',
    top: 35,
    left: 4,
    right: 0,
  },
  cardCountWrap: {
    position: 'absolute',
    bottom: 40,
    left: 4,
    right: 0,
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.35 }],
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
