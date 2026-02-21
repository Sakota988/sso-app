import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <LinearGradient colors={['#FF9A5C', '#FFD4A3', '#FFF0E6']} style={styles.container}>
      <View style={styles.iconWrapper}>
        <Settings size={48} color="#FF9A5C" strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Podešavanja</Text>
      <Text style={styles.subtitle}>Sadržaj dolazi uskoro</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(40,40,40,0.5)',
    fontWeight: '500',
  },
});
