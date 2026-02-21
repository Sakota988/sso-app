import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play } from 'lucide-react-native';
import type { Deck } from './DecksScreen';

type Props = {
  deck: Deck;
  onBack: () => void;
};

export default function DeckDetailsScreen({ deck, onBack }: Props) {
  const isFree = deck.badge === 'FREE';

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageCard}>
          <Image source={deck.image} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{deck.title}</Text>
            <View style={[styles.badge, isFree ? styles.badgeFree : styles.badgePro]}>
              <Text style={[styles.badgeText, isFree ? styles.badgeTextFree : styles.badgeTextPro]}>
                {isFree ? 'FREE' : '🔒 PRO'}
              </Text>
            </View>
          </View>

          <Text style={styles.count}>{deck.count} kartica</Text>

          <View style={styles.divider} />

          <Text style={styles.descLabel}>O špilu</Text>
          <Text style={styles.desc}>
            Opis ovog špila dolazi uskoro. Ovdje će biti kratki opis tema i pitanja koja se nalaze u kartama.
          </Text>
        </View>
      </ScrollView>

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
  scroll: {
    paddingTop: 80,
    paddingBottom: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  imageCard: {
    width: 240,
    height: 280,
    backgroundColor: '#111111',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 28,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeFree: { backgroundColor: '#D1FAE5' },
  badgePro:  { backgroundColor: '#1A1A1A' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  badgeTextFree: { color: '#065F46' },
  badgeTextPro:  { color: '#FFFFFF' },
  count: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginBottom: 16,
  },
  descLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
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
  playText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
