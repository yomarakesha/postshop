import React from "react";
import { Stack } from "expo-router";
import useScreenOptions from "@/hooks/useScreenOptions";

const OrdersStack = () => {
  const screenOption = useScreenOptions();
  return (
    <Stack screenOptions={screenOption}>
      <Stack.Screen name="index" />
      {/* Экран заказа лежит в order/[id].tsx, то есть внутри стека
          называется "order/[id]". Объявление "[id]" не соответствовало
          ничему: такого файла на этом уровне нет. */}
      <Stack.Screen name="order/[id]" />
    </Stack>
  );
};

export default OrdersStack;
