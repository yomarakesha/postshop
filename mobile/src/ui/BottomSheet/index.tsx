import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { withUnistyles } from 'react-native-unistyles'

export const UniTrueSheet = withUnistyles(TrueSheet, (theme) => ({
  backgroundColor: theme.colors.white,
  cornerRadius: 24,
}))
