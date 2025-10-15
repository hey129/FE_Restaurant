import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { CartProvider } from "./context/_cartContext";
import { OnboardingSimple } from "./feed/_onboarding";

const ONBOARDING_KEY = "hasSeenOnboarding";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    } catch (error) {
      console.log("Error saving onboarding status:", error);
      setShowOnboarding(false);
    }
  };

  if (showOnboarding) {
    return <OnboardingSimple onFinish={handleFinishOnboarding} />;
  }

  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}
