import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onNext: () => void;
  onRestart: () => void;
  marginTop?: number;
};

export default function DoneCardButtons({ onNext, onRestart, marginTop = 8 }: Props) {
  return (
    <View style={[styles.row, { marginTop }]}>
      <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.nextBtnTxt}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
        <Text style={styles.restartBtnTxt}>↺  Ponovi pitanje</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  nextBtn: {
    backgroundColor: '#FF6B1A',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
  },
  nextBtnTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
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
