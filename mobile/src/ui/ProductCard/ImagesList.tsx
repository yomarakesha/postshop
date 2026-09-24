import React, { useCallback, useState } from "react";
import { Image } from "expo-image";
import { FlatList } from "react-native-gesture-handler";
import { LayoutChangeEvent, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { getImageUrl } from "@/utils/getImageUrl";

type Props = {
  images: string[];
};

const MAX_IMAGES = 2;

const ImagesList = ({ images }: Props) => {
  // Ширину карточки меряем сами. Раньше её считал ProductCard по формуле
  // (screen.width - 24) / 2 и передавал пропом — это была вторая копия
  // разметки сетки, которая расходилась с настоящей шириной карточки на
  // любом другом отступе, и страница листалась не по кадру.
  const [width, setWidth] = useState(0);
  const visibleImages = images.slice(0, MAX_IMAGES);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);

    setWidth((prev) => (prev === next ? prev : next));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Image
        source={{ uri: getImageUrl(item) }}
        style={[styles.image, { width }]}
        // "cover" вместо "contain": контейнер теперь квадратный (как на
        // витрине), а contain добивал фото другой пропорции полями внутри
        // карточки — их и видно было как «лишний паддинг».
        contentFit="cover"
        // Строки списка переиспользуются: без recyclingKey в новой карточке
        // на мгновение оставалось фото предыдущего товара.
        recyclingKey={item}
        transition={150}
      />
    ),
    [width],
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `${item}-${index}`,
    [],
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {width > 0 && (
        <FlatList
          data={visibleImages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={visibleImages.length > 1}
          nestedScrollEnabled
        />
      )}
    </View>
  );
};

export default ImagesList;

const styles = StyleSheet.create((theme) => ({
  // Фон под фото — подложка на время загрузки и для картинок с прозрачностью.
  // Размер задаёт контейнер карточки (квадрат), список тянется на него целиком.
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.gray2,
  },
  image: {
    height: "100%",
  },
}));
