import Header from '@/components/Header'
import ShopStockList from '@/components/ShopStockList'
import StockSheet, { StockMode, StockTarget } from '@/components/StockSheet'
import useShopStore from '@/store/useShopStore'
import EmptyState from '@/ui/EmptyState'
import Typography from '@/ui/Typography'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native-unistyles'

const INTAKE_MODES: StockMode[] = ['income']

/**
 * «Приём товара» магазина FBS — как на витрине (`pages/my-store-intake`):
 * продавец отмечает, что к нему пришёл товар, и остаток растёт.
 *
 * Только FBS. Магазин FBO отправляет товар на склад Postshop — в «Складе».
 */
const ShopIntakeScreen = () => {
  const { t } = useTranslation()
  const shopId = useShopStore((s) => s.activeShopBaseId)
  const shop = useShopStore((s) => s.shop)
  const sheetRef = useRef<TrueSheet>(null)
  const [target, setTarget] = useState<StockTarget | null>(null)

  const isFbs = shop?.warehouse_type === 'fbs'

  return (
    <>
      <Header withGoBack title={t('store.intake.title')} backgroundColor="white" />
      {shopId && isFbs ? (
        <>
          <ShopStockList
            shopId={shopId}
            t={t}
            ListHeaderComponent={
              <Typography variant="t1" color="secondary" style={styles.hint}>
                {t('store.intake.subtitle')}
              </Typography>
            }
            action={{
              title: t('store.intake.accept'),
              onPress: (row) => {
                setTarget(row)
                sheetRef.current?.present()
              },
            }}
          />
          <StockSheet
            ref={sheetRef}
            shopId={shopId}
            target={target}
            modes={INTAKE_MODES}
            title={t('store.intake.title')}
            savedText={t('store.intake.saved')}
            t={t}
          />
        </>
      ) : (
        <EmptyState title={t('store.intake.fbsOnly')} />
      )}
    </>
  )
}

export default ShopIntakeScreen

const styles = StyleSheet.create((theme) => ({
  hint: {
    marginBottom: theme.spacing(1),
  },
}))
