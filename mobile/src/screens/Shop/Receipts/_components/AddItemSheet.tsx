import { receiptApi } from '@/api/receiptApi'
import HeaderSheet from '@/components/BottomSheet/HeaderSheet'
import useAppStore from '@/store/useAppStore'
import { UniTrueSheet } from '@/ui/BottomSheet'
import Button from '@/ui/Button'
import CustomTextInput from '@/ui/CustomTextInput'
import Radio from '@/ui/Radio'
import Typography from '@/ui/Typography'
import ErrorAlert from '@/utils/errorAlert'
import { pickTranslatedName } from '@/utils/pickTranslation'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { TFunction } from 'i18next'
import React, { RefObject, useEffect, useState } from 'react'
import { Keyboard, Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import Toast from 'react-native-toast-message'
import { StyleSheet } from 'react-native-unistyles'

type Props = {
  ref: RefObject<TrueSheet | null>
  receiptId: number | null
  products: Product.Item[]
  t: TFunction
}

/**
 * Товар в документ приёмки: какой и сколько штук. Список товаров ограничен
 * по высоте и прокручивается, чтобы поле количества и кнопка оставались на
 * экране.
 */
const AddItemSheet = ({ ref, receiptId, products, t }: Props) => {
  const { height } = useWindowDimensions()
  const lang = useAppStore((s) => s.lang)
  const [productId, setProductId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState('')
  const addItem = receiptApi.useAddItem()

  // Каждый документ открывается с чистой формой.
  useEffect(() => {
    setProductId(null)
    setQuantity('')
  }, [receiptId])

  // Поле ввода остаётся в фокусе и после закрытия окна — тогда первое
  // нажатие на экране уходило на снятие фокуса и терялось. Снимаем сами.
  const close = () => {
    Keyboard.dismiss()
    ref.current?.dismiss()
  }

  const submit = () => {
    const product = products.find((p) => p.id === productId)
    const amount = Number(quantity.replace(',', '.'))
    if (!product) {
      Toast.show({ type: 'error', text1: t('store.receipts.productRequired') })
      return
    }
    if (!quantity.trim() || !Number.isFinite(amount) || amount <= 0) {
      Toast.show({
        type: 'error',
        text1: t('store.receipts.quantityRequired'),
      })
      return
    }
    if (receiptId === null) return
    addItem.mutate(
      {
        receiptId,
        product_id: product.id,
        measure_unit_id: product.measure_unit_id,
        quantity: amount,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: t('store.receipts.itemAdded') })
          setProductId(null)
          setQuantity('')
          close()
        },
        onError: (error) => ErrorAlert(t, error),
      },
    )
  }

  return (
    <UniTrueSheet ref={ref} detents={['auto']} style={styles.wrapper}>
      <HeaderSheet title={t('store.receipts.addItem')} onClose={close} />
      <View style={styles.content}>
        <Typography variant="t1" color="secondary">
          {t('store.receipts.selectProduct')}
        </Typography>
        <ScrollView
          style={{ maxHeight: height * 0.4 }}
          contentContainerStyle={styles.list}
          nestedScrollEnabled
        >
          {products.map((product, index) => (
            <Pressable
              key={product.id}
              onPress={() => setProductId(product.id)}
              style={styles.item(index === products.length - 1)}
              accessibilityRole="radio"
              accessibilityState={{ selected: productId === product.id }}
            >
              <Typography variant="t1" weight="medium" style={styles.name}>
                {pickTranslatedName(product.translations, lang)}
              </Typography>
              <Radio isActive={productId === product.id} />
            </Pressable>
          ))}
        </ScrollView>
        <CustomTextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          placeholder={t('store.receipts.quantityPlaceholder')}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Button
          title={t('store.receipts.save')}
          variant="primary"
          disabled={addItem.isPending}
          onPress={submit}
        />
      </View>
    </UniTrueSheet>
  )
}

export default AddItemSheet

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: 0,
  },
  content: {
    gap: theme.spacing(3),
  },
  list: {
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.radius.base,
    paddingHorizontal: theme.spacing(4),
  },
  item: (isLast: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(3),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
  }),
  name: {
    flex: 1,
  },
}))
