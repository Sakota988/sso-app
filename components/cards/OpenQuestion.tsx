import { useRef, useState } from 'react';
import { useGameStore, type OpenQuestionResult } from '../../store/gameStore';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle } from 'lucide-react-native';
import type { OpenQuestionCard } from '../../types/deck';
import CardHeader from '../common/CardHeader';
import CardTitle from '../common/CardTitle';
import ShareResultCard from '../ShareResultCard';
import OpenQuestionCardArea from './OpenQuestionCardArea';

const { width } = Dimensions.get('window');

const CARD_W = width - 40;

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
        <CardHeader
          imageSource={require('../../assets/titlovi/pitalica_title.png')}
          onBack={onBack}
          description={card.description}
          rightSlot={
            isDone ? (
              <CheckCircle size={16} color="#10B981" strokeWidth={2.5} />
            ) : (
              <Text style={styles.progressText}>?</Text>
            )
          }
          progressPillStyle={isDone ? styles.progressPillDone : undefined}
        />

        <CardTitle title={card.title} color="#5B21B6" />

        <OpenQuestionCardArea
          cardWidth={CARD_W}
          phase={phase}
          question={card.question}
          inputValue={inputValue}
          answer={card.answer}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          onTryAgain={() => fadeTransition(() => { setInputValue(''); setPhase('input'); })}
          onRevealAnswer={handleRevealAnswer}
          onOpenSource={handleOpenSource}
          onRestart={handleRestart}
          shareCardRef={shareCardRef}
          fadeAnim={fadeAnim}
        />
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
  titleImage: { width: '100%', height: 45 },
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
});
