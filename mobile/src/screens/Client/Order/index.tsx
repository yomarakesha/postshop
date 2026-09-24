import { orderApi } from "@/api/orderApi";
import Header from "@/components/Header";
import { useConfirmationModal } from "@/store/useConfirmationModal";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Typography from "@/ui/Typography";
import { orderStatus } from "@/utils/orderStatus";
import OctagonXIcon from "@assets/icons/octagon-x.svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import ShopItemsAccordion from "./_components/ShopItemsAccordion";
import PriceSummary from "@/ui/PriceSummary";
import ErrorAlert from "@/utils/errorAlert";
import { roundMoney } from "@/utils/formatMoney";

const OrderScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = orderApi.useGet(Number(id));
  const router = useRouter();
  const { t } = useTranslation();
  // Цвет шапки берём из темы, а не литералом "white".
  const { theme } = useUnistyles();
  const updateOrderStatusMutation = orderApi.useUpdateStatus(Number(id));

  const handleReject = () => {
    useConfirmationModal.setState({
      isOpen: true,
      onConfirm: async () => {
        try {
          await updateOrderStatusMutation.mutateAsync()
          router.back()
        } catch (e) { ErrorAlert(t, e as any) }
      },
      Icon: OctagonXIcon,
      title: t("confirmCancelOrder.title"),
      description: t("confirmCancelOrder.description"),
      confirmTitle: t("confirmCancelOrder.cancel"),
      cancelTitle: t("common.no"),
    });
  };

  const actions = useMemo(() => {
    if (data?.order_status.code === "pending" && !data.all_shops_rejected) {
      return (
        // Была залитая кнопка высотой 36 с широкими полями: в одной строке
        // со статусом она перевешивала его и поджимала подпись к центру.
        // Красный текст занимает ровно свою ширину и остаётся заметным.
        <Pressable onPress={handleReject} hitSlop={12}>
          <Typography variant="t1" weight="semiBold" color="error">
            {t("client.order.actions.cancel")}
          </Typography>
        </Pressable>
      );
    }

    return null;
  }, [data, t]);

  if (!id || (!isLoading && !data)) {
    router.back();
    return null;
  }

  // Раньше на время загрузки рисовался голый спиннер без шапки: экран
  // «прыгал» при появлении данных и из него нельзя было выйти назад.
  if (isLoading || !data)
    return (
      <>
        <Header
          title={t("order")}
          withGoBack
          backgroundColor={theme.colors.white}
        />
        <ActivityIndicator isFullScreen />
      </>
    );

  // Общий order_status не меняется, если отказался только один магазин —
  // поэтому статус, который видит покупатель, считаем по признакам
  // all_shops_rejected / has_rejected_shops, а не напрямую по order_status.
  const uiStatus = data.all_shops_rejected
    ? "cancelled"
    : orderStatus.client.map[data.order_status.code];
  const isPartiallyRejected = data.has_rejected_shops && !data.all_shops_rejected;

  const Icon = orderStatus.client.getIcon(uiStatus);

  // Округление до копеек до вычитания: иначе разница двух double давала
  // на экране «198.90300000000025».
  //
  // `total` — все товары заказа, `effective_total` — к оплате: товары без
  // отказавшихся магазинов плюс доставка. Поэтому доставку из разницы нужно
  // вынести: без этого она уходила в «скидку» с минусом, строки разбивки
  // пропадали, и человек видел итог больше стоимости товаров без объяснения.
  const price = roundMoney(data.total);
  const effectiveTotal = roundMoney(data.effective_total);
  const delivery = roundMoney(data.delivery_price ?? 0);
  const rejected = roundMoney(price - (effectiveTotal - delivery));

  // Код валюты берём из товаров заказа, а не хардкодим «TMT» в подписи.
  const currency = data.order_shops
    .flatMap((orderShop) => orderShop.items)
    .find((item) => item.product.currency)?.product.currency;

  return (
    <>
      <Header
        title={`${t("order")} #${data.id}`}
        withGoBack
        backgroundColor={theme.colors.white}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          {/* Статус занимал три строки по центру: крупная иконка, подпись, а
              под ними отдельной строкой кнопка отмены. Теперь одна строка —
              иконка слева, статус по центру, отмена справа. */}
          <View style={styles.statusRow}>
            <View style={styles.statusSide}>
              {Icon ? <Icon width={28} height={28} /> : null}
            </View>
            <Typography
              variant="p2"
              weight="semiBold"
              isCentered
              style={styles.statusLabel}
            >
              {t(orderStatus.client.getLabelKey(uiStatus))}
            </Typography>
            <View style={[styles.statusSide, styles.statusSideRight]}>
              {actions}
            </View>
          </View>

          {isPartiallyRejected ? (
            <Typography variant="t1" weight="medium" color="error" isCentered>
              {t("client.orders.partiallyRejected")}
            </Typography>
          ) : null}

          <View style={styles.separator}>
            {data.order_shops.map((orderShop) => (
              <ShopItemsAccordion
                key={orderShop.id}
                data={orderShop}
                shopLogoPath={
                  data.shops.find((shop) => shop.id === orderShop.shop_base_id)
                    ?.additional?.logo_path
                }
                shopName={
                  data.shops.find((shop) => shop.id === orderShop.shop_base_id)
                    ?.additional?.name
                }
                t={t}
              />
            ))}
          </View>

          <View style={styles.divider} />

          <PriceSummary
            price={price}
            discountPrice={rejected}
            deliveryPrice={delivery}
            total={effectiveTotal}
            // Без alwaysShowSubtotal: когда скидки нет, «Общая стоимость» и
            // «Итого» — одно и то же число, и внизу стояли две одинаковые
            // строки подряд.
            currency={currency}
            t={t}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default OrderScreen;

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
  },
  // Отступы переехали со style на contentContainerStyle: padding на самом
  // ScrollView задаёт рамку вьюпорта, а не длину прокручиваемого содержимого,
  // поэтому нижний блок с итогом упирался в таб-бар и обрезался.
  //
  // Высоту таб-бара сюда больше не прибавляем: он не перекрывает контент
  // (в (client-tabs)/_layout.tsx у него нет position absolute), навигация уже
  // резервирует под него место, и прибавка оставляла пустую полосу под итогом.
  scrollContent: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(6),
  },
  contentContainer: {
    padding: theme.spacing(4),
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    gap: theme.spacing(4),
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  // Боковые ячейки одинаковой ширины, чтобы статус стоял ровно по центру
  // строки, а не смещался вслед за кнопкой.
  statusSide: {
    minWidth: 64,
  },
  statusSideRight: {
    alignItems: "flex-end",
  },
  statusLabel: {
    flex: 1,
  },
  separator: {
    gap: theme.spacing(4),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.stroke,
  },
}));
