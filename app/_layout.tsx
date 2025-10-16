import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { CartProvider } from "./context/_cartContext";
import { OnboardingSimple } from "./feed/_onboarding";

const ONBOARDING_KEY = "hasSeenOnboarding";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(hasSeenOnboarding !== "true");
    } catch (error) {
      console.log("Error checking onboarding status:", error);
      setShowOnboarding(true);
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setShowOnboarding(false);
      router.replace('/feed/_welcome');
    } catch (error) {
      console.log("Error saving onboarding status:", error);
      setShowOnboarding(false);
      router.replace('/feed/_welcome');
    }
  };

  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6B35' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingSimple onFinish={handleFinishOnboarding} />;
  }

  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}
