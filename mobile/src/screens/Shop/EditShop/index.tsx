import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { StyleSheet } from "react-native-unistyles";

import Typography from "@/ui/Typography";
import Header from "@/components/Header";
import RightChevronIcon from "@assets/icons/right-chevron.svg";
import { useTranslation } from "react-i18next";

export type ShopAdditionalEditLinkType =
  // | "warehouse"
  "name" | "addresses" | "phones" | "color" | "logo";

const EditShopScreen = () => {
  const { t } = useTranslation();

  const steps: { key: ShopAdditionalEditLinkType; title: string }[] = [
    // { key: "warehouse", title: "Ammar görnüşi" },
    { key: "name", title: t("store.editShopAdditional.baseInfo") },
    { key: "addresses", title: t("store.editShopAdditional.address") },
    { key: "phones", title: t("store.editShopAdditional.phoneNumbers") },
    { key: "color", title: t("store.editShopAdditional.color") },
    { key: "logo", title: t("store.editShopAdditional.logo") },
  ];

  const onPressStep = (step: ShopAdditionalEditLinkType) => {
    router.push({
      pathname: "/(shop-tabs)/(profile)/edit-shop/[step]",
      params: {
        step,
      },
    });
  };

  return (
    <>
      <Header
        title={t("store.editShopAdditional.headerTitle")}
        backgroundColor="white"
      />
      <View style={styles.container}>
        {steps.map((step) => (
          <Pressable
            key={step.key}
            onPress={() => onPressStep(step.key)}
            style={styles.tile}
          >
            <Typography weight="medium" numberOfLines={1} style={styles.shrink}>
              {step.title}
            </Typography>
            <RightChevronIcon style={styles.chevron} />
          </Pressable>
        ))}
      </View>
    </>
  );
};

export default EditShopScreen;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    // раньше здесь были сырые 16 и 12 вместо шага сетки
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    // 16px между карточками — это был отступ разделов, а не пунктов списка
    gap: theme.spacing(2),
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    ...theme.shadows.soft,
  },
  shrink: {
    flexShrink: 1,
  },
  chevron: {
    color: theme.colors.passive2,
  },
}));
