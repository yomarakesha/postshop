import { BottomTabBarHeightContext } from 'expo-router/js-tabs'
import { useContext } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const useBottomTabBarHeight = () => {
  const insets = useSafeAreaInsets()
  // Контекст читаем напрямую: готовый хук вне таб-навигатора бросает ошибку,
  // а ловить её через try/catch значит вызывать хук условно.
  const tabBarHeight = useContext(BottomTabBarHeightContext)

  return tabBarHeight ?? insets.bottom
}

export default useBottomTabBarHeight
