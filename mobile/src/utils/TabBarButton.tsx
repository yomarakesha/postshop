import type { BottomTabBarButtonProps } from 'expo-router/js-tabs'
import { Pressable } from 'react-native'

/**
 * Кнопка вкладки без эффекта нажатия.
 *
 * Стандартная кнопка рисует на Android расходящийся круг (ripple) — на белой
 * панели он выглядит как серое пятно под значком. Обычный Pressable его не
 * рисует; всё остальное (нажатие, подписи для чтецов) приходит в props.
 */
const TabBarButton = ({ href, ref, ...props }: BottomTabBarButtonProps) => {
  return <Pressable {...props} android_ripple={null} />
}

export default TabBarButton
