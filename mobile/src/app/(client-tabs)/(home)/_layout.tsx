import useScreenOptions from "@/hooks/useScreenOptions";
import { Stack } from "expo-router";
import React from "react";

const HomeStack = () => {
  const screenOption = useScreenOptions();
  return (
    <Stack screenOptions={screenOption}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default HomeStack;
