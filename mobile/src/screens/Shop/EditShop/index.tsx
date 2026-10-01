import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { StyleSheet } from "react-native-unistyles";

import Typography from "@/ui/Typography";
import Header from "@/components/Header";
import RightChevronIcon from "@assets/icons/right-chevron.svg";
import { useTranslation } from "react-i18next";
import useShopStore from "@/store/useShopStore";

export type ShopAdditionalEditLinkType =
  "name" | "addresses" | "phones" | "color" | "logo";

const EditShopScreen = () => {
  const { t } = useTranslation();
  const warehouseType = useShopStore((s) => s.shop?.warehouse_type);

  const steps: { key: ShopAdditionalEditLinkType; title: string }[] = [
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
        {/*
          Тип склада раньше был закомментирован, и продавец нигде не видел,
          FBS у него или FBO. Меняет его только сотрудник Postshop, поэтому
          это строка для чтения, а не пункт с переходом.
        */}
        {!!warehouseType && (
          <View style={[styles.tile, styles.infoTile]}>
            <Typography variant="p3" color="secondary">
              {t("store.shopAdditional.warehouseType.headerTitle")}
            </Typography>
            <Typography weight="medium">
              {t(`store.editShopAdditional.warehouse.${warehouseType}`)}
            </Typography>
            <Typography variant="t1" color="secondary">
              {t("store.editShopAdditional.warehouse.hint")}
            </Typography>
          </View>
        )}
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
  infoTile: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: theme.spacing(1),
  },
  shrink: {
    flexShrink: 1,
  },
  chevron: {
    color: theme.colors.passive2,
  },
}));
