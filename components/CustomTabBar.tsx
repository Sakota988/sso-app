import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Layers, Settings } from 'lucide-react-native';

const TABS: Record<string, { label: string; Icon: typeof Home }> = {
  HomeTab:     { label: 'Početna',     Icon: Home },
  DecksTab:    { label: 'Špilovi',     Icon: Layers },
  SettingsTab: { label: 'Podešavanja', Icon: Settings },
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
        const { label, Icon } = tab;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeIndicator} />}
            <Icon
              size={22}
              color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              strokeWidth={isActive ? 2.2 : 1.8}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    position: 'relative',
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
