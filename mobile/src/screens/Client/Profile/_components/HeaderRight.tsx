import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import PencilIcon from '@assets/icons/pencil.svg'
import { useRouter } from 'expo-router'
import { useUserStore } from '@/store/useUserStore'

const HeaderRight = () => {
  const router = useRouter()
  const user = useUserStore((s) => s.user)

  const onPressEditProfile = () => {
    router.push('/edit-profile')
  }

  if (!user) {
    return null
  }
  return (
    <Pressable onPress={onPressEditProfile}>
      <PencilIcon width={20} height={20} style={styles.icon} />
    </Pressable>
  )
}

export default HeaderRight

const styles = StyleSheet.create((theme) => ({
  icon: {
    color: theme.colors.passive2,
  },
}))
