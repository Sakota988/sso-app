import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import ShareButton from '../ShareButton';

const { height } = Dimensions.get('window');
const isSmall = height < 700;

const PANEL_H = isSmall ? 110 : 150;
const HEADER_TOP = isSmall ? 44 : 64;
const TRAIT_FONT = isSmall ? 20 : 28;
const RESERVED = HEADER_TOP + 55 + (isSmall ? 44 : 80) + PANEL_H + 22 + 36;

type Props = {
  cardWidth: number;
  isDone: boolean;
  trait: string;
  mustKeep: boolean;
  mustDrop: boolean;
  keptCount: number;
  showBack2: boolean;
  showBack1: boolean;
  onKeep: () => void;
  onDrop: () => void;
  onRestart: () => void;
  shareCardRef: React.RefObject<View | null>;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
};

const cardHeight = (w: number) =>
  Math.min(Math.round(w * 1.2), height - RESERVED);

export default function Keep4Drop4CardArea({
  cardWidth,
  isDone,
  trait,
  mustKeep,
  mustDrop,
  keptCount,
  showBack2,
  showBack1,
  onKeep,
  onDrop,
  onRestart,
  shareCardRef,
  fadeAnim,
  slideAnim,
}: Props) {
  const CARD_H = cardHeight(cardWidth);

  return (
    <View style={styles.cardArea}>
      {isDone ? (
        <View style={[styles.doneCard, { width: cardWidth, height: CARD_H }]}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTxt}>Gotovo!</Text>
          <Text style={styles.doneSubTxt}>
            Zadržao/la si {keptCount} osobine
          </Text>
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={onRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
          </TouchableOpacity>

          <ShareButton viewRef={shareCardRef} />
        </View>
      ) : (
        <View style={[styles.cardStack, { width: cardWidth, height: CARD_H + 22 }]}>
          {showBack2 && <View style={[styles.card, styles.cardBack2, { width: cardWidth, height: CARD_H }]} />}
          {showBack1 && <View style={[styles.card, styles.cardBack1, { width: cardWidth, height: CARD_H }]} />}
          <Image
            source={require('../../assets/logo.png')}
            style={styles.cardLogo}
            resizeMode="contain"
          />

          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { width: cardWidth, height: CARD_H, opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <Text style={styles.traitLabel}>OSOBINA</Text>
            <Text style={[styles.traitName, { fontSize: TRAIT_FONT }]}>{trait}</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.dropBtn, mustKeep && styles.btnDisabled]}
                onPress={onDrop}
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
                onPress={onKeep}
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
  );
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    position: 'relative',
  },
  card: {
    position: 'absolute',
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
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: TRAIT_FONT + 8,
  },

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

  doneCard: {
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
});
