import React from "react";
import { Stack } from "expo-router";
import useScreenOptions from "@/hooks/useScreenOptions";

const BagStack = () => {
  const screenOption = useScreenOptions();
  return (
    <Stack screenOptions={screenOption}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="delivery-detail"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="pickup-map"
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack>
  );
};

export default BagStack;
