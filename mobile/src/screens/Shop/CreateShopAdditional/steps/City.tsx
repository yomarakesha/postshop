import { cityApi } from '@/api/cityApi'
import Header from '@/components/Header'
import useAppStore from '@/store/useAppStore'
import Radio from '@/ui/Radio'
import Typography from '@/ui/Typography'
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { StepsProps } from '..'
import ActivityIndicator from '@/ui/ActivityIndicator'

const City = ({ setIsValid, ref, t, footerHeight }: StepsProps & { footerHeight: number }) => {
  const citiesQuery = cityApi.useGetAll()
  const [selectedCity, setSelectedCity] = useState<number | undefined>()
  const currentLang = useAppStore((s) => s.lang)

  useEffect(() => {
    setIsValid(!!selectedCity)
  }, [selectedCity])

  useImperativeHandle(ref, () => ({
    getData: () => ({
      city_id: selectedCity,
    }),
    isValid: !!selectedCity,
  }))

  const handlePress = (cityId: number) => {
    setSelectedCity(cityId)
  }

  const getTranslation = useCallback(
    (translations: City.Translation[]) => {
      return (
        translations?.find((t) => t.language === currentLang)?.name || translations?.[0]?.name || ''
      )
    },
    [currentLang],
  )

  const cities = useMemo(() => {
    return citiesQuery.data || []
  }, [citiesQuery.data])

  return (
    <>
      <Header title={t('store.shopAdditional.city')} backgroundColor="white" />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.contentContainer(footerHeight)}
      >
        {citiesQuery.isLoading ? (
          <ActivityIndicator isFullScreen />
        ) : cities.length === 0 ? (
          <View style={styles.empty}>
            <Typography color="tertiary" isCentered>
              {t('emptyState.cities.title')}
            </Typography>
          </View>
        ) : (
          cities.map((city) => (
            <Pressable key={city.id} style={styles.item} onPress={() => handlePress(city.id)}>
              <Typography style={styles.cityName} numberOfLines={2}>
                {getTranslation(city.translations)}
              </Typography>
              <Radio isActive={selectedCity === city.id} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </>
  )
}

export default City

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(6),
  },
  cityName: {
    flex: 1,
  },
  // Список регионов длинный, а снизу висит футер с кнопкой «Далее» —
  // без запаса последний регион оказывался под ним.
  contentContainer: (footerHeight: number) => ({
    flexGrow: 1,
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(4) + footerHeight,
    gap: theme.spacing(2),
  }),
  item: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.soft,
  },
}))
