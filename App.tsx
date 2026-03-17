import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useStore } from './src/store/useStore';

function AppContent() {
  const isOnboarded = useStore((s) => s.isOnboarded);
  const [showOnboarding, setShowOnboarding] = useState(!isOnboarded);

  if (showOnboarding && !isOnboarded) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppContent />
    </SafeAreaProvider>
  );
}
