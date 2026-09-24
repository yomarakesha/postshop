import React from "react";
import { Stack } from "expo-router";
import useScreenOptions from "@/hooks/useScreenOptions";

const ProfileStack = () => {
  const screenOption = useScreenOptions();
  return (
    <Stack screenOptions={screenOption}>
      <Stack.Screen name="index" />
      <Stack.Screen name="become-seller-onboarding" />
      {/* Здесь были объявлены terms-of-use и privacy-policy, которых в этой
          папке нет — они живут в группе (legal) и открываются оттуда.
          А edit-profile и favorites, которые здесь есть, объявлены не были. */}
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
};

export default ProfileStack;
