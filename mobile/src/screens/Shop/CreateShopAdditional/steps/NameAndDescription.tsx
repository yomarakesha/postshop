import Header from '@/components/Header'
import CustomTextInput from '@/ui/CustomTextInput'
import Typography from '@/ui/Typography'
import React, { useEffect, useImperativeHandle } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native-unistyles'
import { StepsProps } from '..'

type Inputs = Pick<ShopAdditional.Item, 'name' | 'description'>

const NameAndDescription = ({ ref, setIsValid, t }: StepsProps) => {
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<Inputs>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    setIsValid(isValid)
  }, [isValid])

  useImperativeHandle(ref, () => ({
    getData: () => getValues(),
    isValid: isValid,
  }))

  return (
    <>
      <Header title={t('store.shopAdditional.nameAndDescription')} backgroundColor="white" />
      <ScrollView style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.inputWrapper}>
            <Typography variant="t1" weight="semiBold">
              {t('store.shopAdditional.storeName')}
            </Typography>
            <Controller
              control={control}
              name="name"
              rules={{
                required: true,
                minLength: 2,
                maxLength: 32,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput value={value} onBlur={onBlur} onChangeText={onChange} />
              )}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Typography variant="t1" weight="semiBold">
              {t('inputs.description')}
            </Typography>
            <Controller
              control={control}
              rules={{
                required: true,
                minLength: 2,
              }}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline={true}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>
    </>
  )
}

export default NameAndDescription

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },
  container: {
    margin: theme.spacing(4),
    padding: theme.spacing(4),
    gap: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  inputWrapper: {
    gap: theme.spacing(2),
  },
  input: {
    minHeight: 128,
    textAlignVertical: 'top',
  },
}))
