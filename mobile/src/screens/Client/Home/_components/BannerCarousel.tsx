import useAppStore from '@/store/useAppStore'
import { getImageUrl } from '@/utils/getImageUrl'
import { Image } from 'expo-image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'

/**
 * Карусель баннеров главной.
 *
 * Общий `@/components/Carousel` показывал слайд шириной «экран минус 48» и
 * держал по краям соседние баннеры (PEEK). Заказчик просит ровно то, что делает
 * витрина (pages/home/ui/Banner.tsx): один баннер на всю ширину, соседей не
 * видно. Поэтому страница списка здесь равна ширине экрана, поля вынесены
 * ВНУТРЬ страницы, и лист листается постранично (pagingEnabled).
 *
 * Пропорции и вписывание тоже как на витрине: рамка 2:1 и contentFit="contain"
 * — присылают баннеры 1000x500, то есть ровно 2:1; contain оставлен на случай
 * баннера другой формы, лучше поля по краям, чем срезанный текст на картинке.
 */

const AUTOPLAY_DELAY = 4000

interface Props {
  data: Banner.Item[]
  isLoading: boolean
}

const BannerCarousel = ({ data, isLoading }: Props) => {
  // Ширина берётся из того же источника, что и стили ниже, иначе после
  // поворота экрана шаг прокрутки разъезжается с шириной страницы.
  const pageWidth = UnistylesRuntime.screen.width
  const currentLanguage = useAppStore((s) => s.lang) || 'tk'
  const listRef = useRef<FlatList<Banner.Item>>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const banners = useMemo(() => [...data].sort((a, b) => a.priority - b.priority), [data])
  const isLooped = banners.length > 1

  // Клоны по краям дают бесшовный переход с последнего баннера на первый.
  const loopData = useMemo(() => {
    if (!isLooped) return banners
    return [banners[banners.length - 1], ...banners, banners[0]]
  }, [banners, isLooped])

  const pageIndex = useRef(0)

  const keyExtractor = useCallback((item: Banner.Item, index: number) => `${item.id}-${index}`, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    if (!isLooped) return

    stopTimer()

    timerRef.current = setInterval(() => {
      pageIndex.current += 1

      listRef.current?.scrollToOffset({
        offset: pageIndex.current * pageWidth,
        animated: true,
      })
    }, AUTOPLAY_DELAY)
  }, [isLooped, pageWidth, stopTimer])

  // Стартовая позиция ставится эффектом, а не пропом contentOffset: список
  // монтируется ещё пустым, contentOffset применяется один раз при монтаже, и
  // после подгрузки баннеров карусель оставалась на клоне последнего — то есть
  // открывалась «с конца».
  useEffect(() => {
    if (!isLooped) {
      pageIndex.current = 0
      setActiveIndex(0)
      return
    }

    pageIndex.current = 1
    setActiveIndex(0)
    listRef.current?.scrollToOffset({ offset: pageWidth, animated: false })
  }, [isLooped, banners.length, pageWidth])

  useEffect(() => {
    startTimer()

    return stopTimer
  }, [startTimer, stopTimer])

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      let index = Math.round(e.nativeEvent.contentOffset.x / pageWidth)

      if (isLooped) {
        if (index === 0) {
          index = banners.length

          listRef.current?.scrollToOffset({
            offset: index * pageWidth,
            animated: false,
          })
        } else if (index === loopData.length - 1) {
          index = 1

          listRef.current?.scrollToOffset({
            offset: pageWidth,
            animated: false,
          })
        }
      }

      pageIndex.current = index
      setActiveIndex(isLooped ? index - 1 : index)

      startTimer()
    },
    [banners.length, isLooped, loopData.length, pageWidth, startTimer],
  )

  const renderItem: ListRenderItem<Banner.Item> = useCallback(
    ({ item }) => {
      // Если картинки на текущем языке нет, витрина берёт любую доступную —
      // раньше приложение в этом случае показывало пустую серую плашку.
      const image =
        item.images.find((i) => i.language === currentLanguage && i.image_path) ||
        item.images.find((i) => i.image_path)

      return (
        <View style={styles.page}>
          {image ? (
            <Image
              source={getImageUrl(image.image_path)}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <View style={[styles.image, styles.placeholder]} />
          )}
        </View>
      )
    },
    [currentLanguage],
  )

  // Пока баннеры грузятся, место под них занимает плашка того же размера —
  // иначе контент под каруселью прыгает вверх.
  if (isLoading) {
    return (
      <View style={styles.page}>
        <View style={[styles.image, styles.placeholder]} />
      </View>
    )
  }

  if (banners.length === 0) return null

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={loopData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onScrollBeginDrag={stopTimer}
        onMomentumScrollEnd={onMomentumScrollEnd}
        removeClippedSubviews={false}
        initialNumToRender={loopData.length}
        maxToRenderPerBatch={loopData.length}
        windowSize={loopData.length + 2}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
      />

      {/* У полноширинного слайда без «подглядывающих» соседей не остаётся
          подсказки, что баннеров несколько, — её дают точки. */}
      {isLooped && (
        <View style={styles.dots}>
          {banners.map((banner, index) => (
            <View key={banner.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  )
}

export default BannerCarousel

const styles = StyleSheet.create((theme, unistyles) => ({
  container: {
    gap: theme.spacing(2),
  },
  // Страница = вся ширина экрана, поля живут внутри неё. Так соседний баннер
  // гарантированно остаётся за краем экрана.
  page: {
    width: unistyles.screen.width,
    paddingHorizontal: theme.spacing(2),
  },
  image: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: theme.radius.base,
    backgroundColor: theme.colors.gray2,
  },
  placeholder: {
    backgroundColor: theme.colors.gray3,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  dot: {
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray3,
  },
  dotActive: {
    width: theme.spacing(4),
    backgroundColor: theme.colors.blueMain,
  },
}))
