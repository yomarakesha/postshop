import { orderApi } from '@/api/orderApi'
import Header from '@/components/Header'
import { useConfirmationModal } from '@/store/useConfirmationModal'
import useShopStore from '@/store/useShopStore'
import ActivityIndicator from '@/ui/ActivityIndicator'
import Button from '@/ui/Button'
import PriceSummary from '@/ui/PriceSummary'
import Typography from '@/ui/Typography'
import { getImageUrl } from '@/utils/getImageUrl'
import { orderStatus } from '@/utils/orderStatus'
import { formatMoney } from '@/utils/formatMoney'
import OctagonXIcon from '@assets/icons/octagon-x.svg'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'

const getProductName = (product: Product.Item) => product.translations?.[0]?.name ?? ''

const OrderScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const shop = useShopStore((s) => s.shop)
  const { data, isLoading } = orderApi.useGet(Number(id))
  // Покупатель берётся из самого заказа. Отдельный запрос /users/{id} требует
  // права users:read, которого у продавца нет: приходил 403, и имя с телефоном
  // всегда оставались пустыми. Те же поля лежат в data.user.
  const buyer = data?.user
  const router = useRouter()
  const { t } = useTranslation()
  const theme = UnistylesRuntime.getTheme()
  const updateOrderShopStatusMutation = orderApi.useUpdateShopStatus({
    orderId: Number(id),
    shopId: shop?.shop_base_id,
  })
  const isGlobalRejected = data?.order_status.code === 'rejected'
  const isMissing = !id || (!isLoading && !data)

  // Раньше здесь стоял ранний return с router.back() прямо в теле рендера:
  // ниже по файлу есть useMemo, поэтому на «пропавшем» заказе React получал
  // разное количество хуков между рендерами (rules-of-hooks) и падал.
  // Навигация — побочный эффект, ей место в useEffect.
  useEffect(() => {
    if (isMissing) router.back()
  }, [isMissing])

  const paymountMethod: Record<Order.PaymentType, string> = {
    card: t('paymentMethod.card'),
    cash: t('paymentMethod.cash'),
    cash_and_card: t('paymentMethod.cashAndCard'),
  }

  // Последним элементом здесь стоял пустой объект `{}` — он рисовал
  // безымянную строку и лишний зазор в блоке данных покупателя.
  // Заодно отбрасываем строки без заголовка или значения (например,
  // адрес, когда у заказа нет ни самовывоза, ни доставки).
  const buyerDetails = [
    {
      title: t('buyer'),
      value: buyer ? [buyer.name, buyer.surname].filter(Boolean).join(' ') : '',
    },
    {
      title: t('inputs.phoneNumber'),
      value: buyer?.phone ?? '',
    },
    {
      title: t('paymentMethod.title'),
      value: data ? paymountMethod[data.payment_type] : '',
    },
    {
      title: data?.pickup_point
        ? t('deliveryMethod.pickup')
        : data?.delivery_address
          ? t('deliveryMethod.delivery')
          : '',
      value: data?.pickup_point?.address ?? data?.delivery_address ?? '',
    },
  ].filter((item) => !!item.title && !!item.value)

  const orderShop = data?.order_shops.find((el) => el.shop_base_id === shop?.shop_base_id)

  // Крупный статус — см. orderStatus.seller.getView: пока заказ у оператора
  // и после сборки — общий статус заказа, пока от продавца ждут действий —
  // статус его части с подсказкой. Раньше здесь всегда была часть, и
  // завершённый заказ продавец видел как «Готов к выдаче».
  const statusView = data ? orderStatus.seller.getView(data, orderShop) : undefined
  const StatusIcon = statusView?.Icon
  const globalCode = data?.order_status.code

  const handleCancel = () => {
    useConfirmationModal.setState({
      isOpen: true,
      // Причина уходит покупателю: раньше он получал «магазин отказался»
      // без объяснения.
      onConfirm: (reason) =>
        updateOrderShopStatusMutation.mutate({
          status_code: 'rejected',
          comment: reason ?? null,
        }),
      inputPlaceholder: t('store.order.rejectReasonPlaceholder'),
      Icon: OctagonXIcon,
      title: t('confirmCancelOrder.title'),
      description: t('confirmCancelOrder.description'),
      confirmTitle: t('confirmCancelOrder.cancel'),
      cancelTitle: t('common.no'),
      type: 'danger',
    })
  }

  const handleApprove = () => {
    updateOrderShopStatusMutation.mutate({ status_code: 'approved' })
  }

  const handleReadyToPickup = () => {
    updateOrderShopStatusMutation.mutate({ status_code: 'ready_to_take' })
  }

  const actions = useMemo(() => {
    if (!globalCode || isGlobalRejected) return null
    // Пока оператор заказ не принял — продавцу ещё нечего делать. Подсказка
    // «действия станут доступны…» только на этом шаге: раньше она оставалась
    // и после того, как оператор завершил заказ.
    const isWaitingOperator = globalCode === 'pending'
    // Отвечать продавцу можно только пока заказ принят оператором; дальше
    // его ведёт оператор, и кнопки сервер всё равно не примет.
    const isSellerStep = globalCode === 'approved'

    // FBO: товар на складе Postshop, часть собирают сотрудники платформы.
    // Раньше продавец видел «Принять/Отклонить/Готов к выдаче», а сервер
    // отвечал на них 403 — кнопки прячем и объясняем, почему их нет.
    if (orderShop?.warehouse_type === 'fbo') {
      // После сборки подсказка уже не нужна — как и кнопки у FBS.
      if (!isWaitingOperator && !isSellerStep) return null
      if (orderShop.status !== 'pending' && orderShop.status !== 'approved') {
        return null
      }
      return (
        <Typography color="secondary" isCentered>
          {t('store.order.fboNote')}
        </Typography>
      )
    }
    if (isWaitingOperator) {
      return (
        <Typography color="secondary" isCentered>
          {t('store.order.noApproved')}
        </Typography>
      )
    }
    if (!isSellerStep) return null
    if (orderShop?.status === 'pending') {
      return (
        <View style={styles.actionsWrapper}>
          <Button
            variant="primary"
            onPress={handleApprove}
            title={t('common.approve')}
            style={styles.actionButton}
          />
          <Button
            variant="error"
            onPress={handleCancel}
            title={t('common.reject')}
            style={styles.actionButton}
          />
        </View>
      )
    }
    if (orderShop?.status === 'approved') {
      return (
        <Button
          title={t('store.order.readyToPickup')}
          variant="primary"
          onPress={handleReadyToPickup}
        />
      )
    }
    return null
    // Обработчики пересоздаются каждый рендер, но зависят только от
    // orderShop и мутации — перечисленного достаточно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderShop, globalCode, isGlobalRejected, t])

  if (isMissing) return null
  if (isLoading || !data) return <ActivityIndicator isFullScreen />
  return (
    <>
      <Header title={`${t('order')} #${data.id}`} withGoBack backgroundColor="white" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.wrapper}>
        <View style={styles.contentContainer}>
          {statusView && StatusIcon && (
            <StatusIcon
              width={48}
              height={48}
              style={styles.statusIcon(orderStatus.seller.getToneColor(statusView.tone, theme))}
            />
          )}
          <Typography variant="p2" weight="semiBold" isCentered>
            {statusView ? t(statusView.labelKey) : ''}
          </Typography>
          {actions}
          <View style={styles.divider} />
          {orderShop?.items.map((item, index) => (
            <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
              <Image
                source={{ uri: getImageUrl(item.product.images[0]) }}
                style={styles.productImage}
                contentFit="cover"
              />
              <View style={styles.info}>
                <Typography variant="p2" weight="medium" numberOfLines={3}>
                  {getProductName(item.product)}
                </Typography>
                <Typography variant="p3" weight="medium" color="secondary">
                  {formatMoney(item.price_at_order, item.product?.currency)} • {item.quantity}{' '}
                  {t('common.pieces')}
                </Typography>
              </View>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.buyerDetailsContainer}>
            {buyerDetails.map((item) => (
              <View key={item.title} style={styles.rowBetween}>
                <Typography weight="medium" color="secondary" style={styles.detailTitle}>
                  {item.title}
                </Typography>
                <Typography weight="medium" style={styles.detailValue}>
                  {item.value}
                </Typography>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <PriceSummary
            price={Number(orderShop?.subtotal ?? 0)}
            discountPrice={0}
            total={Number(orderShop?.subtotal ?? 0)}
            currency={orderShop?.items?.[0]?.product?.currency}
            alwaysShowSubtotal
            t={t}
          />
        </View>
      </ScrollView>
    </>
  )
}

export default OrderScreen

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  statusIcon: (color: string) => ({
    marginHorizontal: 'auto',
    color,
  }),
  // Высоту таб-бара не прибавляем: он не перекрывает контент, навигация уже
  // резервирует под него место — прибавка оставляла пустую полосу внизу.
  wrapper: {
    flexGrow: 1,
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(6),
  },
  contentContainer: {
    padding: theme.spacing(4),
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    gap: theme.spacing(4),
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  // без flexBasis: 0 кнопки делят ширину по длине подписи и выходят разными
  actionButton: {
    flex: 1,
    flexBasis: 0,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.stroke,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(4),
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: theme.spacing(3),
  },
  info: {
    flex: 1,
    gap: theme.spacing(2),
  },
  buyerDetailsContainer: {
    gap: theme.spacing(2),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(4),
  },
  detailTitle: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
}))
