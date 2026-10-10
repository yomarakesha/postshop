import React, { useState } from 'react'
import { StyleProp, TextInputProps, View, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import TextInput from '@/ui/TextInput'

type Props = TextInputProps & {
  disabled?: boolean
  flex?: boolean
  leftElement?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
}

const CustomTextInput = ({
  onFocus,
  onBlur,
  disabled,
  style,
  leftElement,
  containerStyle,
  flex = false,
  ...rest
}: Props) => {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focused,
        disabled && styles.disabled,
        flex && styles.flex1,
        containerStyle,
      ]}
    >
      {leftElement && leftElement}
      <TextInput
        {...rest}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
        scrollEnabled={false}
        style={[styles.input, disabled && styles.disabled, rest.multiline && styles.multilineInput]}
        editable={!disabled}
      />
    </View>
  )
}

export default CustomTextInput

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  container: {
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    // Одна высота с кнопками и SelectInput — раньше поля были ниже и
    // соседние элементы в строке не выравнивались.
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  focused: {
    borderColor: theme.colors.blueMain,
  },
  input: {
    height: 'auto',
    padding: 0,
    flex: 1,
    // Раньше цвет текста не задавался вовсе: в тёмной теме поле рисовало
    // системный чёрный текст на тёмном фоне. Плюс поле выпадало из типографики
    // приложения (системный шрифт 14px вместо GoogleSans 16px).
    color: theme.colors.text,
    fontFamily: 'GoogleSans-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  disabled: {
    backgroundColor: theme.colors.gray2,
    color: theme.colors.passive2,
  },
  multilineInput: {
    minHeight: 92,
    textAlignVertical: 'top',
    // lineHeight 16 при 16px шрифте склеивал строки — строки многострочного
    // поля наезжали друг на друга.
    lineHeight: 24,
    paddingTop: theme.spacing(1),
  },
}))
