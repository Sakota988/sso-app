import { useCallback, useRef, useState } from 'react';
import { useGameStore, type TopXResult } from '../../store/gameStore';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import type { TopXCard } from '../../types/deck';
import { shuffle } from '../../utils/shuffle';
import CardHeader from '../common/CardHeader';
import CardTitle from '../common/CardTitle';
import ShareResultCard from '../ShareResultCard';
import TopXCardArea from './TopXCardArea';

const { width } = Dimensions.get('window');
const CARD_W = width - 48;
const ACCENT = '#9D174D';

type Props = {
  card: TopXCard;
  onBack: () => void;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  deckId: string;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isValidTopXPayload(card: TopXCard): boolean {
  const { options, answers } = card;
  if (!isStringArray(options) || !isStringArray(answers)) return false;
  if (options.length < 2 || answers.length < 2) return false;
  if (options.length !== answers.length) return false;
  return true;
}

export function scoreTopX(userOrder: string[], answers: string[]): number {
  let score = 0;
  for (let i = 0; i < answers.length; i++) {
    if (userOrder[i] === answers[i]) score += 1;
  }
  return score;
}

export default function TopX({ card, onBack, onNext, deckId }: Props) {
  const valid = isValidTopXPayload(card);

  const stored = useGameStore((s) =>
    s.results[card.cardId]?.type === 'TOP_X'
      ? (s.results[card.cardId] as TopXResult)
      : undefined,
  );

  const [userOrder, setUserOrder] = useState<string[]>(() =>
    stored?.userOrder ?? (valid ? [...card.options] : []),
  );
  const [score, setScore] = useState(() => stored?.score ?? 0);
  const [isDone, setIsDone] = useState(() => !!stored);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<View | null>(null);
  const saveResult = useGameStore((s) => s.saveResult);

  const n = valid ? card.answers.length : 0;
  const answers = stored?.answers ?? (valid ? [...card.answers] : []);
  const isPerfect = isDone && n > 0 && score === n;

  function fadeTransition(callback: () => void) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  const handleReorder = useCallback((next: string[]) => {
    setUserOrder(next);
  }, []);

  function handleSubmit() {
    if (!valid || isDone) return;
    const nextScore = scoreTopX(userOrder, card.answers);
    fadeTransition(() => {
      setScore(nextScore);
      setIsDone(true);
      saveResult({
        type: 'TOP_X',
        cardId: card.cardId,
        deckId,
        cardTitle: card.title,
        userOrder,
        answers: [...card.answers],
        score: nextScore,
        playedAt: Date.now(),
      });
    });
  }

  function handleRestart() {
    if (!valid) return;
    fadeTransition(() => {
      setUserOrder(shuffle([...card.options]));
      setScore(0);
      setIsDone(false);
    });
  }

  return (
    <View style={styles.root}>
      <ShareResultCard
        ref={shareCardRef}
        type="topx"
        cardTitle={card.title}
        question={card.question}
        userOrder={userOrder}
        answers={answers}
        score={score}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFCB96' }]} />

      <View style={[styles.bgCircle, { width: 260, height: 260, top: -90, right: -90 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, top: 240, left: -70 }]} />
      <View style={[styles.bgCircle, { width: 110, height: 110, bottom: 230, right: -25 }]} />

      <View style={styles.safe}>
        <CardHeader
          imageSource={require('../../assets/titlovi/raspored_title.png')}
          onBack={onBack}
          description={card.description}
          rightSlot={
            isDone ? (
              <Text style={[styles.progressText, { color: isPerfect ? '#059669' : '#B45309' }]}>
                {score}/{n}
              </Text>
            ) : (
              <Text style={styles.progressText}>{n || '—'}</Text>
            )
          }
          progressPillStyle={
            isDone ? (isPerfect ? styles.pillPerfect : styles.pillDone) : undefined
          }
        />

        <CardTitle title={card.title} color={ACCENT} />

        {!valid ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Kartica nije ispravna. Opcije i odgovori nisu usklađeni.</Text>
          </View>
        ) : (
          <TopXCardArea
            cardWidth={CARD_W}
            isDone={isDone}
            question={card.question}
            userOrder={userOrder}
            answers={answers}
            score={score}
            isPerfect={isPerfect}
            onReorder={handleReorder}
            onSubmit={handleSubmit}
            onRestart={handleRestart}
            onNext={onNext}
            shareCardRef={shareCardRef}
            fadeAnim={fadeAnim}
          />
        )}
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

  progressText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  pillPerfect: { backgroundColor: 'rgba(209,250,229,0.95)' },
  pillDone: { backgroundColor: 'rgba(254,243,199,0.95)' },

  errorBox: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
