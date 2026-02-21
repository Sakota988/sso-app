import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import type { Keep4Drop4Card } from '../../types/deck';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W    = width - 48;
const PANEL_H   = isSmall ? 140 : 190;
const HEADER_TOP = isSmall ? 44 : 64;
const TITLE_FONT = isSmall ? 22 : 38;
const TRAIT_FONT = isSmall ? 26 : 36;

// Reserve space: header top padding + header content + title block + panel + cardStack offset + breathing room
const RESERVED = HEADER_TOP + 55 + (isSmall ? 44 : 80) + PANEL_H + 22 + 36;
const CARD_H    = Math.min(Math.round(CARD_W * 1.2), height - RESERVED);

const MAX_KEEP = 4;

type Props = {
  card: Keep4Drop4Card;
  onBack: () => void;
  cardNumber: number;
  totalCards: number;
};

export default function Keep4Drop4({ card, onBack }: Props) {
  const traits = card.traits;
  const total = traits.length;

  const [index, setIndex] = useState(0);
  const [kept, setKept] = useState<string[]>([]);
  const [dropped, setDropped] = useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isDone = index >= total;
  const keepSlotsLeft = MAX_KEEP - kept.length;
  const remainingCount = total - index;
  const mustKeep = !isDone && keepSlotsLeft > 0 && remainingCount <= keepSlotsLeft;
  const mustDrop = !isDone && keepSlotsLeft <= 0;

  function animateTransition(dir: 1 | -1, callback: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * 55, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(-dir * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  function handleKeep() {
    if (mustDrop || isDone) return;
    animateTransition(1, () => {
      const trait = traits[index];
      const newKept = [...kept, trait];
      setKept(newKept);

      if (newKept.length >= MAX_KEEP) {
        setDropped((d) => [...d, ...traits.slice(index + 1)]);
        setIndex(total);
      } else {
        const nextIdx = index + 1;
        const newRemaining = total - nextIdx;
        const newSlots = MAX_KEEP - newKept.length;
        if (newRemaining > 0 && newRemaining <= newSlots) {
          setKept((k) => [...k, ...traits.slice(nextIdx)]);
          setIndex(total);
        } else {
          setIndex(nextIdx);
        }
      }
    });
  }

  function handleDrop() {
    if (mustKeep || isDone) return;
    animateTransition(-1, () => {
      const trait = traits[index];
      const newDropped = [...dropped, trait];
      setDropped(newDropped);

      const nextIdx = index + 1;
      const newRemaining = total - nextIdx;
      const currentSlots = MAX_KEEP - kept.length;
      if (newRemaining > 0 && newRemaining <= currentSlots) {
        setKept((k) => [...k, ...traits.slice(nextIdx)]);
        setIndex(total);
      } else {
        setIndex(nextIdx);
      }
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FF9A5C', '#FFCB96', '#FFF3E6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Decorative background circles */}
      <View style={[styles.bgCircle, { width: 260, height: 260, top: -90, right: -90 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, top: 240, left: -70 }]} />
      <View style={[styles.bgCircle, { width: 110, height: 110, bottom: 230, right: -25 }]} />

      <View style={styles.safe}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeft size={20} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require('../../assets/zadrzi4izbaci4TITLE.png')}
              style={styles.titleImage}
              resizeMode="contain"
            />
            {!!card.description && (
              <Text style={styles.gameDesc} numberOfLines={1}>
                {card.description}
              </Text>
            )}
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              {isDone ? total : index + 1} / {total}
            </Text>
          </View>
        </View>

        {!!card.title && (
          <View style={styles.titleBlock}>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        )}
        
        {/* ── Card area ── */}
        <View style={styles.cardArea}>
          {isDone ? (
            <View style={styles.doneCard}>
              <Text style={styles.doneEmoji}>🎉</Text>
              <Text style={styles.doneTxt}>Gotovo!</Text>
              <Text style={styles.doneSubTxt}>
                Zadržao/la si {kept.length} osobine
              </Text>
              <TouchableOpacity
                style={styles.restartBtn}
                onPress={() => {
                  setIndex(0);
                  setKept([]);
                  setDropped([]);
                  fadeAnim.setValue(1);
                  slideAnim.setValue(0);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardStack}>
              {index + 2 < total && <View style={[styles.card, styles.cardBack2]} />}
              {index + 1 < total && <View style={[styles.card, styles.cardBack1]} />}
              <Image
                source={require('../../assets/logo.png')}
                style={styles.cardLogo}
                resizeMode="contain"
              />

              <Animated.View
                style={[
                  styles.card,
                  styles.cardFront,
                  { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                ]}
              >
                <Text style={styles.traitLabel}>OSOBINA</Text>
                <Text style={styles.traitName}>{traits[index]}</Text>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.dropBtn, mustKeep && styles.btnDisabled]}
                    onPress={handleDrop}
                    disabled={mustKeep}
                    activeOpacity={0.8}
                  >
                    <X size={20} color={mustKeep ? 'rgba(255,255,255,0.3)' : '#fff'} strokeWidth={2.5} />
                    <Text style={[styles.actionBtnTxt, mustKeep && styles.actionBtnTxtOff]}>
                      IZBACI
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.keepBtn, mustDrop && styles.btnDisabled]}
                    onPress={handleKeep}
                    disabled={mustDrop}
                    activeOpacity={0.8}
                  >
                    <Check size={20} color={mustDrop ? 'rgba(255,255,255,0.3)' : '#fff'} strokeWidth={2.5} />
                    <Text style={[styles.actionBtnTxt, mustDrop && styles.actionBtnTxtOff]}>
                      ZADRŽI
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          )}
        </View>

        {/* ── Bottom panel ── */}
        <View style={styles.panel}>
          <View style={styles.panelRow}>
            {/* Kept column */}
            <View style={styles.panelCol}>
              <Text style={styles.panelHeadKeep}>
                ✓ ZADRŽANO ({kept.length}/{MAX_KEEP})
              </Text>
              <ScrollView
                style={styles.panelScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {kept.length === 0 ? (
                  <Text style={styles.panelEmpty}>—</Text>
                ) : (
                  kept.map((t) => (
                    <Text key={t} style={styles.panelItemKeep}>
                      • {t}
                    </Text>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.panelDivider} />

            {/* Dropped column */}
            <View style={styles.panelCol}>
              <Text style={styles.panelHeadDrop}>
                ✕ IZBAČENO ({dropped.length})
              </Text>
              <ScrollView
                style={styles.panelScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {dropped.length === 0 ? (
                  <Text style={styles.panelEmpty}>—</Text>
                ) : (
                  dropped.map((t) => (
                    <Text key={t} style={styles.panelItemDrop}>
                      • {t}
                    </Text>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: HEADER_TOP,
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  titleImage: {
    width: '100%',
    height: 40,
  },
  gameDesc: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  titleBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: isSmall ? 6 : 16,
  },
  cardTitle: {
    fontSize: TITLE_FONT,
    fontWeight: '900',
    color: '#FF6B1A',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: TITLE_FONT + 6,
    textShadowColor: 'rgba(255,107,26,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  progressPill: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 52,
    alignItems: 'center',
  },
  progressText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },

  // ── Card area ────────────────────────────────────────────────────
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    width: CARD_W,
    height: CARD_H + 22,
  },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    top: 11,
    left: 0,
  },
  cardBack2: {
    backgroundColor: '#B8C8FF',
    transform: [{ rotate: '-5deg' }],
    opacity: 0.55,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cardBack1: {
    backgroundColor: '#7B9FFF',
    transform: [{ rotate: '-2.5deg' }],
    opacity: 0.7,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  cardFront: {
    backgroundColor: '#3D5AF1',
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 18 : 28,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardLogo: {
    position: 'absolute',
    top: 18,
    right: 12,
    width: 64,
    height: 64,
    zIndex: 20,
  },
  traitLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.8,
    alignSelf: 'flex-start',
  },
  traitName: {
    fontSize: TRAIT_FONT,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: TRAIT_FONT + 8,
  },

  // ── Action buttons on card ───────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: isSmall ? 9 : 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dropBtn: { backgroundColor: '#EF4444' },
  keepBtn: { backgroundColor: '#10B981' },
  btnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  actionBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
  },
  actionBtnTxtOff: { color: 'rgba(255,255,255,0.3)' },

  // ── Done state ───────────────────────────────────────────────────
  doneCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    backgroundColor: '#3D5AF1',
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  doneEmoji: { fontSize: isSmall ? 36 : 48 },
  doneTxt: { fontSize: isSmall ? 22 : 28, fontWeight: '900', color: '#fff' },
  doneSubTxt: { fontSize: isSmall ? 12 : 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  restartBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
  },
  restartBtnTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
  },

  // ── Bottom panel ─────────────────────────────────────────────────
  panel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: isSmall ? 12 : 18,
    paddingHorizontal: 20,
    paddingBottom: isSmall ? 16 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
    height: PANEL_H,
  },
  panelRow: {
    flexDirection: 'row',
    gap: 14,
    height: '100%',
  },
  panelCol: { flex: 1 },
  panelScroll: { maxHeight: PANEL_H - 60 },
  panelDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  panelHeadKeep: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelHeadDrop: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelEmpty: { fontSize: 13, color: '#D1D5DB', fontStyle: 'italic' },
  panelItemKeep: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 5,
    lineHeight: 18,
  },
  panelItemDrop: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 5,
    lineHeight: 18,
    textDecorationLine: 'line-through',
  },
});
