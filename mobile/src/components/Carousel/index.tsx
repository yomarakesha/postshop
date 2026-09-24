import {
  Dimensions,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native-unistyles";
import useAppStore from "@/store/useAppStore";
import { Image } from "expo-image";
import { getImageUrl } from "@/utils/getImageUrl";

const windowWidth = Dimensions.get("window").width;

const PEEK = 12;
const GAP = 12;

const ITEM_WIDTH = windowWidth - 2 * (PEEK + GAP);
const SIDE_PADDING = PEEK + GAP;
const SNAP_INTERVAL = ITEM_WIDTH + GAP;

interface Props {
  data: Banner.Item[];
  isLoading: boolean;
}

const EmptyCarousel = () => {
  return <View style={style.emptyContainer} />;
};

const Carousel = ({ data, isLoading }: Props) => {
  const currentLanguage = useAppStore((s) => s.lang) || "tk";
  const listRef = useRef<FlatList<Banner.Item>>(null);
  const isLooped = data.length > 1;
  const currentIndex = useRef(isLooped ? 1 : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const loopData = useMemo(() => {
    // Сортировка была снаружи useMemo: пересчитывалась на каждый рендер и не
    // применялась вовсе, когда баннер один.
    const sorted = [...data].sort((a, b) => a.priority - b.priority);
    if (!isLooped) return sorted;
    return [sorted[sorted.length - 1], ...sorted, sorted[0]];
  }, [data, isLooped]);

  const keyExtractor = useCallback(
    (item: Banner.Item, index: number) => `${item.id}-${index}`,
    [],
  );

  const renderItem: ListRenderItem<Banner.Item> = useCallback(
    ({ item }) => {
      const currentImage = item.images.find(
        (image) => image.language === currentLanguage,
      );

      return currentImage?.image_path ? (
        <Image
          source={getImageUrl(currentImage.image_path)}
          style={style.image}
          contentFit="cover"
        />
      ) : (
        <EmptyCarousel />
      );
    },
    [currentLanguage],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!isLooped || data.length <= 1) return;

    stopTimer();

    timerRef.current = setInterval(() => {
      currentIndex.current += 1;

      listRef.current?.scrollToOffset({
        offset: currentIndex.current * SNAP_INTERVAL,
        animated: true,
      });
    }, 4000);
  }, [data.length, isLooped, stopTimer]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      let index = Math.round(offsetX / SNAP_INTERVAL);

      if (isLooped) {
        if (index === 0) {
          index = data.length;

          listRef.current?.scrollToOffset({
            offset: index * SNAP_INTERVAL,
            animated: false,
          });
        } else if (index === loopData.length - 1) {
          index = 1;

          listRef.current?.scrollToOffset({
            offset: SNAP_INTERVAL,
            animated: false,
          });
        }
      }

      currentIndex.current = index;

      startTimer();
    },
    [data.length, loopData.length, isLooped, startTimer],
  );

  useEffect(() => {
    startTimer();

    return stopTimer;
  }, [startTimer, stopTimer]);

  // Проп isLoading принимался, но нигде не использовался: пока баннеры
  // грузятся, на месте карусели была пустота, и контент под ней прыгал вверх.
  if (isLoading) {
    return (
      <View style={[style.container, style.loadingContainer]}>
        <EmptyCarousel />
      </View>
    );
  }

  return (
    <View style={style.container}>
      <FlatList
        ref={listRef}
        keyExtractor={keyExtractor}
        data={loopData}
        renderItem={renderItem}
        onScrollBeginDrag={stopTimer}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentOffset={isLooped ? { x: SNAP_INTERVAL, y: 0 } : undefined}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={style.contentContainerStyle}
        ListEmptyComponent={EmptyCarousel}
        removeClippedSubviews={false}
        initialNumToRender={loopData.length}
        maxToRenderPerBatch={loopData.length}
        windowSize={loopData.length + 2}
        getItemLayout={(_, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
      />
    </View>
  );
};

const style = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(4),
    paddingTop: Platform.select({
      ios: 0,
      default: theme.spacing(4),
    }),
  },
  contentContainerStyle: {
    paddingHorizontal: SIDE_PADDING,
    gap: GAP,
  },
  image: {
    width: ITEM_WIDTH,
    aspectRatio: 21 / 9,
    borderRadius: theme.spacing(4),
    overflow: "hidden",
  },
  loadingContainer: {
    paddingHorizontal: SIDE_PADDING,
  },
  emptyContainer: {
    width: ITEM_WIDTH,
    aspectRatio: 21 / 9,
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray3,
  },
}));

export default Carousel;
