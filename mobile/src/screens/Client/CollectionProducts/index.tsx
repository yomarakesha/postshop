import React, { useEffect, useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { collectionApi } from '@/api/collectionApi'
import useAppStore from '@/store/useAppStore'
import Header from '@/components/Header'
import ProductsVerticalList from '@/components/ProductsVerticalList'
import { useTranslation } from 'react-i18next'

const CollectionProductsScreen = () => {
  const { collectionId } = useLocalSearchParams()
  const router = useRouter()
  const currentLang = useAppStore((state) => state.lang)
  const { t } = useTranslation()

  const collectionQuery = collectionApi.useGet(Number(collectionId), {
    enabled: !!collectionId,
  })

  const products = useMemo(() => {
    return collectionQuery.data?.products || []
  }, [collectionQuery.data])

  const getCollectionTranslation = (translations: Collection.Translation[]) => {
    return translations.find((item) => item.language === currentLang)?.name
  }

  useEffect(() => {
    if (!collectionId || collectionQuery.isError) {
      router.back()
    }
  }, [collectionId, collectionQuery.isError])

  const onPressProduct = (id: number) => {
    router.push({ pathname: '/products/[id]', params: { id } })
  }

  return (
    <>
      <Header
        withGoBack
        title={getCollectionTranslation(collectionQuery.data?.translations || [])}
        backgroundColor="white"
      />
      {/* Пока подборка грузится, показываем загрузку. Раньше список сразу
          рисовал «Товаров пока нет» с картинкой — на переходе «Смотреть все»
          с главной этот кадр успевал мигнуть перед товарами. */}
      <ProductsVerticalList
        data={products}
        isLoading={collectionQuery.isPending}
        onPress={onPressProduct}
        t={t}
      />
    </>
  )
}

export default CollectionProductsScreen
