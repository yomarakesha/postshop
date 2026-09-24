import React from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Header from "@/components/Header";
import useFavorite from "@/hooks/useFavorite";
import ActivityIndicator from "@/ui/ActivityIndicator";
import ProductsVerticalList from "@/components/ProductsVerticalList";
import { useRouter } from "expo-router";
import emptyFavoriteImage from "@assets/images/empty-favorite.png";
import { Image } from "expo-image";
import { View } from "react-native";
import Typography from "@/ui/Typography";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/useUserStore";
import Button from "@/ui/Button";

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { data, isLoading } = useFavorite({ enabled: false, t });
  const isGuest = useUserStore((s) => s.isGuest);
  const router = useRouter();

  const handlePress = (id: number) => {
    // Было `/product/${id}` — маршрута в единственном числе не существует, и
    // expo-router уводил куда угодно, только не на товар. Во всех остальных
    // экранах переход записан объектом с именем сегмента, так надёжнее:
    // опечатка в пути становится ошибкой типов, а не молчаливым промахом.
    router.push({ pathname: "/products/[id]", params: { id: String(id) } });
  };

  return (
    <>
      <Header
        title={t("client.favorites.headerTitle")}
        withGoBack
        backgroundColor={theme.colors.white}
      />
      {isLoading ? (
        <ActivityIndicator isFullScreen />
      ) : (
        <ProductsVerticalList
          t={t}
          data={data}
          onPress={handlePress}
          ListEmptyComponent={() => (
            <View style={styles.imageWrapper}>
              <Image
                source={emptyFavoriteImage}
                style={styles.image}
                contentFit="contain"
              />
              {/* Гость не может иметь избранного в принципе: раньше ему
                  показывали «У вас нет избранных товаров» — формально верно,
                  но непонятно, и без выхода к экрану входа. */}
              <View style={styles.emptyTextWrapper}>
                <Typography variant="p1" weight="semiBold" isCentered>
                  {isGuest
                    ? t("client.favorites.loginRequired.title")
                    : t("emptyState.favorites.title")}
                </Typography>
                <Typography
                  variant="t1"
                  weight="regular"
                  color="secondary"
                  isCentered
                >
                  {isGuest
                    ? t("client.favorites.loginRequired.description")
                    : t("emptyState.favorites.description")}
                </Typography>
              </View>
              {isGuest && (
                <Button
                  variant="primary"
                  title={t("common.logIn")}
                  onPress={() => router.push("/(auth)")}
                  style={styles.loginButton}
                />
              )}
            </View>
          )}
        />
      )}
    </>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create((theme) => ({
  imageWrapper: {
    margin: "auto",
    alignItems: "center",
    gap: theme.spacing(5),
    paddingHorizontal: theme.spacing(6),
  },
  emptyTextWrapper: {
    gap: theme.spacing(2),
  },
  image: {
    width: 120,
    aspectRatio: 1,
  },
  loginButton: {
    flexGrow: 0,
    alignSelf: "stretch",
    paddingHorizontal: theme.spacing(8),
  },
}));
