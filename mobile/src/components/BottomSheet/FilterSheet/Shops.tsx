import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Typography from '@/ui/Typography'
import { Keyboard, Platform, Pressable, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import HeaderSheet from '../HeaderSheet'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import SearchInput from '@/ui/SearchInput'
import { Image } from 'expo-image'
import { getImageUrl } from '@/utils/getImageUrl'
import CircleCheck from '@/ui/Check'
import Button from '@/ui/Button'
import { UniTrueSheet } from '@/ui/BottomSheet'
import ActivityIndicator from '@/ui/ActivityIndicator'
import EmptyState from '@/ui/EmptyState'
import { shopAdditionalApi } from '@/api/shopAdditionalApi'
import useDebounceSearch from '@/hooks/useDebounceSearch'
import { TFunction } from 'i18next'

type Props = {
  ref: React.RefObject<TrueSheet | null>
  onClose: () => void
  onSave: (shops: { id: number; name: string }[]) => void
  initialSelected?: { id: number; name: string }[]
  t: TFunction
}

const ShopsFilterSheet = ({ ref, onClose, onSave, initialSelected = [], t }: Props) => {
  const [footerHeight, setFooterHeight] = useState(0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedShops, setSelectedShops] =
    useState<{ id: number; name: string }[]>(initialSelected)
  const debouncedSearch = useDebounceSearch(search)

  useEffect(() => {
    setSelectedShops(initialSelected)
  }, [initialSelected])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true))
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false))

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const shopsQuery = shopAdditionalApi.useGetAll({
    skip: 0,
    limit: 20,
    name: debouncedSearch,
  })

  const data = useMemo(() => shopsQuery.data || [], [shopsQuery.data])

  const handleGoBack = useCallback(() => ref.current?.dismiss(), [ref])

  const onSelectShop = useCallback((item: { id: number; name: string }) => {
    setSelectedShops((prev) =>
      prev.find((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item],
    )
  }, [])

  const handleSave = useCallback(() => {
    onSave(selectedShops)
    ref.current?.dismiss()
  }, [onSave, selectedShops, ref])

  const headerComp = useCallback(
    () => (
      <>
        <HeaderSheet title={t('shop')} onGoBack={handleGoBack} onClose={onClose} />
        <SearchInput
          placeholder={t('common.search')}
          containerStyle={{ marginBottom: 8 }}
          onChangeText={setSearch}
        />
      </>
    ),
    [t, handleGoBack, onClose],
  )

  const footerComp = useCallback(
    () => (
      <View
        style={styles.footer(keyboardVisible)}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height
          setFooterHeight((prev) => (prev !== h ? h : prev))
        }}
      >
        <Button
          variant="primary"
          title={t('common.save')}
          style={styles.button}
          onPress={handleSave}
        />
      </View>
    ),
    [t, handleSave, keyboardVisible],
  )

  const renderRow = useCallback(
    (item: ShopAdditional.Item, index: number) => (
      <Pressable
        key={String(item.id) + index}
        style={styles.item(index === data.length - 1)}
        onPress={() => onSelectShop({ id: Number(item.shop_base_id), name: item.name! })}
      >
        <View style={styles.itemLeft}>
          <View style={styles.logoContainer}>
            <Image source={getImageUrl(item.logo_path)} contentFit="contain" style={styles.logo} />
          </View>
          <Typography weight="medium">{item.name}</Typography>
        </View>
        <CircleCheck isActive={selectedShops.some((i) => i.id === Number(item.shop_base_id))} />
      </Pressable>
    ),
    [data, selectedShops, onSelectShop],
  )

  return (
    <UniTrueSheet
      ref={ref}
      scrollable
      detents={[0.7, 1]}
      header={headerComp}
      headerStyle={styles.headerContainer}
      footer={footerComp}
      style={styles.bottomSheet}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent(footerHeight)}
      >
        {/* Раньше при пустом ответе или во время загрузки оставался
            пустой серый прямоугольник. */}
        {shopsQuery.isPending ? (
          <ActivityIndicator style={styles.loader} />
        ) : data.length === 0 ? (
          <EmptyState compact title={t('emptyState.search.title')} />
        ) : (
          <View style={styles.card}>{data.map((item, index) => renderRow(item, index))}</View>
        )}
      </ScrollView>
    </UniTrueSheet>
  )
}

export default ShopsFilterSheet

const styles = StyleSheet.create((theme, rt) => ({
  scrollContent: (footerHeight: number) => ({
    paddingBottom: footerHeight,
  }),
  loader: {
    paddingVertical: theme.spacing(6),
  },
  card: {
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray2,
  },
  bottomSheet: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing(4),
  },
  item: (isLast: boolean) => ({
    paddingVertical: theme.spacing(4),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
    gap: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  logoContainer: {
    width: 70,
    height: 40,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  footer: (keyboardVisible: boolean) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: keyboardVisible ? theme.spacing(4) : rt.insets.bottom + theme.spacing(4),
  }),
  button: {
    marginHorizontal: theme.spacing(4),
  },
}))
