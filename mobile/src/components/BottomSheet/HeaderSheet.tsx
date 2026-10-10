import React from 'react'
import Typography from '@/ui/Typography'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import CloseIcon from '@assets/icons/close.svg'
import ArrowLeftIcon from '@assets/icons/arrow-left.svg'

type Props = {
  title: string
  onClose: () => void
  onGoBack?: () => void
}

const HeaderSheet = ({ title, onClose, onGoBack }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {!!onGoBack ? (
          <Pressable onPress={onGoBack}>
            <ArrowLeftIcon width={20} height={20} style={styles.arrowIcon} />
          </Pressable>
        ) : null}
        <Typography variant="p1" weight="semiBold" numberOfLines={1}>
          {title}
        </Typography>
      </View>
      <Pressable onPress={onClose}>
        <CloseIcon width={24} height={24} style={styles.closeIcon} />
      </Pressable>
    </View>
  )
}

export default HeaderSheet

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(4),
  },
  closeIcon: {
    color: theme.colors.passive1,
  },
  left: {
    flexDirection: 'row',
    gap: theme.spacing(3),
    alignItems: 'center',
    flex: 1,
  },
  arrowIcon: {
    color: theme.colors.passive2,
  },
}))
