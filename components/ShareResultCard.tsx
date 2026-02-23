/**
 * Off-screen card captured by react-native-view-shot and shared via expo-sharing.
 * Rendered absolutely at x:-9999 so it is never visible to the user.
 * Supports all three game types via a discriminated union.
 */
import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Discriminated union for each game type ──────────────────────────────────

export type Keep4Drop4Data = {
  type: 'keep4drop4';
  cardTitle: string;
  kept: string[];
  dropped: string[];
};

export type Blind5RankData = {
  type: 'blind5rank';
  cardTitle: string;
  ranks: Record<string, number>;
  labels: { rank1: string; rank5: string };
};

export type Budgeting4x5Data = {
  type: 'budgeting4x5';
  cardTitle: string;
  categories: Array<{ title: string; choice: string; cost: number; auto?: boolean }>;
  spent: number;
  budgetTotal: number;
};

export type ShareResultCardProps = Keep4Drop4Data | Blind5RankData | Budgeting4x5Data;

// ── Game tag labels ─────────────────────────────────────────────────────────

const GAME_TAG: Record<ShareResultCardProps['type'], string> = {
  keep4drop4:    'ZADRŽI 4 • IZBACI 4',
  blind5rank:    'NA SLEPO • RANG',
  budgeting4x5:  'BUDŽETIRANJE • 4x5',
};

// ── Per-type content renderers ──────────────────────────────────────────────

function Keep4Drop4Content({ kept, dropped }: Pick<Keep4Drop4Data, 'kept' | 'dropped'>) {
  return (
    <View style={styles.resultsRow}>
      {/* Kept */}
      <View style={styles.col}>
        <View style={styles.colHeader}>
          <View style={[styles.colDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.colHeading, { color: '#10B981' }]}>
            ZADRŽANO ({kept.length})
          </Text>
        </View>
        {kept.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipTextKeep} numberOfLines={1}>✓ {t}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Dropped */}
      <View style={styles.col}>
        <View style={styles.colHeader}>
          <View style={[styles.colDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.colHeading, { color: '#EF4444' }]}>
            IZBAČENO ({dropped.length})
          </Text>
        </View>
        {dropped.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipTextDrop} numberOfLines={1}>✕ {t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Blind5RankContent({ ranks, labels }: Pick<Blind5RankData, 'ranks' | 'labels'>) {
  const sorted = Object.entries(ranks).sort(([, a], [, b]) => a - b);
  return (
    <View style={styles.singleCol}>
      <View style={styles.legendRow}>
        <Text style={styles.legendHint}>1 = {labels.rank1}</Text>
        <Text style={styles.legendHint}>5 = {labels.rank5}</Text>
      </View>
      {sorted.map(([item, rank]) => (
        <View key={item} style={styles.rankRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{rank}</Text>
          </View>
          <Text style={styles.rankItemText} numberOfLines={1}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Budgeting4x5Content({
  categories, spent, budgetTotal,
}: Pick<Budgeting4x5Data, 'categories' | 'spent' | 'budgetTotal'>) {
  return (
    <View style={styles.singleCol}>
      <View style={styles.budgetHeader}>
        <Text style={styles.colHeading2}>ODABRANO</Text>
        <Text style={styles.budgetSpent}>{spent} / {budgetTotal}</Text>
      </View>
      {categories.map((c) => (
        <View key={c.title} style={[styles.budgetRow, c.auto && styles.budgetRowAuto]}>
          <Text style={[styles.budgetCat, c.auto && styles.budgetCatAuto]} numberOfLines={1}>
            {c.title}
          </Text>
          <Text style={[styles.budgetChoice, c.auto && styles.budgetChoiceAuto]} numberOfLines={1}>
            {c.choice}
          </Text>
          {!c.auto && (
            <View style={styles.budgetCostBadge}>
              <Text style={styles.budgetCostText}>{c.cost}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Main card ───────────────────────────────────────────────────────────────

const ShareResultCard = forwardRef<View, ShareResultCardProps>((props, ref) => {
  return (
    <View style={styles.offScreen} pointerEvents="none">
      <View ref={ref} style={styles.card} collapsable={false}>

        {/* Header gradient band */}
        <LinearGradient
          colors={['#FF9A5C', '#FF6B1A']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={[styles.circle, { width: 90, height: 90, top: -30, right: -20 }]} />
          <View style={[styles.circle, { width: 60, height: 60, bottom: -20, left: 10 }]} />
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* Card title */}
        <View style={styles.titleRow}>
          <Text style={styles.gameTag}>{GAME_TAG[props.type]}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{props.cardTitle}</Text>
        </View>

        {/* Per-type content */}
        <View style={styles.content}>
          {props.type === 'keep4drop4' && (
            <Keep4Drop4Content kept={props.kept} dropped={props.dropped} />
          )}
          {props.type === 'blind5rank' && (
            <Blind5RankContent ranks={props.ranks} labels={props.labels} />
          )}
          {props.type === 'budgeting4x5' && (
            <Budgeting4x5Content
              categories={props.categories}
              spent={props.spent}
              budgetTotal={props.budgetTotal}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>slušajsadovo.com</Text>
        </View>

      </View>
    </View>
  );
});

export default ShareResultCard;

// ── Styles ──────────────────────────────────────────────────────────────────

const CARD_W = 360;

const styles = StyleSheet.create({
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  // Header
  header: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 160,
    height: 90,
  },

  // Title
  titleRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 4,
  },
  gameTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF6B1A',
    letterSpacing: 1.4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    lineHeight: 26,
  },

  // Content wrapper
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // ── Keep4Drop4 layout ────────────────────────────────────────────
  resultsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
    gap: 6,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  colDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  colHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  chip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  chipTextKeep: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  chipTextDrop: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    textDecorationLine: 'line-through',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginVertical: 4,
  },

  // ── Shared single-column layout (Blind5Rank + Budgeting4x5) ─────
  singleCol: {
    gap: 8,
  },

  // ── Blind5Rank ───────────────────────────────────────────────────
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  legendHint: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  rankItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // ── Budgeting4x5 ─────────────────────────────────────────────────
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  colHeading2: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF6B1A',
    letterSpacing: 0.8,
  },
  budgetSpent: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B1A',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  budgetRowAuto: {
    backgroundColor: '#F3F4F6',
    opacity: 0.55,
  },
  budgetCat: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.4,
    width: 72,
    textTransform: 'uppercase',
  },
  budgetCatAuto: { color: '#9CA3AF' },
  budgetChoice: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  budgetChoiceAuto: { color: '#9CA3AF' },
  budgetCostBadge: {
    backgroundColor: '#FF6B1A',
    borderRadius: 6,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  budgetCostText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },

  // Footer
  footer: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
  },
});
