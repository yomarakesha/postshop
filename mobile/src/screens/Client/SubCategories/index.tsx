import Header from '@/components/Header'
import Typography from '@/ui/Typography'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { categoryApi } from '@/api/categoryApi'
import useAppStore from '@/store/useAppStore'
import ActivityIndicator from '@/ui/ActivityIndicator'
import EmptyState from '@/ui/EmptyState'
import RefreshControl from '@/ui/RefreshControl'
import RightChevronIcon from '@assets/icons/right-chevron.svg'
import { useTranslation } from 'react-i18next'
import CategoryIcon from '../Categories/_components/CategoryIcon'

const SubCategoriesScreen = () => {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>()
  const { data, refetch, isFetching, isLoading } = categoryApi.useGet(Number(categoryId), {
    enabled: Boolean(categoryId),
  })
  const currentLang = useAppStore((s) => s.lang)
  const { t } = useTranslation()
  const router = useRouter()

  // Раньше router.back() вызывался прямо в теле рендера — навигация во время
  // отрисовки роняла предупреждение и иногда срабатывала дважды.
  useEffect(() => {
    if (!categoryId) {
      router.back()
    }
  }, [categoryId, router])

  const getTranslationName = (item: Category.Short | Category.Item) => {
    // Как на витрине: нет перевода на текущий язык — берём первый доступный,
    // чтобы в списке не оставалось безымянных строк.
    return (
      item.translations.find((tr) => tr.language === currentLang)?.name ||
      item.translations[0]?.name ||
      ''
    )
  }

  const subCategories = useMemo(() => {
    return data?.children ? data.children.filter((item) => item.is_active) : []
  }, [data])

  // Раздел без подкатегорий сразу открывает свои товары. Раньше он показывал
  // «нет подкатегорий», и до товаров, лежащих прямо в разделе, было не дойти.
  const hasNoChildren = Boolean(data) && subCategories.length === 0
  useEffect(() => {
    if (hasNoChildren) {
      router.replace({
        pathname: `/(client-tabs)/(categories)/[categoryId]/[subCategoryId]`,
        params: { categoryId, subCategoryId: categoryId },
      })
    }
  }, [hasNoChildren, categoryId, router])

  const onPressItem = (id: number | string) => {
    router.push({
      pathname: `/(client-tabs)/(categories)/[categoryId]/[subCategoryId]`,
      params: {
        categoryId,
        subCategoryId: id,
      },
    })
  }

  if (!categoryId) {
    return null
  }

  return (
    <>
      <Header withGoBack title={data ? getTranslationName(data) : ''} backgroundColor="white" />

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          // isLoading оставлял «резинку» затянутой на первой загрузке —
          // теперь начальная загрузка показывает спиннер, а pull-to-refresh
          // отвечает только за повторные запросы.
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : subCategories.length > 0 ? (
          <View style={styles.container}>
            {/* Все товары раздела вместе с подкатегориями — как при нажатии на
                раздел на витрине. Бэкенд сам добавляет товары подкатегорий. */}
            <Pressable style={styles.item(false)} onPress={() => onPressItem(categoryId)}>
              <CategoryIcon path={data?.image_path} size={36} />
              <Typography variant="p3" weight="semiBold" numberOfLines={2} style={styles.label}>
                {t('client.categories.allProducts')}
              </Typography>
              <RightChevronIcon width={20} height={20} style={styles.chevron} />
            </Pressable>
            {subCategories.map((item, index) => (
              <Pressable
                key={item.id}
                style={styles.item(index === subCategories.length - 1)}
                onPress={() => onPressItem(item.id)}
              >
                {/* Подкатегория приходит с тем же image_path, что и
                    родительская, — витрина показывает иконку и здесь. */}
                <CategoryIcon path={item.image_path} size={36} />
                <Typography variant="p3" numberOfLines={2} style={styles.label}>
                  {getTranslationName(item)}
                </Typography>
                <RightChevronIcon width={20} height={20} style={styles.chevron} />
              </Pressable>
            ))}
          </View>
        ) : hasNoChildren ? (
          // Пока идёт переход к товарам раздела.
          <ActivityIndicator isFullScreen />
        ) : (
          <EmptyState title={t('client.categories.emptySubCategories')} />
        )}
      </ScrollView>
    </>
  )
}

export default SubCategoriesScreen

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: theme.spacing(4),
  },
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing(4),
    borderRadius: theme.radius.base,
    gap: theme.spacing(3),
  },
  item: (isLast: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing(3),
    paddingBottom: isLast ? 0 : theme.spacing(3),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
  }),
  label: {
    flex: 1,
  },
  chevron: {
    color: theme.colors.passive1,
  },
}))
