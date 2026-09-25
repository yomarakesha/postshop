import DiscountPercentBadge from "@/ui/Badges/DiscountPercent";
import Typography from "@/ui/Typography";
import { useShopNames } from "@/hooks/useShopNames";
import { useRouter } from "expo-router";
import {
  formatAmount,
  getCurrencyCode,
  toMoneyNumber,
} from "@/utils/formatMoney";
import { pickTranslatedName } from "@/utils/pickTranslation";
import FavoriteOutlineIcon from "@assets/icons/favourite-outline.svg";
import FavoriteSolidIcon from "@assets/icons/favourite-solid.svg";
import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ImagesList from "./ImagesList";
import ProductStatusBadge from "../Badges/ProductStatus";
import { TFunction } from "i18next";

const FavoriteButton = ({
  isFavorite,
  onPress,
  t,
}: {
  isFavorite: boolean;
  onPress: () => void;
  t: TFunction;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      // Кнопка состоит из одной иконки — озвучивать было нечего.
      accessibilityLabel={t(
        isFavorite ? "product.favorite.remove" : "product.favorite.add",
      )}
    >
      {isFavorite ? <FavoriteSolidIcon /> : <FavoriteOutlineIcon />}
    </TouchableOpacity>
  );
};

/**
 * Цена в карточке — без копеек, ровно как на витрине
 * (`widgets/ProductCard` -> `roundPrice`).
 *
 * В карточке цены стоят парой, новая и старая, а ширина карточки — половина
 * экрана: «1 790,13 TMT» и «2 000,00 TMT» в одну строку не помещались, строка
 * рвалась или обрезалась многоточием. Округление только для показа — на
 * странице товара, в корзине и в заказе цена остаётся точной. Форматирование
 * всё равно идёт через `utils/formatMoney` (`formatAmount` + `getCurrencyCode`),
 * поэтому разделитель разрядов и код валюты те же, что и везде.
 */
const formatCardPrice = (
  value: number | string,
  currency: Product.Item["currency"],
) => `${formatAmount(value, 0)}\u00A0${getCurrencyCode(currency)}`;

type Props = {
  data: Product.Item;
  withoutBrand?: boolean;
  /** Язык интерфейса; если его нет — pickTranslation сам подберёт запасной. */
  currentLanguage?: string | null;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: (productId: number) => void;
  withoutFavorite?: boolean;
  /**
   * Низ карточки под названием — например остаток и кнопка его правки в
   * «Моих товарах». Кнопки внутри нажимаются сами по себе, карточка по ним
   * не открывается (как с названием магазина выше).
   */
  footer?: React.ReactNode;
  /**
   * Подпись значка неактивного товара. По умолчанию «Нет в наличии» — так его
   * видит покупатель; в «Моих товарах» это «Снят с продажи»: остаток у такого
   * товара может быть, продавец сам убрал его с витрины.
   */
  unavailableLabel?: string;
  t: TFunction;
};

const ProductCard = ({
  data,
  withoutBrand = false,
  currentLanguage,
  isFavorite,
  onToggleFavorite,
  withoutFavorite = false,
  onPress,
  footer,
  unavailableLabel,
  t,
}: Props) => {
  // Раньше язык был захардкожен ("tk") с пометкой «TODO: Dynamic language»,
  // поэтому в русской локали названия оставались туркменскими.
  const router = useRouter();
  // Название магазина товара. Раньше в этой строке стоял бренд — на витрине
  // там магазин, и переход ведёт в него (widgets/ProductCard, storeTo).
  const shopNames = useShopNames();
  const shopName = shopNames.get(data.shop_base_id);

  const name = pickTranslatedName(data.translations, currentLanguage);
  const isModerated = data.status === "pending" || data.status === "declined";
  // В модели товара нет поля остатка — единственный признак недоступности
  // это is_active. Карточку показываем, но помечаем «нет в наличии».
  const isUnavailable = data.is_active === false;
  const hasImages = !!data.images?.length;

  const price = toMoneyNumber(data.price);
  const discountValue = toMoneyNumber(data.discount);
  const hasDiscount = !!data.discount_type && discountValue > 0;

  // Скидка суммой может оказаться больше цены (данные заводит продавец) —
  // без ограничения снизу карточка показывала отрицательную цену.
  const finalPrice = Math.max(
    0,
    data.discount_type === "percentage"
      ? price * (1 - discountValue / 100)
      : price - discountValue,
  );

  // Скидку суммой тоже показываем процентом: раньше бейдж рисовался только
  // для discount_type === "percentage", и фиксированная скидка была не видна.
  const discountPercent = Math.min(
    99,
    data.discount_type === "percentage"
      ? Math.round(discountValue)
      : price > 0
        ? Math.round((discountValue / price) * 100)
        : 0,
  );
  const showDiscountBadge = hasDiscount && discountPercent > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      // Раньше товар на модерации был disabled: продавец не мог открыть
      // собственный товар и посмотреть, что именно отправил. Правка на сервере
      // разрешена, поэтому карточка открывается — приглушён только вид.
      style={[styles.container, (isModerated || isUnavailable) && styles.faded]}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {hasImages ? (
          <ImagesList images={data.images} />
        ) : (
          // Без заглушки карточка товара без фото схлопывалась по высоте
          // и ломала выравнивание сетки.
          <View style={styles.imagePlaceholder} />
        )}
        {!withoutFavorite && (
          <View style={styles.favoriteIcon}>
            <FavoriteButton
              onPress={() => onToggleFavorite(data.id)}
              isFavorite={isFavorite}
              t={t}
            />
          </View>
        )}
        {/* Бейдж статуса стоял в правом верхнем углу — ровно под иконкой
            «в избранное», они накладывались друг на друга. */}
        {data.status !== "approved" && (
          <View style={styles.topLeftBadges}>
            <ProductStatusBadge variant={data.status} t={t} />
          </View>
        )}
        {/* Скидка и «нет в наличии» — в одном контейнере внизу слева, как на
            витрине. По отдельности они стояли в одном и том же углу и
            накладывались друг на друга. */}
        {(showDiscountBadge || isUnavailable) && (
          <View style={styles.bottomLeftBadges}>
            {showDiscountBadge && (
              <DiscountPercentBadge discountPercent={discountPercent} />
            )}
            {isUnavailable && (
              <View style={styles.unavailableBadge}>
                <Typography variant="t2" color="white" weight="medium">
                  {unavailableLabel ?? t("product.outOfStock")}
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.contentContainer}>
        {/* Цена без скидки рисовалась другим начертанием и размером (p3 medium
            против t1 bold): в одном ряду соседние карточки выглядели набранными
            разными шрифтами. Размер один, отличается только цвет. */}
        <View style={styles.priceRow}>
          <Typography
            variant="t1"
            weight="bold"
            color={hasDiscount ? "error" : undefined}
            numberOfLines={1}
          >
            {formatCardPrice(finalPrice, data.currency)}
          </Typography>
          {hasDiscount && (
            <Typography
              variant="t2"
              isLineThrough
              color="secondary"
              numberOfLines={1}
            >
              {formatCardPrice(price, data.currency)}
            </Typography>
          )}
        </View>
        {/* Две строки фиксированной высоты: иначе соседние карточки в сетке
            стояли на разной высоте — у одной название в строку, у другой в две. */}
        <Typography variant="t1" numberOfLines={2} style={styles.name}>
          {name}
        </Typography>
        {/* Магазин, а не бренд: в этой строке стоял бренд, её принимали за
            название магазина, и нажатие на неё вообще ничего не делало —
            открывался товар, как и по остальной карточке.

            Отдельный Pressable внутри карточки: нажатие достаётся ему, а не
            родителю, поэтому по названию открывается магазин, по всему
            остальному — товар. */}
        {!withoutBrand && shopName && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/shops/[id]",
                params: { id: String(data.shop_base_id) },
              })
            }
            hitSlop={6}
          >
            <Typography
              variant="t1"
              color="main"
              weight="bold"
              numberOfLines={1}
            >
              {shopName}
            </Typography>
          </Pressable>
        )}
        {footer}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create((theme, unistyles) => ({
  container: {
    position: "relative",
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
    // Ширина колонки: экран минус поля сетки слева и справа минус зазор между
    // колонками. Все три равны theme.spacing(2) — столько же задано в
    // ProductsVerticalList и в сетке на главной. Раньше здесь стояло голое
    // число 24, и связь с отступами сетки была не видна.
    width: (unistyles.screen.width - theme.spacing(2) * 3) / 2,
  },
  imageContainer: {
    // Фото занимает всю ширину карточки и строго квадратное — как на витрине
    // (aspect-4/4 + object-cover). Раньше бокс был 4:5 при contentFit
    // "contain": фото другой пропорции добивалось полями сверху и снизу, и
    // они читались как «лишний паддинг вокруг картинки», а подпись под
    // карточкой сливалась с нижним полем.
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: theme.radius.base,
    borderTopRightRadius: theme.radius.base,
    overflow: "hidden",
    position: "relative",
    backgroundColor: theme.colors.gray2,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.gray2,
  },
  contentContainer: {
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  faded: {
    opacity: 0.5,
  },
  // Отступ от края картинки у всех наложенных элементов один — spacing(3),
  // как на витрине (top-3 / bottom-3 / left-3 / right-3).
  favoriteIcon: {
    position: "absolute",
    top: theme.spacing(3),
    right: theme.spacing(3),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    // Старая цена прижата к правому краю, как на витрине. Переноса нет: со
    // flexWrap вторая цена уезжала на отдельную строку и карточка в ряду
    // становилась выше соседней.
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  // Две строки названия (t1: 14 * 1.3 = 18.2) — строка бренда под названием
  // начинается на одной высоте у всех карточек ряда.
  name: {
    minHeight: theme.spacing(9.1),
  },
  topLeftBadges: {
    position: "absolute",
    top: theme.spacing(3),
    left: theme.spacing(3),
    // Место под иконку «в избранное» в правом верхнем углу: длинный бейдж
    // статуса («На рассмотрении») иначе заезжал под сердечко.
    right: theme.spacing(10),
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
  bottomLeftBadges: {
    position: "absolute",
    bottom: theme.spacing(3),
    left: theme.spacing(3),
    right: theme.spacing(3),
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  unavailableBadge: {
    backgroundColor: theme.colors.passive2,
    paddingVertical: theme.spacing(0.5),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.base,
  },
}));
