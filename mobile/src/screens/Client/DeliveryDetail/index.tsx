import React from "react";
import { View, useWindowDimensions, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RenderHtml from "react-native-render-html";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Typography from "@/ui/Typography";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { deliveryMessageApi } from "@/api/deliveryMessageApi";
import useAppStore from "@/store/useAppStore";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";

const DeliveryDetailScreen = () => {
  const deliveryMessageQuery = deliveryMessageApi.useGet();
  const currentLanguage = useAppStore((s) => s.lang);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  // Ссылки внутри HTML раньше рисовались чёрным подчёркнутым текстом —
  // отличить их от обычного абзаца было невозможно.
  const tagsStyles = React.useMemo(
    () => ({
      ...baseTagsStyles,
      a: { ...baseTagsStyles.a, color: theme.colors.blueMain },
    }),
    [theme.colors.blueMain],
  );

  const translations = deliveryMessageQuery.data?.translations ?? [];
  const html =
    translations.find((item) => item.language === currentLanguage)?.text ?? "";

  const header = (
    <Header
      backgroundColor="white"
      title={t("client.deliveryDetail.aboutDelivery")}
      withGoBack
    />
  );

  // Раньше загрузка рисовалась без шапки — экран «прыгал», когда данные
  // приходили и шапка появлялась.
  if (deliveryMessageQuery.isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <ActivityIndicator isFullScreen />
      </View>
    );
  }

  // 404 здесь означает «текст ещё не заполнили в админке», а не поломку связи.
  // Показывать при этом «Проверьте подключение» — врать: человек будет чинить
  // интернет, которого хватает. Такой случай ведём в пустое состояние ниже.
  const isNotFilledIn = deliveryMessageQuery.error?.response?.status === 404;

  if (deliveryMessageQuery.isError && !isNotFilledIn) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.center}>
          <Typography variant="p1" weight="semiBold" style={styles.centerText}>
            {t("networkError.title")}
          </Typography>
          <Typography
            variant="t1"
            weight="medium"
            color="secondary"
            style={styles.centerText}
          >
            {t("networkError.description")}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + CONTENT_PADDING },
          !html && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {html ? (
          <RenderHtml
            contentWidth={width - CONTENT_PADDING * 2}
            source={{ html }}
            baseStyle={styles.htmlBase}
            tagsStyles={tagsStyles}
          />
        ) : (
          <Typography
            variant="t1"
            weight="medium"
            color="secondary"
            style={styles.centerText}
          >
            {t("client.deliveryDetail.empty")}
          </Typography>
        )}
      </ScrollView>
    </View>
  );
};

export default DeliveryDetailScreen;

/** Боковые поля контента; из них же считается ширина для RenderHtml. */
const CONTENT_PADDING = 16;

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: CONTENT_PADDING,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing(8),
    gap: theme.spacing(2),
    backgroundColor: theme.colors.white,
  },
  centerText: {
    textAlign: "center",
  },
  htmlBase: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
}));

// стили для самих HTML-тегов, чтобы текст выглядел аккуратно
const baseTagsStyles = {
  p: { marginTop: 0, marginBottom: 12, lineHeight: 24 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  h2: { fontSize: 19, fontWeight: "700", marginBottom: 10 },
  ul: { marginBottom: 12 },
  li: { marginBottom: 6 },
  img: { borderRadius: 8 },
  a: { textDecorationLine: "underline" },
} as const;
