import { bannerApi } from "@/api/bannerApi";
import { collectionApi } from "@/api/collectionApi";
import Header from "@/components/Header";
import useFavorite from "@/hooks/useFavorite";
import CategoryHorizontalList from "@/screens/Client/Home/_components/CategoryHorizontalList";
import useAppStore from "@/store/useAppStore";
import ProductCard from "@/ui/ProductCard";
import Typography from "@/ui/Typography";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import BannerCarousel from "./_components/BannerCarousel";
import HeaderLeft from "./_components/HeaderLeft";
import HeaderRight from "./_components/HeaderRight";
import { useUserStore } from "@/store/useUserStore";
import useShopStore from "@/store/useShopStore";
import UserShopsSheet from "@/components/BottomSheet/UserShopsSheet";
import api from "@/api";
import { cityApi } from "@/api/cityApi";
import SelectableSheet, {
  SelectableItem,
} from "@/components/BottomSheet/SelectableSheet";
import { useTranslation } from "react-i18next";
import InernetError from "@/ui/InternetError";
import HeaderBottom from "./_components/HeaderBottom";
import RefreshControl from "@/ui/RefreshControl";

const HomeScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const currentLang = useAppStore((state) => state.lang);
  const userShopsSheetRef = useRef<TrueSheet>(null);
  const citySelectSheetRef = useRef<TrueSheet>(null);
  const selectedCityId = useUserStore((s) => s.cityId);
  const user = useUserStore((s) => s.user);
  const hasInternetConnection = useAppStore((s) => s.hasInternetConnection);
  const isServerAvailable = useAppStore((s) => s.isServerAvailable);

  const collectionsQuery = collectionApi.useGetAll({
    skip: 0,
    limit: 10,
    products_limit: 9,
  });

  // Подборка без товаров рисовала заголовок и пустоту под ним — витрина такие
  // секции просто не показывает.
  const collections = useMemo(() => {
    return (collectionsQuery.data || []).filter(
      (collection) => collection.products.length > 0,
    );
  }, [collectionsQuery.data]);

  const {
    data: favoritesData,
    toggleFavorite,
    isFetching,
  } = useFavorite({ enabled: collections.length === 0, t });
  // Все места сразу, как в карусели главной на витрине (pages/home/ui/Banner):
  // отдельных блоков для середины и низа страницы нет ни там, ни здесь.
  // Если их добавят, фильтр по position уже заведён в типах.
  const bannersQuery = bannerApi.useGetAll({
    only_active: true,
  });
  const citiesQuery = cityApi.useGetAll();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const banners = useMemo(() => {
    return bannersQuery.data || [];
  }, [bannersQuery.data]);

  const userShops = useMemo(() => {
    return (
      // Закрытые владельцем магазины тоже в списке: иначе открыть закрытый
      // магазин из приложения было бы негде. В списке у них пометка.
      user?.shops?.filter((s) => s.registration_status === "approved") || []
    );
  }, [user]);

  const cities: SelectableItem<number>[] = useMemo(() => {
    return (
      citiesQuery.data?.map((city) => {
        const name = city.translations.find(
          (i) => i.language === currentLang,
        )?.name;
        return { value: name!, key: city.id };
      }) || []
    );
  }, [citiesQuery.data, currentLang]);

  const selectedCity = cities.find((c) => c.key === selectedCityId)?.value;

  const handlePressRegion = () => {
    citySelectSheetRef.current?.present();
  };

  const handlePressUserShop = () => {
    userShopsSheetRef.current?.present();
  };

  const handlePressProfile = () => {
    router.push("/edit-profile");
  };

  const handlePressAuth = () => {
    router.push("/(auth)");
  };

  const handleRouteToShop = (shopBaseId: number) => {
    useShopStore.setState({
      activeShopBaseId: shopBaseId,
    });
    useAppStore.setState({ mode: "shop" });
  };

  const handlePressSearch = () => {
    router.push("/search");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    api.client.invalidateQueries({ queryKey: ["get-me"] });
    try {
      await Promise.all([
        bannersQuery.refetch(),
        collectionsQuery.refetch(),
        citiesQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePressShop = () => {
    if (userShops.length === 1) {
      handleRouteToShop(userShops[0].id);
    } else {
      handlePressUserShop();
    }
  };

  const getNameTranslation = (
    translations: Collection.Translation[] | City.Translation[],
  ) => {
    return translations.find((item) => item.language === currentLang)?.name;
  };

  const onPressProduct = (id: number) => {
    router.push({ pathname: "/products/[id]", params: { id } });
  };

  const onPressShowMore = (collectionId: number) => {
    router.push({
      pathname: "/[collectionId]",
      params: { collectionId },
    });
  };

  const handleSelect = (id: number) => {
    useUserStore.setState({ cityId: id });
  };

  if (!hasInternetConnection || !isServerAvailable) {
    return (
      <InernetError
        t={t}
        onRetry={handleRefresh}
        isLoading={
          bannersQuery.isPending || collectionsQuery.isFetching || isFetching
        }
      />
    );
  }

  return (
    <>
      <Header
        headerLeft={
          <HeaderLeft
            onPressRegion={handlePressRegion}
            cityName={selectedCity}
          />
        }
        headerBottom={<HeaderBottom t={t} onPressSearch={handlePressSearch} />}
        headerRight={
          <HeaderRight
            onPressProfile={handlePressProfile}
            user={user}
            hasAnyShop={userShops.length > 0}
            onPressAuth={handlePressAuth}
            onPressShop={handlePressShop}
            t={t}
          />
        }
      />
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        overScrollMode="never"
        disableScrollViewPanResponder
        disableIntervalMomentum
        refreshControl={
          <RefreshControl
            // Только жест пользователя, а не любой запрос: фоновое обновление
            // данных, пока главная скрыта за другой вкладкой, включало и
            // выключало индикатор за кадром, и на iOS он оставался висеть.
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.headerContent}>
          <BannerCarousel data={banners} isLoading={bannersQuery.isPending} />
          <CategoryHorizontalList t={t} />
        </View>

        <View style={styles.sectionsWrapper}>
          {collections.map((collection) => (
            <View style={styles.section} key={collection.id}>
              <Typography variant="p2" weight="bold">
                {getNameTranslation(collection.translations)}
              </Typography>
              <View style={styles.productsGrid}>
                {collection.products.slice(0, 8).map((item, key) => (
                  <ProductCard
                    currentLanguage={currentLang!}
                    isFavorite={favoritesData.some((i) => i.id === item.id)}
                    onToggleFavorite={() => toggleFavorite(item)}
                    key={key}
                    data={item}
                    onPress={() => onPressProduct(item.id)}
                    t={t}
                  />
                ))}
              </View>
              {collection.products.length > 8 && (
                <Pressable
                  style={styles.showMoreButton}
                  onPress={() => onPressShowMore(collection.id)}
                >
                  <Typography
                    variant="t1"
                    weight="bold"
                    color="main"
                    numberOfLines={1}
                  >
                    {t("common.viewAll")}
                  </Typography>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <SelectableSheet
        data={cities}
        ref={citySelectSheetRef}
        onSelect={handleSelect}
        selectedKey={selectedCityId}
        title={t("sheets.selectRegion.title")}
      />

      <UserShopsSheet
        ref={userShopsSheetRef}
        data={userShops}
        onSelect={handleRouteToShop}
        t={t}
      />
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },
  // Контент заезжал под шапку на spacing(5), чтобы закрыть вырез под её
  // скруглёнными углами, а paddingTop компенсировал этот сдвиг обратно. Шапка
  // теперь белая, без скруглений и без синей плашки — прятать нечего.
  headerContent: {
    paddingBottom: theme.spacing(4),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(4),
  },
  scrollContent: {
    gap: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  // Ритм витрины: между блоками главной 24, внутри блока 16.
  sectionsWrapper: {
    paddingHorizontal: theme.spacing(2),
    gap: theme.spacing(6),
    flex: 1,
  },
  section: {
    gap: theme.spacing(4),
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  // Кнопка тянется по тексту, а не по фиксированным 30% ширины: в «Смотреть
  // все» на русском и туркменском подпись не помещалась и переносилась.
  showMoreButton: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(6),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
  },
}));
