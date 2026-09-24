import React from "react";
import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

const BecomeSellerStack = () => {
  const { theme } = useUnistyles();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.gray2,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[type]" />
    </Stack>
  );
};

export default BecomeSellerStack;
