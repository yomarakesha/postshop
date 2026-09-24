import { shopAdditionalApi } from "@/api/shopAdditionalApi";
import CreateShopAdditionalScreen from "@/screens/Shop/CreateShopAdditional";
import useAppStore from "@/store/useAppStore";
import useShopStore from "@/store/useShopStore";
import TabBarIcon from "@/utils/TabBarIcon";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { useUnistyles } from "react-native-unistyles";

// images & icons
import CubeIcon from "@assets/icons/cube.svg";
import HomeIcon from "@assets/icons/home.svg";
import SaveIcon from "@assets/icons/save.svg";
import UserIcon from "@assets/icons/user.svg";
import { useTranslation } from "react-i18next";
import InernetError from "@/ui/InternetError";
import { useUserStore } from "@/store/useUserStore";
import { shopBaseApi } from "@/api/shopBaseApi";

const ShopTabs = () => {
  const { theme } = useUnistyles();
  const activeShopBaseId = useShopStore((s) => s.activeShopBaseId);
  const shop = useShopStore((s) => s.shop);
  const shopBaseQuery = shopBaseApi.useGet(activeShopBaseId!, {
    enabled: !!activeShopBaseId,
  });
  const shopAdditionalQuery = shopAdditionalApi.useGet(activeShopBaseId!, {
    enabled: !!activeShopBaseId,
  });
  const hasInternetConnection = useAppStore((s) => s.hasInternetConnection);
  const isServerAvailable = useAppStore((s) => s.isServerAvailable);
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation();
  const currentLanguage = useAppStore((s) => s.lang);

  const TAB_SCREENS = [
    { name: "(home)", title: t("nav.home"), icon: HomeIcon },
    { name: "(my-products)", title: t("nav.myProducts"), icon: CubeIcon },
    { name: "(orders)", title: t("nav.orders"), icon: SaveIcon },
    { name: "(profile)", title: t("nav.profile"), icon: UserIcon },
  ] as const;

  useEffect(() => {
    if (!activeShopBaseId || !user || !currentLanguage) {
      useAppStore.setState({ mode: "client" });
    }
  }, [activeShopBaseId, user, currentLanguage]);

  useEffect(() => {
    if (shopAdditionalQuery.data) {
      useShopStore.setState({ shop: shopAdditionalQuery.data });
    }
  }, [shopAdditionalQuery.data]);

  useEffect(() => {
    if (shopBaseQuery.data && !shopBaseQuery.data.is_active) {
      useShopStore.setState({ activeShopBaseId: undefined, shop: null });
      useAppStore.setState({ mode: "client" });
    }
  }, [shopBaseQuery.data]);

  if (!hasInternetConnection || !isServerAvailable) {
    return (
      <InernetError
        isLoading={shopAdditionalQuery.isLoading}
        t={t}
        onRetry={() => shopAdditionalQuery.refetch()}
      />
    );
  }

  if (!activeShopBaseId || !user || !currentLanguage) {
    return <Redirect href={"/(client-tabs)/(home)"} />;
  }

  if (shopAdditionalQuery.isLoading) {
    return null;
  }

  if (!shop?.name) {
    return <CreateShopAdditionalScreen />;
  }

  return (
    <Tabs
      initialRouteName="(home)"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
        },
      }}
    >
      {TAB_SCREENS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: TabBarIcon(icon) }}
        />
      ))}
    </Tabs>
  );
};

export default ShopTabs;
