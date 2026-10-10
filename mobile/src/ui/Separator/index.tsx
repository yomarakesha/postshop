import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const SeparatorXs = () => <View style={styles.separatorXs} />
const SeparatorSm = () => <View style={styles.separatorSm} />
const SeparatorMd = () => <View style={styles.separatorMd} />
const SeparatorLg = () => <View style={styles.separatorLg} />

const styles = StyleSheet.create((theme) => ({
  separatorXs: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  separatorSm: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  separatorMd: {
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
  separatorLg: {
    height: theme.spacing(6),
    width: theme.spacing(6),
  },
}))

export { SeparatorXs, SeparatorSm, SeparatorMd, SeparatorLg }
