import useAppStore from "@/store/useAppStore";
import { Redirect } from "expo-router";
import React from "react";

const RootNavigator = () => {
  const mode = useAppStore((s) => s.mode);
  const apiUrl = useAppStore((s) => s.apiUrl);

  // Пока не задан адрес сервера, идти некуда: любой экран упрётся в пустой
  // baseURL и покажет ошибку сети вместо объяснения, чего не хватает.
  if (!apiUrl) {
    return <Redirect href="/server-setup" />;
  }

  if (mode === "client") {
    return <Redirect href="/(client-tabs)/(home)" />;
  }
  if (mode === "shop") {
    return <Redirect href="/(shop-tabs)/(home)" />;
  }

  return <Redirect href="/(auth)" />;
};

export default RootNavigator;
