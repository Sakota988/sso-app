import { Dimensions, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { Trash2 } from 'lucide-react-native';
import {
  useGameStore,
  type CardResult,
  type Keep4Drop4Result,
  type Blind5RankResult,
  type Budgeting4x5Result,
  type OpenQuestionResult,
  type Order4Result,
} from '../store/gameStore';

const { height } = Dimensions.get('window');
const isSmall = height < 700;
const HEADER_TOP = isSmall ? 44 : 64;

// ── Helpers ───────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  KEEP_4_DROP_4: 'Zadrži 4 Izbaci 4',
  BLIND_5_RANK:  'Na Slepo',
  BUDGETING_4x5: 'Budžetiranje',
  OPEN_QUESTION: 'Otvoreno pitanje',
  ORDER_4:       'Poredaj redom',
};

const TYPE_COLORS: Record<string, string> = {
  KEEP_4_DROP_4: '#3D5AF1',
  BLIND_5_RANK:  '#7C3AED',
  BUDGETING_4x5: '#FF6B1A',
  OPEN_QUESTION: '#5B21B6',
  ORDER_4:       '#134E4A',
};

const SOCIAL_LINKS = [
  { name: 'youtube', url: 'https://www.youtube.com/@slusajsadovo', color: '#FF0000' },
  { name: 'instagram', url: 'https://www.instagram.com/slusaj.sad.ovo/', color: '#E4405F' },
  { name: 'tiktok', url: 'https://www.tiktok.com/@slusajsadovo', color: '#000000' },
  { name: 'facebook', url: 'https://www.facebook.com/slusajsadovo/', color: '#1877F2' },
  { name: 'spotify', url: 'https://shorturl.at/Eq53g', color: '#1DB954' },
] as const;

function formatDate(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]}, ${hh}:${mm}`;
}

// ── Per-type summaries ────────────────────────────────────────────

function Keep4Drop4Summary({ result }: { result: Keep4Drop4Result }) {
  return (
    <View style={styles.summarySection}>
      <Text style={styles.summaryLabel}>✓ ZADRŽANO</Text>
      <View style={styles.chipRow}>
        {result.kept.map((t) => (
          <View key={t} style={[styles.chip, styles.chipKeep]}>
            <Text style={[styles.chipText, styles.chipTextKeep]}>{t}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.summaryLabel, { marginTop: 8 }]}>✕ IZBAČENO</Text>
      <View style={styles.chipRow}>
        {result.dropped.map((t) => (
          <View key={t} style={[styles.chip, styles.chipDrop]}>
            <Text style={[styles.chipText, styles.chipTextDrop]}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Blind5RankSummary({ result }: { result: Blind5RankResult }) {
  const sorted = Object.entries(result.ranks).sort(([, a], [, b]) => a - b);
  return (
    <View style={styles.summarySection}>
      <View style={styles.legendRow}>
        <Text style={styles.legendHint}>1 = {result.labels.rank1}</Text>
        <Text style={styles.legendHint}>5 = {result.labels.rank5}</Text>
      </View>
      {sorted.map(([item, rank]) => (
        <View key={item} style={styles.rankRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{rank}</Text>
          </View>
          <Text style={styles.rankItem} numberOfLines={1}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Budgeting4x5Summary({ result }: { result: Budgeting4x5Result }) {
  return (
    <View style={styles.summarySection}>
      <View style={styles.budgetHeader}>
        <Text style={styles.summaryLabel}>ODABRANO</Text>
        <Text style={styles.budgetSpent}>{result.spent} / {result.budgetTotal}</Text>
      </View>
      {Object.entries(result.selections).map(([catId, sel]) => (
        <View key={catId} style={[styles.budgetRow, sel.auto && styles.budgetRowAuto]}>
          <Text style={[styles.budgetChoice, sel.auto && styles.budgetChoiceAuto]} numberOfLines={1}>
            {sel.label}
          </Text>
          {!sel.auto && (
            <View style={styles.budgetCostBadge}>
              <Text style={styles.budgetCostText}>{sel.cost}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function OpenQuestionSummary({ result }: { result: OpenQuestionResult }) {
  return (
    <View style={styles.summarySection}>
      <View style={[styles.oqRow, result.matched ? styles.oqRowCorrect : styles.oqRowRevealed]}>
        <Text style={styles.oqBadge}>{result.matched ? '✓ Tačno' : 'Odgovor'}</Text>
        <Text style={styles.oqUserAnswer} numberOfLines={1}>"{result.userAnswer}"</Text>
      </View>
    </View>
  );
}

function Order4Summary({ result }: { result: Order4Result }) {
  return (
    <View style={styles.summarySection}>
      <View style={styles.ord4ScoreRow}>
        <Text style={styles.summaryLabel}>REZULTAT</Text>
        <Text style={styles.ord4ScoreValue}>{result.score} / 4</Text>
      </View>
      {result.userOrder.map((item, i) => {
        const correct = item === result.correctOrder[i];
        return (
          <View key={item} style={[styles.ord4Row, correct ? styles.ord4RowCorrect : styles.ord4RowWrong]}>
            <View style={[styles.ord4Badge, correct ? styles.ord4BadgeCorrect : styles.ord4BadgeWrong]}>
              <Text style={styles.ord4BadgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.ord4ItemText} numberOfLines={1}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── History card ──────────────────────────────────────────────────

function HistoryCard({ result }: { result: CardResult }) {
  const color = TYPE_COLORS[result.type] ?? '#3D5AF1';
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyCardHeader}>
        <View style={[styles.typePill, { backgroundColor: color }]}>
          <Text style={styles.typePillText}>{TYPE_LABELS[result.type]}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(result.playedAt)}</Text>
      </View>
      <Text style={styles.cardTitle}>{result.cardTitle}</Text>

      {result.type === 'KEEP_4_DROP_4' && <Keep4Drop4Summary result={result} />}
      {result.type === 'BLIND_5_RANK'  && <Blind5RankSummary  result={result} />}
      {result.type === 'BUDGETING_4x5' && <Budgeting4x5Summary result={result} />}
      {result.type === 'OPEN_QUESTION' && <OpenQuestionSummary result={result} />}
      {result.type === 'ORDER_4'      && <Order4Summary      result={result} />}
    </View>
  );
}

// ── Social links ───────────────────────────────────────────────────

function SocialLinks() {
  return (
    <View style={styles.socialRow}>
      {SOCIAL_LINKS.map(({ name, url, color }) => (
        <TouchableOpacity
          key={name}
          style={[styles.socialBtn, { backgroundColor: color }]}
          onPress={() => Linking.openURL(url).catch(() => {})}
          activeOpacity={0.8}
        >
          <FontAwesome5 name={name} size={20} color="#fff" brand />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────

export default function HomeScreen() {
  const rawResults = useGameStore((s) => s.results);
  const clearAll = useGameStore((s) => s.clearAll);
  const results = Object.values(rawResults).sort((a, b) => b.playedAt - a.playedAt);
  const totalPlayed = results.length;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FF9A5C', '#FFD4A3', '#FFF0E6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <View style={[styles.bgCircle, { width: 220, height: 220, top: -80, right: -80 }]} />
      <View style={[styles.bgCircle, { width: 150, height: 150, bottom: 120, left: -60 }]} />

      <FlatList
        data={results}
        keyExtractor={(r) => `${r.cardId}-${r.playedAt}`}
        contentContainerStyle={[styles.list, { paddingTop: HEADER_TOP + 80 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalPlayed}</Text>
              <Text style={styles.statLabel}>odigranih igara</Text>
            </View>
            {totalPlayed > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.75}>
                <Trash2 size={15} color="#EF4444" strokeWidth={2.5} />
                <Text style={styles.clearBtnText}>Obriši sve</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyTitle}>Nema istorije</Text>
            <Text style={styles.emptySubtitle}>
              Odigraj neku karticu i ovdje ćeš vidjeti rezultate.
            </Text>
          </View>
        }
        renderItem={({ item }) => <HistoryCard result={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Floating header */}
      <View style={[styles.floatingHeader, { top: HEADER_TOP }]}>
        <Text style={styles.screenTitle}>Istorija igara</Text>
      </View>

      {/* Fixed footer - social links */}
      <View style={styles.socialFooter}>
        <SocialLinks />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Header
  floatingHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: isSmall ? 22 : 26,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 180 },
  separator: { height: 12 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: { gap: 2 },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#FF6B1A', lineHeight: 32 },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  // Social links
  socialFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: 24,
  },

  // History card
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#C46A28',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typePill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typePillText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.6 },
  dateText: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 10 },

  // Summary shared
  summarySection: { gap: 6 },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Keep4Drop4
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipKeep: { backgroundColor: '#D1FAE5' },
  chipDrop: { backgroundColor: '#FEE2E2' },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextKeep: { color: '#065F46' },
  chipTextDrop: { color: '#991B1B', textDecorationLine: 'line-through' },

  // Blind5Rank
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  legendHint: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  rankItem: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },

  // Budgeting4x5
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetSpent: { fontSize: 13, fontWeight: '900', color: '#FF6B1A' },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  budgetRowAuto: { backgroundColor: '#F3F4F6', opacity: 0.6 },
  budgetChoice: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  budgetChoiceAuto: { color: '#9CA3AF', fontWeight: '700' },
  budgetCostBadge: {
    backgroundColor: '#FF6B1A',
    borderRadius: 7,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  budgetCostText: { fontSize: 11, fontWeight: '900', color: '#fff' },

  // OpenQuestion
  oqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  oqRowCorrect: { backgroundColor: '#D1FAE5' },
  oqRowRevealed: { backgroundColor: '#E0E7FF' },
  oqBadge: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 0.6 },
  oqUserAnswer: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

  // Order4
  ord4ScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ord4ScoreValue: { fontSize: 13, fontWeight: '900', color: '#134E4A' },
  ord4Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
  },
  ord4RowCorrect: { backgroundColor: '#D1FAE5' },
  ord4RowWrong:   { backgroundColor: '#FEE2E2' },
  ord4Badge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ord4BadgeCorrect: { backgroundColor: '#10B981' },
  ord4BadgeWrong:   { backgroundColor: '#EF4444' },
  ord4BadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  ord4ItemText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
});
