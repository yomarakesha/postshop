import Button from "@/ui/Button";
import Typography from "@/ui/Typography";
import {
  CurrencySource,
  formatMoney,
  formatMoneyDiscount,
} from "@/utils/formatMoney";
import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import CircleInfoIcon from "@assets/icons/info.svg";

type Props = {
  price: number;
  discountPrice: number;
  total: number;
  onSubmit?: () => void;
  style?: ViewStyle;
  onPressDeliveryDetail?: () => void;
  t: (key: string) => string;
  buttonDisabled?: boolean;
  alwaysShowSubtotal?: boolean;
  /**
   * Итог показывается внутри кнопки, как на витрине: на кнопке сумма к оплате,
   * рядом зачёркнутая цена без скидки.
   *
   * Строка «Итого» при этом не рисуется — иначе одно и то же число стоит
   * дважды подряд и читается как ошибка вёрстки. А вот «Общая стоимость» и
   * «Скидка» остаются: это единственное место, где видно размер скидки, и на
   * витрине (`pages/checkout`) они показаны ровно так же — две строки разбивки
   * и сумма только в кнопке.
   *
   * Работает только вместе с `onSubmit` — на экранах заказа кнопки нет и итог
   * обязан остаться строкой.
   */
  totalInButton?: boolean;
  /**
   * Убрать разбивку над кнопкой совсем — так устроена корзина витрины
   * (`widgets/CartSidebar`): над кнопкой нет ни «Общей стоимости», ни
   * «Скидки», обе цены стоят на самой кнопке.
   *
   * Оформлению заказа это не подходит: там витрина разбивку показывает
   * (`pages/checkout`) — последний экран перед оплатой должен объяснять,
   * из чего сложилась сумма.
   */
  withoutSummary?: boolean;
  /**
   * Цена доставки отдельной строкой. Она входит в `total`, и без этой строки
   * итог оказывался больше стоимости товаров без объяснения.
   */
  deliveryPrice?: number;
  /** Валюта из данных корзины; при отсутствии formatMoney подставит TMT. */
  currency?: CurrencySource;
  /**
   * Подпись строки вычета. По умолчанию «Скидка»; в заказе вычитаются товары
   * отказавшихся магазинов, и называть их скидкой — неправда.
   */
  discountLabel?: string;
};

const PriceSummary = ({
  price,
  discountPrice,
  total,
  onSubmit,
  style,
  t,
  onPressDeliveryDetail,
  buttonDisabled,
  alwaysShowSubtotal,
  totalInButton,
  withoutSummary,
  deliveryPrice,
  currency,
  discountLabel,
}: Props) => {
  const hasDiscount = discountPrice > 0;
  const hasDelivery = typeof deliveryPrice === "number" && deliveryPrice > 0;
  const showSubtotal = hasDiscount || hasDelivery || alwaysShowSubtotal;
  const isTotalInButton = !!totalInButton && !!onSubmit;
  // Отключённая кнопка серая: белый текст на ней не читается.
  const buttonTextColor = buttonDisabled ? "disabled" : "white";

  return (
    <View style={[styles.container, style]}>
      {onPressDeliveryDetail && (
        <Pressable
          onPress={onPressDeliveryDetail}
          style={styles.deliveryLink}
          hitSlop={8}
        >
          <CircleInfoIcon style={styles.blueMain} />
          <Typography variant="p3" weight="medium" color="main">
            {t("client.cart.aboutDelivery")}
          </Typography>
        </Pressable>
      )}

      {!withoutSummary && (showSubtotal || !isTotalInButton) && (
        <View style={styles.summary}>
          {showSubtotal && (
            <View style={styles.dataContainer}>
              <Typography
                variant="p3"
                weight="medium"
                color="secondary"
                style={styles.label}
              >
                {t("client.cart.footer.totalPrice")}
              </Typography>
              <Typography variant="p3" weight="medium" style={styles.value}>
                {formatMoney(price, currency)}
              </Typography>
            </View>
          )}

          {hasDiscount && (
            <View style={styles.dataContainer}>
              <Typography
                variant="p3"
                weight="medium"
                color="secondary"
                style={styles.label}
              >
                {discountLabel ?? t("client.cart.footer.discount")}
              </Typography>
              <Typography
                variant="p3"
                weight="medium"
                color="error"
                style={styles.value}
              >
                {formatMoneyDiscount(discountPrice, currency)}
              </Typography>
            </View>
          )}

          {hasDelivery && (
            <View style={styles.dataContainer}>
              <Typography
                variant="p3"
                weight="medium"
                color="secondary"
                style={styles.label}
              >
                {t("client.cart.footer.delivery")}
              </Typography>
              <Typography variant="p3" weight="medium" style={styles.value}>
                {formatMoney(deliveryPrice, currency)}
              </Typography>
            </View>
          )}

          {showSubtotal && !isTotalInButton && <View style={styles.divider} />}

          {!isTotalInButton && (
            <View style={styles.dataContainer}>
              <Typography variant="p2" weight="bold" style={styles.label}>
                {t("client.cart.footer.total")}
              </Typography>
              <Typography variant="p2" weight="bold" style={styles.value}>
                {formatMoney(total, currency)}
              </Typography>
            </View>
          )}
        </View>
      )}

      {onSubmit &&
        (isTotalInButton ? (
          <Button
            variant="primary"
            onPress={onSubmit}
            disabled={buttonDisabled}
            style={styles.totalButton}
          >
            {/* Сумма к оплате и рядом зачёркнутая цена без скидки — как на
                кнопке корзины витрины. Подписи «Подтвердить корзину» под ними
                нет: на витрине она показывается по наведению курсора, а на
                телефоне наведения не существует.

                Старая цена рисуется только там, где разбивки нет: иначе то же
                число стоит и строкой «Общая стоимость», и на кнопке. */}
            <View style={styles.totalButtonContent}>
              <View style={styles.totalButtonRow}>
                <Typography
                  variant="p2"
                  weight="bold"
                  color={buttonTextColor}
                  numberOfLines={1}
                >
                  {formatMoney(total, currency)}
                </Typography>
                {hasDiscount && withoutSummary && (
                  <Typography
                    variant="t1"
                    weight="medium"
                    isLineThrough
                    numberOfLines={1}
                    style={
                      buttonDisabled
                        ? styles.oldPriceDisabled
                        : styles.oldPriceOnPrimary
                    }
                  >
                    {formatMoney(price, currency)}
                  </Typography>
                )}
              </View>
            </View>
          </Button>
        ) : (
          <Button
            title={t("client.cart.footer.submit")}
            variant="primary"
            onPress={onSubmit}
            disabled={buttonDisabled}
          />
        ))}
    </View>
  );
};

export default PriceSummary;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    gap: theme.spacing(3),
  },
  deliveryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  summary: {
    gap: theme.spacing(2),
  },
  dataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Без зазора длинная сумма вплотную прилипала к двоеточию подписи
    // («Общая стоимость:4303.9 TMT») и вылезала за отступ экрана.
    gap: theme.spacing(3),
  },
  label: {
    // Подпись сжимается первой, сумма всегда видна целиком.
    flexShrink: 1,
  },
  value: {
    flexShrink: 0,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.stroke,
    marginVertical: theme.spacing(1),
  },
  blueMain: {
    color: theme.colors.blueMain,
  },
  totalButton: {
    // Внутри кнопки две строки вместо одной: с базовым вертикальным отступом
    // кнопки она вырастала почти до 70 px и перевешивала футер.
    paddingVertical: theme.spacing(2),
  },
  totalButtonContent: {
    alignItems: "center",
  },
  oldPriceOnPrimary: {
    // Приглушённый белый: старая цена не должна спорить с суммой к оплате.
    color: theme.colors.white50,
  },
  oldPriceDisabled: {
    color: theme.colors.passive1,
  },
  totalButtonRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing(2),
  },
}));
