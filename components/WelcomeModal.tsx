import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const STORAGE_KEY = '@sso_welcome_seen';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === null) setVisible(true);
    });
  }, []);

  const handleClose = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <LinearGradient
            colors={['#FF9A5C', '#FFD4A3']}
            style={styles.logoBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.circle, { width: 120, height: 120, top: -40, right: -30 }]} />
            <View style={[styles.circle, { width: 80, height: 80, bottom: -20, left: -20 }]} />
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.title}>Dobrodošli u SSO!</Text>

            <View style={styles.stepList}>
              <View style={styles.step}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>
                  Odaberi svoj špil i igraj u našem poznatom stilu pitanja.
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>
                  Svaki špil donosi jedinstvena pitanja koja pokreću razgovor.
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>
                  Želiš još pitanja? Kupi novi špil i pomozi nam da rastemo! 🙌
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleClose} activeOpacity={0.82}>
              <LinearGradient
                colors={['#FF9A5C', '#FF6B1A']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.btnText}>Hajde da igramo! 🎮</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#C46A28',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  logoBanner: {
    alignItems: 'center',
    paddingVertical: 28,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 200,
    height: 130,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  stepList: {
    gap: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B1A',
    marginTop: 6,
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 21,
  },
  btn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
