import { useUnistyles } from 'react-native-unistyles'

const useScreenOptions = () => {
  const { theme } = useUnistyles()
  return {
    headerShown: false,
    contentStyle: {
      backgroundColor: theme.colors.gray2,
    },
  }
}

export default useScreenOptions
