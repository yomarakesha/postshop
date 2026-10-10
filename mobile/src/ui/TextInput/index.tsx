import { TextInput as ReactNativeTextInput } from 'react-native'
import { withUnistyles } from 'react-native-unistyles'

const TextInput = withUnistyles(ReactNativeTextInput, (theme) => ({
  cursorColor: theme.colors.blueMain,
  selectionColor: theme.colors.blueMain,
  placeholderTextColor: theme.colors.passive2,
  includeFontPadding: false,
}))

export default TextInput
