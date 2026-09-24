import React from "react";
import { Stack } from "expo-router";
import useScreenOptions from "@/hooks/useScreenOptions";

const MyProductsStack = () => {
  const screenOptions = useScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      {/* Было "edit-product" — такого файла нет; редактирование открывается
          через [id]. А create-product.tsx существует и объявлен не был. */}
      <Stack.Screen name="create-product" />
    </Stack>
  );
};

export default MyProductsStack;
