import { MAX_PAGE_SIZE } from '@/constants/pagination'
import React, { useCallback, useMemo } from 'react'
import Typography from '@/ui/Typography'
import { FlatList, ListRenderItem, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Router } from 'expo-router'
import { searchApi } from '@/api/searchApi'
import { useUserStore } from '@/store/useUserStore'
import LogoTile from '@/ui/LogoTile'
import { getImageUrl } from '@/utils/getImageUrl'
import ActivityIndicator from '@/ui/ActivityIndicator'

type Props = {
  search: string
  router: Router
  focus: boolean
}

const Brands = ({ search, focus, router }: Props) => {
  const cityId = useUserStore((s) => s.cityId)

  const { data, isLoading } = searchApi.useSearch(
    {
      q: search,
      city_id: cityId,
      limit: MAX_PAGE_SIZE,
      skip: 0,
    },
    {
      enabled: focus && search.length > 0,
    },
  )

  const handlePressBrand = (brandId: number) => {
    router.push({
      pathname: '/(client-tabs)/(home)/brands/[id]',
      params: {
        id: String(brandId),
      },
    })
  }

  const keyExtractor = useCallback((item: Brand.Item) => {
    return String(item.id)
  }, [])

  const renderItem: ListRenderItem<Brand.Item> = useCallback(
    ({ item }) => {
      return (
        <LogoTile onPress={() => handlePressBrand(item.id)} image={getImageUrl(item.image_path)} />
      )
    },
    [data],
  )

  const brands = useMemo(() => {
    if (search.length === 0) return []
    return data?.brands || []
  }, [data, search])

  return (
    <FlatList
      data={brands}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={3}
      columnWrapperStyle={{ gap: 8 }}
      contentContainerStyle={styles.list}
      ListFooterComponent={() => isLoading && <ActivityIndicator isFullScreen />}
    />
  )
}

export default Brands

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    gap: 8,
  },
}))
