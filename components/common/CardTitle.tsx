import { Dimensions, StyleSheet, Text } from 'react-native';

const { height } = Dimensions.get('window');
const isSmall    = height < 700;
const FONT       = isSmall ? 22 : 30;

type Props = {
  title: string;
  color?: string;
};

export default function CardTitle({ title, color }: Props) {
  if (!title) return null;
  return (
    <Text
      style={[
        styles.title,
        color && { color, textShadowColor: `${color}4D` },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONT,
    fontWeight: '900',
    color: '#FF6B1A',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: FONT + 6,
    textShadowColor: 'rgba(255,107,26,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: isSmall ? 6 : 12,
  },
});
