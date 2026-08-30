import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import DecksScreen from './screens/DecksScreen';
import SettingsScreen from './screens/SettingsScreen';
import DeckDetailsScreen from './screens/DeckDetailsScreen';
import CustomTabBar from './components/CustomTabBar';
import { DeckNavContext } from './contexts/DeckNavContext';
import type { DeckDisplay } from './types/deck';

const Tab = createBottomTabNavigator();

export default function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckDisplay | null>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <DeckNavContext.Provider value={{ openDeck: setSelectedDeck }}>
          {selectedDeck ? (
            <DeckDetailsScreen
              deck={selectedDeck}
              onBack={() => setSelectedDeck(null)}
            />
          ) : (
            <NavigationContainer>
              <Tab.Navigator
                initialRouteName="DecksTab"
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{ headerShown: false }}
              >
                <Tab.Screen name="HomeTab"     component={HomeScreen} />
                <Tab.Screen name="DecksTab"    component={DecksScreen} />
                <Tab.Screen name="SettingsTab" component={SettingsScreen} />
              </Tab.Navigator>
            </NavigationContainer>
          )}
        </DeckNavContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
