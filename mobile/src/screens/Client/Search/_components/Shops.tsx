import { MAX_PAGE_SIZE } from '@/constants/pagination'
import React, { useCallback, useMemo } from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import ActivityIndicator from '@/ui/ActivityIndicator'
import LogoTile from '@/ui/LogoTile'
import { getImageUrl } from '@/utils/getImageUrl'
import { Router } from 'expo-router'
import { searchApi } from '@/api/searchApi'
import { useUserStore } from '@/store/useUserStore'

type Props = {
  search: string
  router: Router
  focus: boolean
}

const Shops = ({ search, focus, router }: Props) => {
  const cityId = useUserStore((s) => s.cityId)

  const searchQuery = searchApi.useSearch(
    {
      q: search,
      city_id: cityId,
      skip: 0,
      limit: MAX_PAGE_SIZE,
    },
    {
      enabled: focus && search.length > 0,
    },
  )

  const onPressShop = useCallback((shopId: number) => {
    router.push({
      pathname: '/(client-tabs)/(home)/shops/[id]',
      params: {
        id: shopId,
      },
    })
  }, [])

  const renderItem: ListRenderItem<ShopAdditional.Item> = useCallback(
    ({ item }) => {
      return (
        <LogoTile
          onPress={() => onPressShop(item.shop_base_id)}
          image={getImageUrl(item.logo_path)}
        />
      )
    },
    [onPressShop],
  )

  const keyExtractor = useCallback((item: ShopAdditional.Item) => {
    return String(item.id)
  }, [])

  // Поиск отдаёт базу магазина, а плитке нужны логотип и идентификатор базы:
  // разворачиваем вложенную карточку. Магазин без неё показать нечем —
  // такие пропускаем, иначе в списке появились бы пустые плитки.
  const shopsAdditional = useMemo(() => {
    if (search.length === 0) return []
    return (searchQuery.data?.shops || [])
      .map((shop) => shop.additional)
      .filter((additional): additional is ShopAdditional.Item => !!additional)
  }, [searchQuery.data, search])

  return (
    <FlatList
      data={shopsAdditional}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={3}
      columnWrapperStyle={{ gap: 8 }}
      contentContainerStyle={styles.list}
      ListEmptyComponent={() => searchQuery.isLoading && <ActivityIndicator isFullScreen />}
    />
  )
}

export default Shops

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    gap: 8,
  },
}))
