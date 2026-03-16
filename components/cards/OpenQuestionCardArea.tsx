import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle, ExternalLink, XCircle } from 'lucide-react-native';
import type { OpenQuestionAnswer } from '../../types/deck';
import ShareButton from '../ShareButton';
import DoneCardButtons from '../common/DoneCardButtons';

const { height } = Dimensions.get('window');
const isSmall = height < 700;

type Phase = 'input' | 'correct' | 'wrong' | 'revealed';

type Props = {
  cardWidth: number;
  phase: Phase;
  question: string;
  inputValue: string;
  answer: OpenQuestionAnswer;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onOpenSource: () => void;
  onRestart: () => void;
  onNext: () => void;
  shareCardRef: React.RefObject<View | null>;
  fadeAnim: Animated.Value;
};

export default function OpenQuestionCardArea({
  cardWidth,
  phase,
  question,
  inputValue,
  answer,
  onInputChange,
  onSubmit,
  onTryAgain,
  onRevealAnswer,
  onOpenSource,
  onRestart,
  onNext,
  shareCardRef,
  fadeAnim,
}: Props) {
  return (
    <View style={styles.cardArea}>
      <Animated.View style={[{ width: cardWidth }, { opacity: fadeAnim }]}>
        {phase === 'input' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PITANJE</Text>
            <Text style={styles.questionText}>{question}</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={onInputChange}
                placeholder="Upiši odgovor..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline={false}
                returnKeyType="done"
                onSubmitEditing={inputValue.trim() ? onSubmit : undefined}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !inputValue.trim() && styles.submitBtnDisabled]}
              onPress={onSubmit}
              disabled={!inputValue.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnTxt}>PROVERI ODGOVOR</Text>
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
                onPress={onTryAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.tryAgainBtnTxt}>↺  Pokušaj ponovo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.revealBtn}
                onPress={onRevealAnswer}
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

            <Text style={styles.answerTitle}>{answer.title}</Text>
            <Text style={styles.answerDescription}>{answer.description}</Text>

            {!!answer.sourceUrl && (
              <TouchableOpacity
                style={styles.sourceBtn}
                onPress={onOpenSource}
                activeOpacity={0.8}
              >
                <ExternalLink size={14} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                <Text style={styles.sourceBtnTxt}>Izvor</Text>
              </TouchableOpacity>
            )}

            <ShareButton viewRef={shareCardRef} />

            <DoneCardButtons onNext={onNext} onRestart={onRestart} />
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 100,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#5B21B6',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    padding: isSmall ? 14 : 18,
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
    fontSize: isSmall ? 15 : 18,
    fontWeight: '800',
    color: '#fff',
    lineHeight: isSmall ? 22 : 26,
    letterSpacing: -0.2,
  },
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
});
