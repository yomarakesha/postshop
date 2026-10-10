import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import Typography from '@/ui/Typography'
import Header from '@/components/Header'
import ProductsVerticalList from '@/components/ProductsVerticalList'
import FilterSheet from '@/components/BottomSheet/FilterSheet'
import SortSheet from '@/components/BottomSheet/SortSheet'
import { shopAdditionalApi } from '@/api/shopAdditionalApi'
import { productsApi } from '@/api/products'
import { useProductListStore } from '@/store/useProductListStore'
import { getImageUrl } from '@/utils/getImageUrl'
import FilterIcon from '@assets/icons/filter.svg'
import SortIcon from '@assets/icons/sort.svg'
import emptySearchImage from '@assets/images/empty-search.png'

import HeaderLeft from './_components/HeaderLeft'
import HeaderRight from './_components/HeaderRight'
import HeaderBottom from './_components/HeaderBottom'
import ShopInfoSheet from '@/components/BottomSheet/ShopInfoSheet'
import useDebounceSearch from '@/hooks/useDebounceSearch'
import ActivityIndicator from '@/ui/ActivityIndicator'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'

const ShopScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const filter = useProductListStore((s) => s.filter)
  const sort = useProductListStore((s) => s.sort)
  const { t } = useTranslation()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceSearch(search)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const filterSheetRef = useRef<TrueSheet | null>(null)
  const sortSheetRef = useRef<TrueSheet | null>(null)
  const shopInfoSheetRef = useRef<TrueSheet | null>(null)

  const shopAdditionalQuery = shopAdditionalApi.useGet(Number(id), {
    enabled: !!id,
  })

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    productsApi.useGetInfiniteList(
      {
        skip: 0,
        limit: 15,
        name: debouncedSearch || undefined,
        price_from: filter.priceFrom || undefined,
        price_to: filter.priceTo || undefined,
        brand_ids: filter.brands?.map((b) => b.id) || undefined,
        shop_base_ids: [shopAdditionalQuery.data?.shop_base_id!],
        sort: sort || undefined,
      },
      {
        enabled: !!shopAdditionalQuery.data?.shop_base_id,
      },
    )

  const handleFilter = () => {
    filterSheetRef.current?.present()
    setFilterSheetOpen(true)
  }

  const handleSort = () => {
    sortSheetRef.current?.present()
    setSortSheetOpen(true)
  }

  const handleOnChangeSearch = (text: string) => {
    setSearch(text)
  }

  const handleEndReached = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }

  const handlePressProduct = useCallback(
    (id: number) => {
      router.push({ pathname: '/products/[id]', params: { id: String(id) } })
    },
    [router],
  )

  const products = useMemo(() => data?.pages.flat() || [], [data])

  useEffect(() => {
    return () => {
      useProductListStore.getState().reset()
    }
  }, [])

  useEffect(() => {
    if (!id || shopAdditionalQuery.isError) {
      router.back()
    }
  }, [id, shopAdditionalQuery.isError])

  const hasFilterApplied = useMemo(
    () => Boolean(filter.brands?.length || filter.priceFrom !== null || filter.priceTo !== null),
    [filter],
  )

  const hasSortApplied = useMemo(() => sort !== null, [sort])

  const openFilter = filterSheetOpen || hasFilterApplied
  const openSort = sortSheetOpen || hasSortApplied

  if (!id) {
    return null
  }

  // Цвет считаем один раз: его нужно знать и шапке, и её содержимому —
  // название и иконка выбирают по нему свой цвет.
  const shopColor = shopAdditionalQuery.data?.color || 'white'

  return (
    <>
      <Header
        backgroundColor={shopColor}
        headerLeft={
          <HeaderLeft
            logo={getImageUrl(shopAdditionalQuery.data?.logo_path)}
            name={shopAdditionalQuery.data?.name || ''}
            backgroundColor={shopColor}
          />
        }
        headerRight={<HeaderRight ref={shopInfoSheetRef} backgroundColor={shopColor} />}
        headerBottom={
          <HeaderBottom
            searchValue={search}
            onChangeSearch={handleOnChangeSearch}
            onGoBack={() => router.back()}
            t={t}
          />
        }
      />
      <View style={styles.toolbar}>
        <View style={styles.actionsButtons}>
          <Pressable onPress={handleSort} style={[styles.button, openSort && styles.buttonActive]}>
            <SortIcon style={styles.icon(openSort)} />
            <Typography weight="medium" variant="p3" color={openSort ? 'main' : undefined}>
              {t('sheets.sort.title')}
            </Typography>
          </Pressable>
          <Pressable
            onPress={handleFilter}
            style={[styles.button, openFilter && styles.buttonActive]}
          >
            <FilterIcon style={styles.icon(openFilter)} />
            <Typography weight="medium" variant="p3" color={openFilter ? 'main' : undefined}>
              {t('sheets.filter.title')}
            </Typography>
          </Pressable>
        </View>
      </View>

      <ProductsVerticalList
        data={products}
        t={t}
        onPress={handlePressProduct}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        ListEmptyComponent={() => (
          <>
            {isLoading ? (
              <ActivityIndicator isFullScreen />
            ) : (
              products.length === 0 && (
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

      <FilterSheet
        ref={filterSheetRef}
        onDidDismiss={() => setFilterSheetOpen(false)}
        withoutShops
        t={t}
      />
      <SortSheet ref={sortSheetRef} onDidDismiss={() => setSortSheetOpen(false)} t={t} />

      <ShopInfoSheet
        ref={shopInfoSheetRef}
        phoneNumber={Number(
          shopAdditionalQuery.data && shopAdditionalQuery.data?.phone_numbers
            ? shopAdditionalQuery.data?.phone_numbers[0]
            : 0,
        )}
        description={shopAdditionalQuery.data?.description || ''}
        t={t}
      />
    </>
  )
}

export default ShopScreen

const styles = StyleSheet.create((theme) => ({
  header: (shopColor: string) => ({
    backgroundColor: shopColor,
  }),
  toolbar: {
    paddingVertical: theme.spacing(4),
    gap: theme.spacing(3),
    zIndex: 50,
    backgroundColor: theme.colors.gray2,
  },
  actionsButtons: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
  },
  buttonActive: {
    backgroundColor: theme.colors.blue2,
  },
  icon: (isActive: boolean) => ({
    color: isActive ? theme.colors.blueMain : theme.colors.text,
  }),
  button: {
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(3),
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: theme.colors.white,
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
