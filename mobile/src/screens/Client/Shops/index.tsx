import { shopAdditionalApi } from '@/api/shopAdditionalApi'
import Header from '@/components/Header'
import useDebounceSearch from '@/hooks/useDebounceSearch'
import ActivityIndicator from '@/ui/ActivityIndicator'
import LogoTile from '@/ui/LogoTile'
import SearchInput from '@/ui/SearchInput'
import Typography from '@/ui/Typography'
import { getImageUrl } from '@/utils/getImageUrl'
import emptySearchImage from '@assets/images/empty-search.png'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ListRenderItem, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const ShopsScreen = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceSearch(search, 500)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    shopAdditionalApi.useGetInfiniteList({
      limit: 10,
      skip: 0,
      name: debouncedSearch || undefined,
    })

  const shops = useMemo(() => {
    return data?.pages.flat() || []
  }, [data])

  const handlePress = (shopBaseId: number) => {
    router.push({
      pathname: '/shops/[id]',
      params: { id: String(shopBaseId) },
    })
  }

  const renderItem: ListRenderItem<ShopAdditional.Item> = useCallback(({ item }) => {
    return (
      <LogoTile
        onPress={() => handlePress(item.shop_base_id)}
        image={getImageUrl(item.logo_path)}
      />
    )
  }, [])

  const keyExtractor = useCallback((item: ShopAdditional.Item) => {
    return String(item.id)
  }, [])

  const handleEndReached = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }

  return (
    <>
      <Header
        title={t('client.shops.headerTitle')}
        withGoBack
        headerBottom={
          <SearchInput
            containerStyle={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder={t('common.search')}
          />
        }
        backgroundColor="white"
      />
      {isLoading ? (
        <ActivityIndicator isFullScreen />
      ) : (
        <FlatList
          data={shops}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={3}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          ListFooterComponent={() => isFetchingNextPage && <ActivityIndicator />}
          ListEmptyComponent={() => (
            <>
              {isLoading ? (
                <ActivityIndicator isFullScreen />
              ) : (
                shops.length === 0 && (
                  <View style={styles.imageWrapper}>
                    <Image source={emptySearchImage} style={styles.image} contentFit="contain" />
                    <View>
                      <Typography variant="p1" weight="semiBold" isCentered>
                        {t('emptyState.search.title')}
                      </Typography>
                      <Typography
                        variant="t1"
                        weight="medium"
                        color="secondary"
                        isCentered
                        style={{ marginTop: 8 }}
                      >
                        {t('emptyState.search.description')}
                      </Typography>
                    </View>
                  </View>
                )
              )}
            </>
          )}
        />
      )}
    </>
  )
}

export default ShopsScreen

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    gap: 8,
    flexGrow: 1,
  },
  search: {
    marginHorizontal: theme.spacing(4),
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  image: {
    width: 120,
    height: 80,
  },
}))
