import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { useCallback, useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/Header";
import CategoryItem from "./_components/CategoryItem";
import { categoryApi } from "@/api/categoryApi";
import useAppStore from "@/store/useAppStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import EmptyState from "@/ui/EmptyState";
import RefreshControl from "@/ui/RefreshControl";
import { useTranslation } from "react-i18next";
import InernetError from "@/ui/InternetError";

const CategoriesScreen = () => {
  const { data, isLoading, refetch, isFetching } = categoryApi.useGetAll({
    skip: 0,
    limit: MAX_PAGE_SIZE,
    only_parents: true,
    is_active: true,
  });
  const currentLang = useAppStore((s) => s.lang);
  const { t } = useTranslation();
  const hasInternetConnection = useAppStore((s) => s.hasInternetConnection);
  const isServerAvailable = useAppStore((s) => s.isServerAvailable);

  const categories = useMemo(() => {
    return data || [];
  }, [data]);

  const keyExtractor = useCallback((item: Category.Item) => String(item.id), []);

  const renderItem: ListRenderItem<Category.Item> = useCallback(
    ({ item }) => {
      return (
        <CategoryItem
          id={String(item.id)}
          label={
            // Запасной вариант — как на витрине: если перевода на текущий язык
            // нет, показываем первый доступный, а не пустую карточку.
            item.translations.find((tr) => tr.language === currentLang)?.name ||
            item.translations[0]?.name ||
            ""
          }
          image={item.image_path}
        />
      );
    },
    // Без currentLang в зависимостях названия оставались на прежнем языке,
    // пока список не перемонтируется: useCallback запоминал первый рендер.
    [currentLang],
  );

  if (!hasInternetConnection || !isServerAvailable) {
    return <InernetError t={t} onRetry={refetch} isLoading={isLoading} />;
  }

  return (
    <>
      <Header
        backgroundColor="white"
      />
      <FlatList
        data={categories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
          />
        }
        // Спиннер стоял в футере: при первой загрузке экран был пустым, а
        // индикатор прятался под низом списка. Пустой ответ тоже ничем не
        // отличался от загрузки — теперь у каждого состояния свой вид.
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator isFullScreen />
          ) : (
            <EmptyState title={t("client.categories.empty")} />
          )
        }
      />
    </>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create((theme) => ({
  list: {
    flexGrow: 1,
    paddingVertical: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    gap: theme.spacing(2),
  },
  column: {
    gap: theme.spacing(2),
  },
}));
