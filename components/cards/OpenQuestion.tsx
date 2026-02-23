import { useRef, useState } from 'react';
import { useGameStore, type OpenQuestionResult } from '../../store/gameStore';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle, ExternalLink, XCircle } from 'lucide-react-native';
import type { OpenQuestionCard } from '../../types/deck';
import CardTitle from './CardTitle';
import ShareResultCard from '../ShareResultCard';
import ShareButton from '../ShareButton';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const CARD_W = width - 48;
const HEADER_TOP = isSmall ? 44 : 64;

type Phase = 'input' | 'correct' | 'wrong' | 'revealed';

type Props = {
  card: OpenQuestionCard;
  onBack: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

function normalise(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isMatch(userInput: string, accepted: string[]) {
  const n = normalise(userInput);
  if (!n) return false;
  return accepted.some((a) => normalise(a) === n);
}

export default function OpenQuestion({ card, onBack, deckId }: Props) {
  const stored = useGameStore(
    (s) =>
      s.results[card.cardId]?.type === 'OPEN_QUESTION'
        ? (s.results[card.cardId] as OpenQuestionResult)
        : undefined
  );

  const [phase, setPhase] = useState<Phase>(() => {
    if (!stored) return 'input';
    return stored.matched ? 'correct' : 'revealed';
  });
  const [inputValue, setInputValue] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<View | null>(null);
  const saveResult = useGameStore((s) => s.saveResult);

  function fadeTransition(callback: () => void) {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }

  function handleSubmit() {
    Keyboard.dismiss();
    const matched = isMatch(inputValue, card.acceptedAnswers);
    const nextPhase: Phase = matched ? 'correct' : 'wrong';

    fadeTransition(() => {
      setPhase(nextPhase);
      saveResult({
        type: 'OPEN_QUESTION',
        cardId: card.cardId,
        deckId,
        cardTitle: card.title,
        userAnswer: inputValue.trim(),
        matched,
        playedAt: Date.now(),
      });
    });
  }

  function handleRevealAnswer() {
    fadeTransition(() => setPhase('revealed'));
  }

  function handleRestart() {
    fadeTransition(() => {
      setInputValue('');
      setPhase('input');
    });
  }

  function handleOpenSource() {
    if (card.answer.sourceUrl) {
      Linking.openURL(card.answer.sourceUrl).catch(() => {});
    }
  }

  const isDone = phase === 'correct' || phase === 'revealed';

  return (
    <View style={styles.root}>
      <ShareResultCard
        ref={shareCardRef}
        type="openquestion"
        cardTitle={card.title}
        question={card.question}
        userAnswer={inputValue.trim()}
        matched={phase === 'correct'}
        answerTitle={card.answer.title}
      />
      <LinearGradient
        colors={['#FF9A5C', '#FFCB96', '#FFF3E6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      <View style={[styles.bgCircle, { width: 260, height: 260, top: -90, right: -90 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, top: 240, left: -70 }]} />
      <View style={[styles.bgCircle, { width: 110, height: 110, bottom: 230, right: -25 }]} />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: HEADER_TOP }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeft size={20} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>OTVORENO PITANJE</Text>
            {!!card.description && (
              <Text style={styles.gameDesc} numberOfLines={1}>
                {card.description}
              </Text>
            )}
          </View>

          <View style={[styles.progressPill, isDone && styles.progressPillDone]}>
            {isDone ? (
              <CheckCircle size={16} color="#10B981" strokeWidth={2.5} />
            ) : (
              <Text style={styles.progressText}>?</Text>
            )}
          </View>
        </View>

        {!isDone && <CardTitle title={card.title} color="#5B21B6" />}

        {/* ── Card area ── */}
        <View style={styles.cardArea}>
          <Animated.View style={[{ width: CARD_W }, { opacity: fadeAnim }]}>
            {phase === 'input' && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>PITANJE</Text>
                <Text style={styles.questionText}>{card.question}</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Upiši odgovor..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline={false}
                    returnKeyType="done"
                    onSubmitEditing={inputValue.trim() ? handleSubmit : undefined}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, !inputValue.trim() && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!inputValue.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnTxt}>PROVJERI ODGOVOR</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === 'wrong' && (
              <View style={[styles.card, styles.cardWrong]}>
                <XCircle size={isSmall ? 36 : 48} color="#FCA5A5" strokeWidth={2} />
                <Text style={styles.resultEmoji} />
                <Text style={styles.resultTitle}>Nije to!</Text>
                <Text style={styles.wrongAnswerTxt}>
                  Tvoj odgovor:{' '}
                  <Text style={styles.wrongAnswerHighlight}>"{inputValue.trim()}"</Text>
                </Text>

                <View style={styles.wrongBtnRow}>
                  <TouchableOpacity
                    style={styles.tryAgainBtn}
                    onPress={() => {
                      fadeTransition(() => {
                        setInputValue('');
                        setPhase('input');
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tryAgainBtnTxt}>↺  Pokušaj ponovo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.revealBtn}
                    onPress={handleRevealAnswer}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.revealBtnTxt}>Vidi odgovor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(phase === 'correct' || phase === 'revealed') && (
              <ScrollView
                style={styles.answerCardScroll}
                contentContainerStyle={[
                  styles.card,
                  styles.answerCard,
                  phase === 'correct' && styles.answerCardCorrect,
                ]}
                showsVerticalScrollIndicator={false}
              >
                {phase === 'correct' ? (
                  <>
                    <CheckCircle size={isSmall ? 32 : 42} color="#6EE7B7" strokeWidth={2} />
                    <Text style={styles.correctBadge}>Tačno!</Text>
                  </>
                ) : (
                  <Text style={styles.revealedBadge}>Odgovor</Text>
                )}

                <Text style={styles.answerTitle}>{card.answer.title}</Text>
                <Text style={styles.answerDescription}>{card.answer.description}</Text>

                {!!card.answer.sourceUrl && (
                  <TouchableOpacity
                    style={styles.sourceBtn}
                    onPress={handleOpenSource}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={14} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                    <Text style={styles.sourceBtnTxt}>Izvor</Text>
                  </TouchableOpacity>
                )}

                <ShareButton viewRef={shareCardRef} />

                <TouchableOpacity
                  style={styles.restartBtn}
                  onPress={handleRestart}
                  activeOpacity={0.8}
                >
                  <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
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
  gameLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  gameDesc: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  progressPill: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPillDone: {
    backgroundColor: 'rgba(209,250,229,0.9)',
  },
  progressText: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },

  // ── Card area ────────────────────────────────────────────────────
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: isSmall ? 8 : 16,
    paddingBottom: 24,
  },

  // ── Base card ────────────────────────────────────────────────────
  card: {
    backgroundColor: '#5B21B6',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 20 : 28,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    gap: isSmall ? 12 : 16,
  },
  cardWrong: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
    alignItems: 'center',
  },
  answerCardScroll: {
    borderRadius: 24,
    flexGrow: 0,
  },
  answerCard: {
    backgroundColor: '#1E1B4B',
    borderColor: '#312E81',
    alignItems: 'center',
  },
  answerCardCorrect: {
    backgroundColor: '#064E3B',
    borderColor: '#065F46',
  },

  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.8,
  },

  questionText: {
    fontSize: isSmall ? 18 : 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: isSmall ? 26 : 32,
    letterSpacing: -0.2,
  },

  // ── Text input ───────────────────────────────────────────────────
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: isSmall ? 12 : 16,
    fontSize: isSmall ? 15 : 17,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Submit button ────────────────────────────────────────────────
  submitBtn: {
    backgroundColor: '#FF6B1A',
    borderRadius: 14,
    paddingVertical: isSmall ? 12 : 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  submitBtnTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },

  // ── Wrong state ──────────────────────────────────────────────────
  resultEmoji: { fontSize: 0 },
  resultTitle: {
    fontSize: isSmall ? 24 : 30,
    fontWeight: '900',
    color: '#fff',
  },
  wrongAnswerTxt: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  wrongAnswerHighlight: {
    color: '#FCA5A5',
    fontWeight: '700',
  },
  wrongBtnRow: {
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  tryAgainBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
    paddingVertical: isSmall ? 11 : 14,
    alignItems: 'center',
  },
  tryAgainBtnTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  revealBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: isSmall ? 11 : 14,
    alignItems: 'center',
  },
  revealBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },

  // ── Answer / result card ─────────────────────────────────────────
  correctBadge: {
    fontSize: isSmall ? 22 : 28,
    fontWeight: '900',
    color: '#6EE7B7',
  },
  revealedBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  answerTitle: {
    fontSize: isSmall ? 22 : 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: isSmall ? 28 : 36,
  },
  answerDescription: {
    fontSize: isSmall ? 13 : 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: isSmall ? 20 : 22,
    textAlign: 'center',
  },

  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sourceBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.4,
  },

  restartBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
  },
  restartBtnTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
  },
});
