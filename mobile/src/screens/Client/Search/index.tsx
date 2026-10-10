import Header from '@/components/Header'
import React, { useRef, useState } from 'react'
import { Animated, Pressable, View, useWindowDimensions } from 'react-native'
import SearchInput from '@/ui/SearchInput'
import { StyleSheet } from 'react-native-unistyles'
import PagerView from 'react-native-pager-view'
import Typography from '@/ui/Typography'
import useDebounceSearch from '@/hooks/useDebounceSearch'
import { useTranslation } from 'react-i18next'
import Products from './_components/Products'
import Shops from './_components/Shops'
import { Stack, useRouter } from 'expo-router'
import Brands from './_components/Brands'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const SearchScreen = () => {
  const { width } = useWindowDimensions()
  const [search, setSearch] = useState('')
  const debounceSearch = useDebounceSearch(search, 500)
  const { t } = useTranslation()
  const router = useRouter()
  const TABS = [t('products'), t('shops'), t('brands')] as const
  const tabWidth = width / 3

  const [activeTab, setActiveTab] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const scrollOffset = useRef(new Animated.Value(0)).current
  const positionValue = useRef(new Animated.Value(0)).current

  const scrollX = Animated.add(scrollOffset, positionValue)

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * tabWidth),
    extrapolate: 'clamp',
  })

  const handleTabPress = (index: number) => {
    setActiveTab(index)
    pagerRef.current?.setPage(index)
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    setActiveTab(e.nativeEvent.position)
  }

  return (
    <>
      <Stack.Screen options={{ animation: 'fade' }} />
      <Header
        withGoBack
        headerCenter={
          <SearchInput
            value={search}
            onChangeText={setSearch}
            autoFocus
            placeholder={t('common.search')}
          />
        }
        backgroundColor="white"
      />

      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => (
          <Pressable key={tab} style={styles.tab} onPress={() => handleTabPress(index)}>
            <Typography
              variant="p3"
              weight={activeTab === index ? 'semiBold' : 'regular'}
              color={activeTab === index ? 'main' : undefined}
            >
              {tab}
            </Typography>
          </Pressable>
        ))}

        <Animated.View
          style={[styles.indicatorTrack, { transform: [{ translateX: indicatorTranslateX }] }]}
        >
          <View style={styles.indicator} />
        </Animated.View>
      </View>

      <AnimatedPagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        overScrollMode="never"
        onPageSelected={handlePageSelected}
        onPageScroll={Animated.event(
          [
            {
              nativeEvent: {
                position: positionValue,
                offset: scrollOffset,
              },
            },
          ],
          { useNativeDriver: true },
        )}
      >
        <View key={0} style={styles.page}>
          <Products search={debounceSearch} t={t} focus={activeTab === 0} router={router} />
        </View>
        <View key={1} style={styles.page}>
          <Shops search={debounceSearch} focus={activeTab === 1} router={router} />
        </View>
        <View key={2} style={styles.page}>
          <Brands focus={activeTab === 2} search={debounceSearch} router={router} />
        </View>
      </AnimatedPagerView>
    </>
  )
}

export default SearchScreen

const styles = StyleSheet.create((theme) => ({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing(3),
  },
  indicatorTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: `${100 / 3}%`,
    paddingHorizontal: theme.spacing(3),
  },
  indicator: {
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.blueMain,
  },
  pager: {
    flex: 1,
    backgroundColor: theme.colors.gray2,
  },
  page: {
    flex: 1,
  },
}))
