import CustomTextInput from '@/ui/CustomTextInput'
import Typography from '@/ui/Typography'
import TrashIcon from '@assets/icons/trash.svg'
import React, { Ref, useEffect, useImperativeHandle } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { RefType } from '..'
import { TFunction } from 'i18next'

type Inputs = {
  phone_numbers: { value: string }[]
}

type Props = {
  data: ShopAdditional.Item['phone_numbers']
  setIsValid: (value: boolean) => void
  ref: Ref<RefType>
  t: TFunction
}

const PhoneNumbers = ({ data, setIsValid, ref, t }: Props) => {
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<Inputs>({
    mode: 'onChange',
    defaultValues: {
      phone_numbers: data?.length
        ? data.map((phone) => ({ value: phone.slice(4) }))
        : [{ value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'phone_numbers',
  })

  useEffect(() => {
    setIsValid(isValid)
  }, [isValid])

  useImperativeHandle(ref, () => ({
    getData: () => ({
      phone_numbers: getValues('phone_numbers').map((a) => `+993${a.value.replace(' ', '')}`),
    }),
  }))

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <View style={styles.inputWrapper} key={field.id}>
          <Controller
            control={control}
            name={`phone_numbers.${index}.value`}
            rules={{ required: true, minLength: 8 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput
                flex
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '')

                  const formatted =
                    digits.length > 2 ? `${digits.slice(0, 2)} ${digits.slice(2)}` : digits

                  onChange(formatted)
                }}
                leftElement={<Typography variant="t1">+993</Typography>}
                keyboardType="phone-pad"
                maxLength={9}
              />
            )}
          />
          {fields.length > 1 && (
            <Pressable onPress={() => remove(index)}>
              <TrashIcon style={styles.trashIcon} />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable onPress={() => append({ value: '' })} style={styles.addButton}>
        <Typography variant="p3" color="main">
          + {t('store.shopAdditional.addPhoneNumber')}
        </Typography>
      </Pressable>
    </View>
  )
}

export default PhoneNumbers

const styles = StyleSheet.create((theme) => ({
  container: {
    margin: theme.spacing(4),
    padding: theme.spacing(4),
    gap: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  inputWrapper: {
    gap: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    paddingVertical: theme.spacing(3),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(3),
  },
  trashIcon: {
    color: theme.colors.failure,
  },
}))
