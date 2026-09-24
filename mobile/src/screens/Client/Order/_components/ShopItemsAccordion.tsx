import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import Typography from "@/ui/Typography";
import ChevronRightIcon from "@assets/icons/right-chevron.svg";
import { getImageUrl } from "@/utils/getImageUrl";
import { TFunction } from "i18next";
import { orderStatus } from "@/utils/orderStatus";
import { formatMoney, toMoneyNumber } from "@/utils/formatMoney";
import { useRouter } from "expo-router";

type Props = {
  shopLogoPath?: string;
  /**
   * Название магазина. Живёт не в `orderShop.shop` (это база магазина, у неё
   * названия нет), а в его карточке `additional` — её знает только родитель,
   * он же достаёт оттуда логотип.
   */
  shopName?: string;
  data: Order.OrderShop;
  t: TFunction;
};

const getProductName = (product: Product.Item) =>
  product.translations[0]?.name ?? "";

const ShopItemsAccordion = ({ data, shopLogoPath, shopName, t }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(1);

  const items = data.items;
  const isRejected = data.status === "rejected";
  const RejectedIcon = orderStatus.shop.getIcon(data.status);

  const toggle = () => {
    const toValue = isOpen ? 0 : 1;
    progress.value = withTiming(toValue, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
    setIsOpen((prev) => !prev);
  };

  const contentStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
    overflow: "hidden",
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 90])}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Pressable style={styles.header(isOpen)} onPress={toggle}>
        {/* Нажатие на логотип и название ведёт в магазин; сворачивает список
            остальная часть строки. Раньше и то и другое только сворачивало —
            попасть в магазин из заказа было нельзя. */}
        <Pressable
          style={styles.headerLeft}
          onPress={() =>
            router.push({
              pathname: "/shops/[id]",
              params: { id: String(data.shop_base_id) },
            })
          }
        >
          <View style={styles.logoWrapper}>
            {shopLogoPath ? (
              <Image
                source={{ uri: getImageUrl(shopLogoPath) }}
                style={styles.logo}
                // contentFit "contain" оставлял поля вокруг логотипа, и он
                // читался как картинка внутри коробки другого оттенка белого.
                contentFit="cover"
              />
            ) : null}
          </View>
          <View style={styles.nameColumn}>
            {/* Было `data.shop.name` — у базы магазина такого поля нет, и на
                экране оставалось голое «(1)». Компилятор на это ругался, но
                ошибку носили как фоновую. */}
            <Typography weight="semiBold" numberOfLines={1}>
              {shopName ? `${shopName} (${items.length})` : `(${items.length})`}
            </Typography>
            {isRejected ? (
              <View style={styles.rejectedRow}>
                {RejectedIcon ? (
                  <RejectedIcon
                    width={14}
                    height={14}
                    style={styles.rejectedIcon}
                  />
                ) : null}
                <Typography variant="t2" weight="medium" color="error">
                  {t(orderStatus.shop.getLabelKey(data.status))}
                </Typography>
              </View>
            ) : null}
          </View>
        </Pressable>
        <Animated.View style={chevronStyle}>
          <ChevronRightIcon width={20} height={20} style={styles.chevron} />
        </Animated.View>
      </Pressable>

      {isRejected && data.comment ? (
        <View style={styles.rejectionComment}>
          <Typography variant="t2" weight="medium" color="error">
            {t("client.order.rejectionReasonLabel")}
          </Typography>
          <Typography variant="t1" weight="medium">
            {data.comment}
          </Typography>
        </View>
      ) : null}

      <Animated.View style={contentStyle}>
        <View
          style={styles.measure}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          {items.map((item, index) => {
            // Цена, по которой товар ушёл в заказ, и цена самого товара.
            // Если первая ниже — скидка была применена, и её видно только
            // так: отдельного поля скидки в позиции заказа нет.
            const paid = toMoneyNumber(item.price_at_order);
            const listed = toMoneyNumber(item.product.price);
            const hadDiscount = listed > paid;

            return (
              // Нажатие открывает товар: раньше строка была неинтерактивной,
              // и вернуться к купленному товару из заказа было нельзя.
              <Pressable
                key={item.id}
                style={[styles.row, index === 0 && styles.firstRow]}
                onPress={() =>
                  router.push({
                    pathname: "/products/[id]",
                    params: { id: String(item.product_id) },
                  })
                }
              >
                <Image
                  source={{ uri: getImageUrl(item.product.images[0]) }}
                  style={styles.productImage}
                  contentFit="cover"
                />
                <View style={styles.info}>
                  <Typography variant="p2" weight="medium" numberOfLines={3}>
                    {getProductName(item.product)}
                  </Typography>
                  <View style={styles.priceRow}>
                    <Typography
                      variant="p3"
                      weight="medium"
                      color={hadDiscount ? "error" : "secondary"}
                    >
                      {formatMoney(item.price_at_order, item.product.currency)}
                    </Typography>
                    {hadDiscount ? (
                      <Typography
                        variant="t2"
                        weight="medium"
                        color="secondary"
                        isLineThrough
                      >
                        {formatMoney(item.product.price, item.product.currency)}
                      </Typography>
                    ) : null}
                    <Typography
                      variant="p3"
                      weight="medium"
                      color="secondary"
                    >
                      {" • "}
                      {item.quantity} {t("common.pieces")}
                    </Typography>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

export default ShopItemsAccordion;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.white,
    // Были заданы только верхняя и нижняя границы (боковые — transparent)
    // при borderRadius 20: скруглённые углы обрывались в пустоту, карточка
    // выглядела «недорисованной». Теперь рамка замкнутая.
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.spacing(5),
    padding: theme.spacing(3),
  },
  header: (isOpen: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: isOpen ? 1 : 0,
    borderBottomColor: theme.colors.stroke,
    paddingBottom: isOpen ? theme.spacing(3) : 0,
  }),
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    flex: 1,
  },
  nameColumn: {
    flex: 1,
    gap: theme.spacing(1),
  },
  rejectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  // Причина отказа читалась как обычный текст между шапкой и товарами.
  // Теперь это отдельная плашка — видно, что комментарий относится к отказу.
  rejectionComment: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.gray2,
    gap: theme.spacing(1),
  },
  logoWrapper: {
    width: 48,
    height: 48,
    // Фон-заглушка: у магазинов без логотипа была пустая «дырка» в рамке.
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  chevron: {
    color: theme.colors.passive1,
  },
  // Цвет иконки шёл через UnistylesRuntime.getTheme() в inline-стиле —
  // при смене темы он не пересчитывался. Теперь это обычный стиль темы.
  rejectedIcon: {
    color: theme.colors.failure,
  },
  measure: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: theme.colors.gray2,
  },
  info: {
    flex: 1,
    gap: theme.spacing(2),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
}));