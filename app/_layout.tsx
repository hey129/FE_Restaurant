import { Slot, useRouter } from "expo-router";
import React, { useState } from "react";
import { CartProvider } from "./context/_cartContext";
import { OnboardingSimple } from "./auth/_onboarding";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const router = useRouter();

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    setTimeout(() => {
      router.replace('/feed/_welcome');
    }, 50);
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