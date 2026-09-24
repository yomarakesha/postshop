import React, { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image, ImageProps } from "expo-image";
import { SeparatorXs } from "@/ui/Separator";
import Typography from "@/ui/Typography";
import becomeSeller from "@assets/images/become-seller.png";
import categoryImage from "@assets/images/category.png";
import shopsImage from "@assets/images/shops.png";
import brandsImage from "@assets/images/brands.png";
import favoritesImage from "@assets/images/favorite.png";
import CategoryGlyph from "@assets/icons/category.svg";
import StoreGlyph from "@assets/icons/store.svg";
import CubeGlyph from "@assets/icons/cube.svg";
import HeartGlyph from "@assets/icons/heart.svg";
import StoreFrontGlyph from "@assets/icons/store-front.svg";
import { useRouter } from "expo-router";
import { TFunction } from "i18next";

type Props = {
  t: TFunction;
};

type NavTile = {
  id: number;
  label: string;
  image: ImageProps["source"];
  Glyph: SvgType;
  onPress: () => void;
};

/**
 * Плитка навигации на главной.
 *
 * На скриншотах с телефона тут были ровные синие квадраты без картинок: сама
 * плитка залита blue3, а иллюстрация поверх неё не появлялась. Пока картинка
 * не подтвердила загрузку (onLoad), плитка показывает контурный значок — это
 * и запасной вариант, если PNG не отрисуется, и нормальное состояние на время
 * загрузки. Значки — SVG, они рисуются тем же способом, что иконки таб-бара.
 */
const NavTileCard = ({ item }: { item: NavTile }) => {
  const [isImageReady, setIsImageReady] = useState(false);

  return (
    <Pressable style={styles.cardContainer} onPress={item.onPress}>
      <View style={styles.imageContainer}>
        {!isImageReady && (
          <item.Glyph width={28} height={28} style={styles.glyph} />
        )}
        <Image
          source={item.image}
          style={styles.image}
          // contentFit по умолчанию — cover: квадратные вырезки от этого
          // подрезались по краям. contain и внутренний отступ оставляют
          // предмет целиком внутри плитки.
          contentFit="contain"
          onLoad={() => setIsImageReady(true)}
        />
      </View>
      <Typography
        variant="t2"
        weight="semiBold"
        isCentered
        numberOfLines={2}
        style={styles.label}
      >
        {item.label}
      </Typography>
    </Pressable>
  );
};

const HomeCategoryList = ({ t }: Props) => {
  const router = useRouter();

  // Массив пересобирался на каждом рендере, а renderItem был закэширован с
  // пустыми зависимостями — после смены языка подписи оставались старыми.
  const tiles = useMemo<NavTile[]>(
    () => [
      {
        id: 1,
        label: t("client.home.homeNav.categories"),
        image: categoryImage,
        Glyph: CategoryGlyph,
        onPress: () => router.push("/(client-tabs)/(categories)"),
      },
      {
        id: 2,
        label: t("client.home.homeNav.shops"),
        image: shopsImage,
        Glyph: StoreGlyph,
        onPress: () => router.push("/shops"),
      },
      {
        id: 3,
        label: t("client.home.homeNav.brands"),
        image: brandsImage,
        Glyph: CubeGlyph,
        onPress: () => router.push("/brands"),
      },
      {
        id: 4,
        label: t("client.home.homeNav.myFavorites"),
        image: favoritesImage,
        Glyph: HeartGlyph,
        onPress: () => router.push("/favorites"),
      },
      {
        id: 5,
        label: t("client.home.homeNav.becomeSeller"),
        image: becomeSeller,
        Glyph: StoreFrontGlyph,
        onPress: () => router.push("/become-seller-onboarding"),
      },
    ],
    [t, router],
  );

  const keyExtractor = useCallback((item: NavTile) => item.id.toString(), []);

  const renderItem: ListRenderItem<NavTile> = useCallback(
    ({ item }) => <NavTileCard item={item} />,
    [],
  );

  return (
    <FlatList
      data={tiles}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={SeparatorXs}
      contentContainerStyle={styles.list}
    />
  );
};

export default HomeCategoryList;

const TILE_COLUMNS = 4.5;

const styles = StyleSheet.create((theme, rn) => {
  // Ширина плитки: поля spacing(4) по краям экрана и зазоры spacing(2) между
  // соседями. Раньше поле было spacing(3), из-за чего полоса плиток не
  // совпадала по левому краю с заголовками разделов ниже.
  const tileSize =
    (rn.screen.width - theme.spacing(4) * 2 - theme.spacing(2) * 3) /
    TILE_COLUMNS;

  return {
    cardContainer: {
      width: tileSize,
      gap: theme.spacing(1),
      alignItems: "center",
    },
    imageContainer: {
      backgroundColor: theme.colors.blue3,
      width: tileSize,
      height: tileSize,
      borderRadius: theme.radius.base,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    glyph: {
      color: theme.colors.white,
    },
    image: {
      position: "absolute",
      top: theme.spacing(1),
      right: theme.spacing(1),
      bottom: theme.spacing(1),
      left: theme.spacing(1),
    },
    label: {
      // Подпись раньше растягивалась по своей длине и вылезала за пределы
      // плитки: «Стать продавцом» уезжало за край экрана.
      width: tileSize,
    },
    list: {
      paddingHorizontal: theme.spacing(4),
    },
  };
});
