import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS: Record<string, { label: string; icon: ReturnType<typeof require>; iconActive: ReturnType<typeof require> }> = {
  HomeTab:     { label: 'Početna',     icon: require('../assets/tab-icons/igre_icon.png'),   iconActive: require('../assets/tab-icons/igre_active_icon.png') },
  DecksTab:    { label: 'Špilovi',     icon: require('../assets/tab-icons/decks_icon.png'),  iconActive: require('../assets/tab-icons/decks_active.png') },
  SettingsTab: { label: 'Podešavanja', icon: require('../assets/tab-icons/profil_icon.png'), iconActive: require('../assets/tab-icons/profil_active_icon.png') },
};

const ACTIVE_COLOR   = '#FF9A5C';
const INACTIVE_COLOR = 'rgba(255,255,255,0.38)';


export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const tab = TABS[route.name];
        if (!tab) return null;
        const { label, icon, iconActive } = tab;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeIndicator} />}
            <Image
              source={isActive ? iconActive : icon}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 14, 14, 0.96)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingBottom: 30,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    position: 'relative',
  },
  icon: {
    width: 32,
    height: 32,
  },
  activeIndicator: {
    position: 'absolute',
    top: -14,
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF9A5C',
  },
  label: {
    fontSize: 10,
    color: INACTIVE_COLOR,
    fontWeight: '500',
  },
  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '700',
  },
});
