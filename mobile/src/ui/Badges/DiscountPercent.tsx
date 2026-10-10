import Typography from '@/ui/Typography'
import React from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props = {
  discountPercent: number
}

const DiscountPercentBadge = ({ discountPercent }: Props) => {
  return (
    <View style={styles.container}>
      <Typography variant="t2" color="white" weight="semiBold">
        {discountPercent}%
      </Typography>
    </View>
  )
}

export default DiscountPercentBadge

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.failure,
    padding: theme.spacing(0.5),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    alignSelf: 'flex-start',
  },
}))
