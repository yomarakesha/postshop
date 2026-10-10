import { withdrawalApi } from '@/api/withdrawalApi'
import HeaderSheet from '@/components/BottomSheet/HeaderSheet'
import { UniTrueSheet } from '@/ui/BottomSheet'
import Button from '@/ui/Button'
import CustomTextInput from '@/ui/CustomTextInput'
import Typography from '@/ui/Typography'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'
import React, { RefObject, useEffect, useState } from 'react'
import { Keyboard, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { StyleSheet } from 'react-native-unistyles'

export type WithdrawalTarget = {
  productId: number
  name: string
  /** Свободно на складе — больше забрать нельзя: остальное держат заказы. */
  available: number
}

type Props = {
  ref: RefObject<TrueSheet | null>
  shopId: number
  target: WithdrawalTarget | null
  t: TFunction
}

const serverMessage = (error: unknown) => {
  const detail = (error as AxiosError<{ detail?: unknown }>)?.response?.data?.detail
  return typeof detail === 'string' ? detail : undefined
}

/**
 * Заявка на вывоз товара со склада Postshop — как на витрине
 * (`pages/my-store-warehouse/ui/WithdrawalModal`). Забрать свой товар продавец
 * FBO раньше не мог никак.
 */
const WithdrawalSheet = ({ ref, shopId, target, t }: Props) => {
  const [quantity, setQuantity] = useState('')
  const [comment, setComment] = useState('')
  const create = withdrawalApi.useCreate()

  useEffect(() => {
    setQuantity(target ? String(target.available) : '')
    setComment('')
    // Сбрасываем форму только при смене товара — как в StockSheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.productId])

  const close = () => {
    Keyboard.dismiss()
    ref.current?.dismiss()
  }

  const submit = async () => {
    if (!target) return
    const amount = Number(quantity.replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0 || amount > target.available) {
      Toast.show({
        type: 'error',
        text1: t('store.withdrawal.quantityInvalid', { count: target.available }),
      })
      return
    }
    try {
      await create.mutateAsync({
        shop_id: shopId,
        items: [{ product_id: target.productId, quantity: amount }],
        comment: comment.trim() || null,
      })
      Toast.show({ type: 'success', text1: t('store.withdrawal.sent') })
      close()
    } catch (error) {
      Toast.show({ type: 'error', text1: t('error'), text2: serverMessage(error) })
    }
  }

  return (
    <UniTrueSheet ref={ref} detents={['auto']} style={styles.wrapper}>
      <HeaderSheet title={t('store.withdrawal.title')} onClose={close} />
      <View style={styles.content}>
        {target && (
          <View style={styles.target}>
            <Typography variant="p3" weight="medium" numberOfLines={2}>
              {target.name}
            </Typography>
            <Typography variant="t1" color="secondary">
              {t('store.withdrawal.free', { count: target.available })}
            </Typography>
          </View>
        )}
        <CustomTextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          placeholder={t('store.withdrawal.quantity')}
        />
        <CustomTextInput
          value={comment}
          onChangeText={setComment}
          placeholder={t('store.withdrawal.commentPlaceholder')}
          multiline
          maxLength={1000}
        />
        <Typography variant="t2" color="secondary">
          {t('store.withdrawal.notice')}
        </Typography>
        <Button
          title={t('store.withdrawal.send')}
          variant="primary"
          disabled={create.isPending}
          onPress={() => void submit()}
        />
      </View>
    </UniTrueSheet>
  )
}

export default WithdrawalSheet

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: 0,
  },
  content: {
    gap: theme.spacing(3),
  },
  target: {
    gap: theme.spacing(1),
  },
}))
