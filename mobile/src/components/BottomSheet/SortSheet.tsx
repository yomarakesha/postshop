import React, { useEffect } from 'react'
import Typography from '@/ui/Typography'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import HeaderSheet from './HeaderSheet'
import Radio from '@/ui/Radio'
import ClearSaveActions from '@/ui/ClearSaveActions'
import { useProductListStore } from '@/store/useProductListStore'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { UniTrueSheet } from '@/ui/BottomSheet'
import { TFunction } from 'i18next'

type Props = {
  ref: React.RefObject<TrueSheet | null>
  onDidDismiss?: () => void
  t: TFunction
}

const SortSheet = ({ ref, onDidDismiss, t }: Props) => {
  const currentSort = useProductListStore((s) => s.sort)
  const [sort, setSort] = React.useState<Product.Sort | null>(currentSort)

  const data: { value: Product.Sort; label: string }[] = [
    { label: t('sheets.sort.priceHighToLow'), value: 'most_expensive' },
    { label: t('sheets.sort.priceLowToHigh'), value: 'most_cheap' },
    { label: t('sheets.sort.newArrivals'), value: 'recently_added' },
    { label: t('sheets.sort.onSale'), value: 'with_discounts' },
  ]
  useEffect(() => {
    setSort(currentSort)
  }, [currentSort])

  useEffect(() => {
    return () => {
      useProductListStore.getState().reset()
    }
  }, [])

  const onChangeSort = (value: Product.Sort) => {
    setSort((prev) => (prev === value ? null : value))
  }

  const handleClear = () => {
    setSort(null)
    useProductListStore.setState({ sort: null })
    ref.current?.dismiss()
  }

  const handleSave = () => {
    useProductListStore.setState({ sort })
    ref.current?.dismiss()
  }

  const onClose = () => ref.current?.dismiss()

  return (
    <UniTrueSheet
      onDidDismiss={onDidDismiss}
      ref={ref}
      style={styles.bottomSheet}
      detents={['auto']}
    >
      <HeaderSheet title={t('sheets.sort.title')} onClose={onClose} />
      <View style={styles.container}>
        {data.map((item, index) => (
          <Pressable
            key={item.value}
            onPress={() => onChangeSort(item.value)}
            style={styles.item(index === data.length - 1)}
          >
            <Radio isActive={sort === item.value} />
            <Typography variant="p3" weight="medium">
              {item.label}
            </Typography>
          </Pressable>
        ))}
      </View>
      <ClearSaveActions t={t} onClear={handleClear} onSave={handleSave} />
    </UniTrueSheet>
  )
}

export default SortSheet

const styles = StyleSheet.create((theme) => ({
  bottomSheet: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
  },
  container: {
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray2,
  },
  item: (isLast: boolean) => ({
    paddingVertical: theme.spacing(4),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
    gap: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
  }),
}))
