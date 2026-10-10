import { withdrawalApi } from '@/api/withdrawalApi'
import Header from '@/components/Header'
import ShopStockList from '@/components/ShopStockList'
import StockHistorySheet, { StockHistoryTarget } from '@/components/StockHistorySheet'
import WithdrawalSheet, { WithdrawalTarget } from '@/components/WithdrawalSheet'
import useFeatures from '@/hooks/useFeatures'
import useShopStore from '@/store/useShopStore'
import useAppStore from '@/store/useAppStore'
import ActivityIndicator from '@/ui/ActivityIndicator'
import EmptyState from '@/ui/EmptyState'
import Typography from '@/ui/Typography'
import ErrorAlert from '@/utils/errorAlert'
import { formatApiDate } from '@/utils/formatDate'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { TFunction } from 'i18next'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import ShopReceiptsScreen from '../Receipts'

type Tab = 'stock' | 'shipments' | 'withdrawals'

const TABS: Tab[] = ['stock', 'shipments', 'withdrawals']

const TAB_LABEL: Record<Tab, string> = {
  stock: 'store.warehouse.tabStock',
  shipments: 'store.warehouse.tabShipments',
  withdrawals: 'store.warehouse.tabWithdrawals',
}

/**
 * Заявки магазина на вывоз товара со склада Postshop — как на витрине
 * (`pages/my-store-warehouse/ui/WithdrawalList`).
 */
const WithdrawalList = ({ shopId, t }: { shopId: number; t: TFunction }) => {
  const language = useAppStore((s) => s.lang)
  const { data, isLoading } = withdrawalApi.useShopList(shopId)
  const cancel = withdrawalApi.useCancel()
  const items = data ?? []

  if (isLoading) return <ActivityIndicator isFullScreen />

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <Typography variant="t1" color="secondary">
        {t('store.withdrawal.hint')}
      </Typography>
      {items.length === 0 ? (
        <EmptyState title={t('store.withdrawal.empty')} />
      ) : (
        items.map((request) => (
          <View key={request.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Typography variant="p3" weight="medium">
                {t('store.withdrawal.number', { id: request.id })}
              </Typography>
              <Typography
                variant="t2"
                weight="medium"
                color={
                  request.status === 'rejected'
                    ? 'error'
                    : request.status === 'completed'
                      ? 'success'
                      : 'secondary'
                }
              >
                {t(`store.withdrawal.status.${request.status}`)}
              </Typography>
            </View>
            {request.items.map((item) => (
              <Typography key={item.id} variant="t1" color="secondary">
                {item.product_name ?? `#${item.product_id}`} — {Number(item.quantity)}{' '}
                {item.measure_unit_code ?? ''}
              </Typography>
            ))}
            {request.comment ? (
              <Typography variant="t1" color="secondary">
                {request.comment}
              </Typography>
            ) : null}
            {request.resolution_comment ? (
              <Typography variant="t1" color="error">
                {request.resolution_comment}
              </Typography>
            ) : null}
            <View style={styles.cardTop}>
              <Typography variant="t2" color="tertiary">
                {formatApiDate(request.created_at, language, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </Typography>
              {request.status === 'pending' ? (
                <Pressable
                  hitSlop={10}
                  disabled={cancel.isPending}
                  onPress={() =>
                    cancel.mutate(request.id, {
                      onError: (error) => ErrorAlert(t, error),
                    })
                  }
                >
                  <Typography variant="t1" weight="semiBold" color="error">
                    {t('store.withdrawal.cancel')}
                  </Typography>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

/**
 * «Склад» магазина FBO — как на витрине (`pages/my-store-warehouse`): сколько
 * товара лежит на складе Postshop и документы отправки товара туда.
 *
 * Только FBO и только пока платформа принимает товар на хранение. Магазин
 * FBS хранит товар сам: у него «Остатки» и «Приём товара».
 */
const ShopWarehouseScreen = ({ initialTab = 'stock' }: { initialTab?: Tab }) => {
  const { t } = useTranslation()
  const shopId = useShopStore((s) => s.activeShopBaseId)
  const shop = useShopStore((s) => s.shop)
  const { fboEnabled } = useFeatures()
  const [tab, setTab] = useState<Tab>(initialTab)
  const historyRef = useRef<TrueSheet>(null)
  const [historyTarget, setHistoryTarget] = useState<StockHistoryTarget | null>(null)
  const withdrawalRef = useRef<TrueSheet>(null)
  const [withdrawalTarget, setWithdrawalTarget] = useState<WithdrawalTarget | null>(null)

  const isFbo = shop?.warehouse_type === 'fbo'

  const body = () => {
    if (!shopId || !isFbo) {
      return <EmptyState title={t('store.warehouse.fboOnly')} />
    }
    if (!fboEnabled) {
      return <EmptyState title={t('store.warehouse.disabled')} />
    }
    return (
      <>
        <View style={styles.tabs}>
          {TABS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setTab(value)}
              style={styles.tab(tab === value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === value }}
            >
              <Typography
                variant="t1"
                weight="medium"
                isCentered
                color={tab === value ? 'main' : undefined}
              >
                {t(TAB_LABEL[value])}
              </Typography>
            </Pressable>
          ))}
        </View>
        {tab === 'stock' ? (
          <>
            <ShopStockList
              shopId={shopId}
              t={t}
              ListHeaderComponent={
                <Typography variant="t1" color="secondary" style={styles.hint}>
                  {t('store.warehouse.stockHint')}
                </Typography>
              }
              extraActions={[
                {
                  title: t('store.stockHistory.open'),
                  onPress: (row) => {
                    setHistoryTarget({ productId: row.productId, name: row.name })
                    historyRef.current?.present()
                  },
                },
                {
                  // Забрать свой товар со склада — раньше этого нельзя было
                  // попросить вовсе.
                  title: t('store.withdrawal.action'),
                  isVisible: (row) => row.available > 0,
                  onPress: (row) => {
                    setWithdrawalTarget({
                      productId: row.productId,
                      name: row.name,
                      available: row.available,
                    })
                    withdrawalRef.current?.present()
                  },
                },
              ]}
            />
            <StockHistorySheet
              ref={historyRef}
              shopId={shopId}
              target={historyTarget}
              isFbo
              t={t}
            />
            <WithdrawalSheet ref={withdrawalRef} shopId={shopId} target={withdrawalTarget} t={t} />
          </>
        ) : tab === 'withdrawals' ? (
          <WithdrawalList shopId={shopId} t={t} />
        ) : (
          <ShopReceiptsScreen withHeader={false} />
        )}
      </>
    )
  }

  return (
    <>
      <Header withGoBack title={t('store.warehouse.title')} backgroundColor="white" />
      {body()}
    </>
  )
}

export default ShopWarehouseScreen

const styles = StyleSheet.create((theme) => ({
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
  },
  tab: (isActive: boolean) => ({
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.spacing(10),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: isActive ? theme.colors.blueMain : theme.colors.stroke,
    backgroundColor: isActive ? theme.colors.blue1 : theme.colors.white,
  }),
  hint: {
    marginBottom: theme.spacing(1),
  },
  list: {
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  card: {
    gap: theme.spacing(1),
    padding: theme.spacing(3),
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}))
