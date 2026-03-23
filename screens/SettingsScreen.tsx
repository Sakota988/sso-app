import React from 'react';
import { StyleSheet, Text, View, Linking, Pressable } from 'react-native';
import { Settings, ExternalLink, Mail } from 'lucide-react-native';

// Replace with your actual URLs before App Store submission
const PRIVACY_POLICY_URL = 'https://slusajsadovo.com/privacy-policy/';
const TERMS_URL = 'https://slusajsadovo.com/terms-of-use/';
const SUPPORT_EMAIL = 'mailto:info@slusajsadovo.com';

async function openUrl(url: string) {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) Linking.openURL(url);
}

function SettingsRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <Icon size={20} color="#FF9A5C" strokeWidth={1.5} />
      <Text style={styles.rowLabel}>{label}</Text>
      <ExternalLink size={16} color="rgba(40,40,40,0.4)" strokeWidth={1.5} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const appVersion = '1.0.0';

  return (
    <View style={[styles.container, { backgroundColor: '#FFD4A3' }]}>
      <View style={styles.iconWrapper}>
        <Settings size={48} color="#FF9A5C" strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Podešavanja</Text>

      <View style={styles.section}>
        <SettingsRow
          icon={ExternalLink}
          label="Politika privatnosti"
          onPress={() => openUrl(PRIVACY_POLICY_URL)}
        />
        <SettingsRow
          icon={ExternalLink}
          label="Uslovi korišćenja"
          onPress={() => openUrl(TERMS_URL)}
        />
        <SettingsRow
          icon={Mail}
          label="Kontakt / Podrška"
          onPress={() => openUrl(SUPPORT_EMAIL)}
        />
      </View>

      <Text style={styles.version}>Verzija {appVersion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
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
    marginBottom: 24,
  },
  section: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  version: {
    marginTop: 24,
    fontSize: 13,
    color: 'rgba(40,40,40,0.5)',
    fontWeight: '500',
  },
});
