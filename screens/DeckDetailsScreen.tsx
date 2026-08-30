import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, CheckCircle2, Trophy } from 'lucide-react-native';
import type { DeckDisplay, CardItem } from '../types/deck';
import { loadDeck, refreshDeck } from '../lib/api/loadDeck';
import CardScreen from './CardScreen';
import RefreshableFlatList from '../components/common/RefreshableFlatList';
import RefreshableScrollView from '../components/common/RefreshableScrollView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH  = (width - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

// ── Card back images keyed by card type ───────────────────────────
const CARD_TYPE_IMAGES: Record<string, ReturnType<typeof require>> = {
  'KEEP_4_DROP_4':  require('../assets/card_backs/zadrzi_back.png'),
  'BLIND_5_RANK':   require('../assets/card_backs/slepo_back.png'),
  'BUDGETING_4x5':  require('../assets/card_backs/budzet_back.png'),
  'OPEN_QUESTION':  require('../assets/card_backs/pitalica_back.png'),
  'ORDER_4':        require('../assets/card_backs/pravi_raspored_back.png'),
  'TOP_X':          require('../assets/card_backs/pravi_raspored_back.png'),
};

const CARD_FALLBACK_IMAGE = require('../assets/card_backs/zadrzi_back.png');

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const results = useGameStore((s) => s.results);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadDeck(deck.deckId);
      setCards(result.deck.cards);
      setFromCache(result.fromCache);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Greška pri učitavanju');
    }
  }, [deck.deckId]);

  const refreshDeckSilently = useCallback(async () => {
    try {
      const result = await refreshDeck(deck.deckId);
      setCards(result.deck.cards);
      setFromCache(result.fromCache);
      setError(null);
      setSelectedCard((prev) => {
        if (!prev) return prev;
        return result.deck.cards.find((c) => c.cardId === prev.cardId) ?? prev;
      });
    } catch {
      // Keep current cards visible on refresh failure.
    }
  }, [deck.deckId]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    void load();
  }, [load]);

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
    const handleNext = () => {
      for (let i = idx + 1; i < cards.length; i++) {
        if (!results[cards[i].cardId]) {
          setSelectedCard(cards[i]);
          return;
        }
      }
      const allPlayed = cards.every((c) => !!results[c.cardId]);
      if (allPlayed) {
        setShowCompletionModal(true);
      } else {
        setSelectedCard(null);
      }
    };
    return (
      <>
        <CardScreen
          card={selectedCard}
          cardNumber={idx + 1}
          totalCards={cards.length}
          deckId={deck.deckId}
          onBack={() => setSelectedCard(null)}
          onNext={handleNext}
          dedupeKey={`deck:${deck.deckId}`}
          onRefreshData={refreshDeckSilently}
          progressViewOffset={insets.top + 56}
        />
        <Modal
          visible={showCompletionModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowCompletionModal(false);
            setSelectedCard(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconCircle}>
                <Trophy size={36} color="#FF8C42" strokeWidth={2} />
              </View>
              <Text style={styles.modalTitle}>Uspešno ste završili ceo spil!</Text>
              <Text style={styles.modalSub}>Sve kartice su odigrane.</Text>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  setShowCompletionModal(false);
                  setSelectedCard(null);
                }}
              >
                <Text style={styles.modalBtnText}>Zatvori</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  const skeletonRows = Math.max(1, Math.ceil(Math.min(deck.cardCount || 6, 6) / 2));

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFD4A3' }]} pointerEvents="none" />

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <ArrowLeft size={22} color="#1A1A1A" strokeWidth={2.5} />
      </TouchableOpacity>

      {loading && (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCover} />
            <View style={styles.skeletonTitleLine} />
            <View style={styles.skeletonSubLine} />
          </View>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      )}

      {!loading && error && (
        <RefreshableScrollView
          dedupeKey={`deck:${deck.deckId}`}
          onRefreshData={refreshDeckSilently}
          progressViewOffset={insets.top + 56}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => void load()}>
              <Text style={styles.retryBtnText}>Pokušaj ponovo</Text>
            </TouchableOpacity>
          </View>
        </RefreshableScrollView>
      )}

      {!loading && !error && (
        <View style={styles.listWrapper}>
          <RefreshableFlatList
            dedupeKey={`deck:${deck.deckId}`}
            onRefreshData={refreshDeckSilently}
            progressViewOffset={insets.top + 56}
            data={cards}
            keyExtractor={keyExtractor}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[styles.list, { minHeight: SCREEN_HEIGHT + 1 }]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            ListHeaderComponent={
              <View style={styles.header}>
                <View style={styles.coverCard}>
                  <Image source={deck.coverSource} style={styles.coverImage} resizeMode="cover" />
                </View>
                <Text style={styles.deckTitle}>{deck.title}</Text>
                <Text style={styles.deckDesc}>{deck.description}</Text>
                {fromCache && (
                  <Text style={styles.cacheHint}>Offline — sačuvane kartice</Text>
                )}
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
        </View>
      )}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  cacheHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
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
  },
  listWrapper: {
    flex: 1,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  modalSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  modalBtn: {
    backgroundColor: '#FF8C42',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
