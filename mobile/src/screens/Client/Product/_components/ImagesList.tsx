// ImagesList.tsx
import React, { useState } from 'react'
import {
  FlatList,
  ListRenderItem,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'
import { Image } from 'expo-image'
import { getImageUrl } from '@/utils/getImageUrl'

type Props = {
  images: string[]
}

const ImagesList = ({ images }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const width = UnistylesRuntime.screen.width

  const renderItem: ListRenderItem<string> = ({ item }) => (
    <Image
      source={{ uri: getImageUrl(item) }}
      style={[styles.image, { width }]}
      contentFit="contain"
    />
  )

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  // Товар без фотографий оставлял пустой белый прямоугольник во весь экран.
  if (!images.length) {
    return <View style={styles.placeholder} />
  }

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        onMomentumScrollEnd={handleScroll}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  )
}

export default ImagesList

const styles = StyleSheet.create((theme) => ({
  image: {
    aspectRatio: 7 / 8,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 7 / 8,
    backgroundColor: theme.colors.gray2,
  },
  dots: {
    position: 'absolute',
    bottom: theme.spacing(3),
    flexDirection: 'row',
    alignSelf: 'center',
    gap: theme.spacing(1),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.passive1,
  },
  dotActive: {
    backgroundColor: theme.colors.blueMain,
    width: 16,
  },
}))
