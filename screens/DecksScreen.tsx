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

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

export type Deck = {
  id: string;
  title: string;
  count: number;
  badge: 'FREE' | 'PRO';
  image: ReturnType<typeof require>;
};

const DECKS: Deck[] = [
  { id: '1', title: 'Klasika',    count: 10, badge: 'FREE', image: require('../assets/starter_pack.png') },
  { id: '2', title: 'Pikantno',   count: 15, badge: 'FREE', image: require('../assets/starter_pack.png') },
  { id: '3', title: 'Romantično', count: 12, badge: 'FREE', image: require('../assets/starter_pack.png') },
  { id: '4', title: 'Grupno',     count: 8,  badge: 'PRO',  image: require('../assets/starter_pack.png') },
  { id: '5', title: 'Ekstremno',  count: 20, badge: 'PRO',  image: require('../assets/starter_pack.png') },
  { id: '6', title: 'Tinejdžeri',count: 10, badge: 'FREE', image: require('../assets/starter_pack.png') },
];

function DeckCard({ deck }: { deck: Deck }) {
  const { openDeck } = useDeckNav();
  const isFree = deck.badge === 'FREE';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={() => openDeck(deck)}
    >
      <Image source={deck.image} style={styles.cardImage} resizeMode="cover" />

      <View style={[styles.badge, isFree ? styles.badgeFree : styles.badgePro]}>
        <Text style={[styles.badgeText, isFree ? styles.badgeTextFree : styles.badgeTextPro]}>
          {isFree ? 'FREE' : '🔒 PRO'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DecksScreen() {
  return (
    <View style={styles.root}>
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
        keyExtractor={(d) => d.id}
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
  cardImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.55 }],
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
