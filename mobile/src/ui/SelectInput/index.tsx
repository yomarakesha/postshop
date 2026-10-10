// ui/SelectInput.tsx
import React from 'react'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import Typography from '@/ui/Typography'
import ChevronRightIcon from '@assets/icons/right-chevron.svg'

type Props = {
  placeholder: string
  value?: string
  onPress: () => void
}

const SelectInput = ({ placeholder, value, onPress }: Props) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Typography
        variant="p3"
        color={value ? undefined : 'tertiary'}
        numberOfLines={1}
        style={styles.value}
      >
        {value || placeholder}
      </Typography>
      <ChevronRightIcon style={styles.icon} width={20} height={20} />
    </Pressable>
  )
}

export default SelectInput

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3),
    // Одна высота с CustomTextInput и кнопками.
    minHeight: 48,
    gap: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  // Длинное значение раньше выдавливало стрелку за пределы поля.
  value: {
    flexShrink: 1,
  },
  icon: {
    color: theme.colors.passive1,
  },
}))
