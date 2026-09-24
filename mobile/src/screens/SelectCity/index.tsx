import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import useAppStore from "@/store/useAppStore";
import { cityApi } from "@/api/cityApi";
import Typography from "@/ui/Typography";
import Radio from "@/ui/Radio";
import Button from "@/ui/Button";
import { useUserStore } from "@/store/useUserStore";
import ScreenFooter from "@/ui/ScreenFooter";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import InernetError from "@/ui/InternetError";
import ActivityIndicator from "@/ui/ActivityIndicator";

const SelectCityScreen = () => {
  const currentLanguage = useAppStore((s) => s.lang);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const citiesQuery = cityApi.useGetAll();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const hasInternetConnection = useAppStore((s) => s.hasInternetConnection);
  const isServerAvailable = useAppStore((s) => s.isServerAvailable);

  const cities = useMemo(() => {
    return citiesQuery.data || [];
  }, [citiesQuery.data]);

  // Раньше при отсутствии перевода на текущем языке строка списка
  // отрисовывалась пустой — оставался белый прямоугольник без названия.
  const getTranslation = (translations: City.Translation[]) => {
    return (
      translations.find((tr) => tr.language === currentLanguage)?.name ||
      translations.find((tr) => !!tr.name)?.name ||
      ""
    );
  };

  const handleSubmit = () => {
    if (selectedCityId) {
      useUserStore.setState({
        cityId: selectedCityId,
      });
    }
    return;
  };

  if (!hasInternetConnection || !isServerAvailable) {
    return (
      <InernetError
        isLoading={citiesQuery.isLoading}
        t={t}
        onRetry={() => citiesQuery.refetch()}
      />
    );
  }
  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleWrapper}>
          <Typography variant="p1" weight="bold" isCentered>
            {t("client.selectRegion.headerTitle")}
          </Typography>
          <Typography
            variant="t1"
            weight="regular"
            color="secondary"
            isCentered
          >
            {t("client.selectRegion.description")}
          </Typography>
        </View>

        {citiesQuery.isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : cities.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Typography
              variant="p3"
              weight="medium"
              color="secondary"
              isCentered
            >
              {t("emptyState.cities.title")}
            </Typography>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            {cities.map((city) => (
              <Pressable
                onPress={() => setSelectedCityId(city.id)}
                key={String(city.id)}
                style={styles.item}
              >
                <Typography
                  variant="p2"
                  weight="medium"
                  numberOfLines={1}
                  style={styles.itemTitle}
                >
                  {getTranslation(city.translations)}
                </Typography>
                <Radio isActive={selectedCityId === city.id} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <ScreenFooter bottomOffset={insets.bottom}>
        <Button
          variant="primary"
          title={t("common.save")}
          onPress={handleSubmit}
          disabled={!selectedCityId}
        />
      </ScreenFooter>
    </>
  );
};

export default SelectCityScreen;

const styles = StyleSheet.create((theme, rt) => ({
  scroll: {
    flex: 1,
    // Раньше фон был только у contentContainer: при коротком списке снизу
    // оставалась белая полоса чужого цвета.
    backgroundColor: theme.colors.gray2,
  },
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.gray2,
    padding: theme.spacing(4),
    paddingTop: theme.spacing(6) + rt.insets.top,
    // Отступ снизу, чтобы последний регион не упирался в шапку футера.
    paddingBottom: theme.spacing(6),
    gap: theme.spacing(6),
  },
  titleWrapper: {
    gap: theme.spacing(1),
  },
  emptyWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: theme.spacing(10),
  },
  itemsContainer: {
    gap: theme.spacing(2),
  },
  itemTitle: {
    flexShrink: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
    ...theme.shadows.soft,
  },
}));
