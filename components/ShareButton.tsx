import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

type Props = {
  viewRef: React.RefObject<View | null>;
};

export default function ShareButton({ viewRef }: Props) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!viewRef.current || sharing) return;
    try {
      setSharing(true);
      const uri = await captureRef(viewRef as React.RefObject<View>, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Podeli rezultate',
        });
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.btn, sharing && styles.btnDisabled]}
      onPress={handleShare}
      disabled={sharing}
      activeOpacity={0.8}
    >
      <Share2 size={16} color="#fff" strokeWidth={2.5} />
      <Text style={styles.label}>
        {sharing ? 'Generiše...' : 'Podeli rezultate'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.6 },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
