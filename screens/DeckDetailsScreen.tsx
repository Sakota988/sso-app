import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import type { DeckDisplay, CardItem } from '../types/deck';
import { getCardFile } from '../data/cardFileRegistry';
import CardScreen from './CardScreen';
import { useGameStore } from '../store/gameStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH  = (width - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

// ── Card back images keyed by card type ───────────────────────────
const CARD_TYPE_IMAGES: Record<string, ReturnType<typeof require>> = {
  'KEEP_4_DROP_4':  require('../assets/zadrzi_izbaci_back.png'),
  'BLIND_5_RANK':   require('../assets/slepo_back.png'),
  'BUDGETING_4x5':  require('../assets/budzet_back.png'),
  'OPEN_QUESTION':  require('../assets/pitalica_back.png'),
  'ORDER_4':        require('../assets/pravi_raspored_back.png'),

};

const CARD_FALLBACK_IMAGE = require('../assets/zardzi4izbaci4_card.png');

// ── Skeleton card ─────────────────────────────────────────────────
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
    <Animated.View style={[styles.cardItem, styles.skeletonCard, { opacity }]}>
      {/* Top shimmer block */}
      <View style={styles.skeletonTop} />
      {/* Bottom text line */}
      <View style={styles.skeletonLine} />
    </Animated.View>
  );
}

// ── Skeleton row (two cards side-by-side, matching the FlatList grid) ──
function SkeletonRow() {
  return (
    <View style={styles.row}>
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

type Props = {
  deck: DeckDisplay;
  onBack: () => void;
};

const CardGridItem = memo(function CardGridItem({
  card,
  onPress,
}: {
  card: CardItem;
  onPress: (card: CardItem) => void;
}) {
  const img = CARD_TYPE_IMAGES[card.type] ?? CARD_FALLBACK_IMAGE;
  const isPlayed = useGameStore((s) => !!s.results[card.cardId]);

  return (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => onPress(card)}
      activeOpacity={0.82}
    >
      <Image
        source={img}
        style={[styles.cardItemImage, isPlayed && styles.cardItemImagePlayed]}
        resizeMode="contain"
      />
      {isPlayed && (
        <View style={styles.playedBadge}>
          <CheckCircle2 size={16} color="#fff" strokeWidth={2.5} />
        </View>
      )}
      <View style={styles.cardItemFooter}>
        <Text style={styles.cardItemText} numberOfLines={1}>{card.shortTitle}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function DeckDetailsScreen({ deck, onBack }: Props) {
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const listOpacity = useRef(new Animated.Value(0)).current;

  const content = getCardFile(deck.contentFile);
  const cards: CardItem[] = content?.cards ?? [];

  // Show skeletons for at least 500ms, then fade the real list in
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setIsReady(true);
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [listOpacity]);

  // Defer mounting the heavy card component until after the press animation
  const handleCardPress = useCallback((card: CardItem) => {
    setIsTransitioning(true);
    InteractionManager.runAfterInteractions(() => {
      setSelectedCard(card);
      setIsTransitioning(false);
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: CardItem }) => (
    <CardGridItem card={item} onPress={handleCardPress} />
  ), [handleCardPress]);

  const keyExtractor = useCallback((c: CardItem) => c.cardId, []);

  if (selectedCard) {
    const idx = cards.findIndex((c) => c.cardId === selectedCard.cardId);
    return (
      <CardScreen
        card={selectedCard}
        cardNumber={idx + 1}
        totalCards={cards.length}
        deckId={deck.deckId}
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

      {/* Skeleton grid — visible while list hasn't settled yet */}
      {!isReady && (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCover} />
            <View style={styles.skeletonTitleLine} />
            <View style={styles.skeletonSubLine} />
          </View>
          {Array.from({ length: Math.ceil(Math.min(cards.length, 6) / 2) }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      )}

      {/* Real list — fades in once ready */}
      <Animated.View style={[styles.listWrapper, { opacity: listOpacity }]}>
        <FlatList
          data={cards}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
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
          renderItem={renderItem}
        />
      </Animated.View>

      {isTransitioning && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B1A" />
        </View>
      )}
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
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  coverCard: {
    width: 130,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    marginBottom: 14,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.05 }],
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
    shadowColor: '#C46A28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  cardItemImage: { width: '100%', height: '100%' },
  cardItemImagePlayed: { opacity: 0.9 },
  cardItemFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
  },
  cardItemText: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 0.3,
  },
  playedBadge: {
    position: 'absolute',
    top: 20,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  listWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Skeleton styles ──────────────────────────────────────────────
  skeletonContainer: {
    paddingTop: 100,
    paddingHorizontal: 16,
  },
  skeletonHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  skeletonCover: {
    width: 130,
    height: 150,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginBottom: 4,
  },
  skeletonTitleLine: {
    width: 140,
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  skeletonSubLine: {
    width: 100,
    height: 13,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
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

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,240,230,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
