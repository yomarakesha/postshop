import { userApi } from '@/api/userApi'
import CreateProfileScreen from '@/screens/Client/CreateProfile'
import SelectCityScreen from '@/screens/SelectCity'
import SelectLanguageScreen from '@/screens/SelectLanguage'
import useAppStore from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'
import TabBarButton from '@/utils/TabBarButton'
import TabBarIcon from '@/utils/TabBarIcon'
import BasketIcon from '@assets/icons/basket.svg'
import CategoryIcon from '@assets/icons/category.svg'
import HomeIcon from '@assets/icons/home.svg'
import SaveIcon from '@assets/icons/save.svg'
import UserIcon from '@assets/icons/user.svg'
import { Tabs } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUnistyles } from 'react-native-unistyles'

const TabsLayout = () => {
  const { theme } = useUnistyles()
  const currentLanguage = useAppStore((s) => s.lang)
  const user = useUserStore((s) => s.user)
  const hasUserSelectedCity = useUserStore((s) => s.cityId !== null)
  const userQuery = userApi.useGetMe()
  const hasInternetConnection = useAppStore((s) => s.hasInternetConnection)
  const { t } = useTranslation()

  const TAB_SCREENS = [
    { name: '(home)', title: t('nav.home'), icon: HomeIcon },
    { name: '(categories)', title: t('nav.categories'), icon: CategoryIcon },
    { name: '(cart)', title: t('nav.cart'), icon: BasketIcon },
    { name: '(orders)', title: t('nav.orders'), icon: SaveIcon },
    { name: '(profile)', title: t('nav.profile'), icon: UserIcon },
  ] as const

  useEffect(() => {
    if (userQuery.data) {
      useUserStore.setState({ user: userQuery.data })
    }
  }, [userQuery.data])

  if (!currentLanguage) return <SelectLanguageScreen />
  if (!hasUserSelectedCity && hasInternetConnection) return <SelectCityScreen />
  if (user && !user.name) return <CreateProfileScreen />

  return (
    <Tabs
      initialRouteName="(home)"
      screenOptions={{
        headerShown: false,
        tabBarButton: TabBarButton,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
        },
      }}
    >
      {TAB_SCREENS.map(({ name, title, icon }) => (
        <Tabs.Screen key={name} name={name} options={{ title, tabBarIcon: TabBarIcon(icon) }} />
      ))}
    </Tabs>
  )
}

export default TabsLayout
