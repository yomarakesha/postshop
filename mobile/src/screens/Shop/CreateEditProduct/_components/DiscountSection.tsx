import React from 'react'
import { Switch, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Control, Controller } from 'react-hook-form'
import CustomTextInput from '@/ui/CustomTextInput'
import Typography from '@/ui/Typography'
import DiscountTypeToggle from './DiscountTypeToggle'
import { TFunction } from 'i18next'
import { DEFAULT_CURRENCY_CODE } from '@/utils/formatMoney'

interface Props {
  control: Control<Product.Form.CreateBody>
  hasDiscount: boolean
  discountType: Product.DiscountType
  onToggle: () => void
  onDiscountTypeChange: (type: Product.DiscountType) => void
  t: TFunction
  currencyCode?: string
}

const DiscountSection = ({
  control,
  hasDiscount,
  discountType,
  onToggle,
  currencyCode,
  onDiscountTypeChange,
  t,
}: Props) => (
  <View style={styles.container}>
    <View style={styles.switchRow}>
      <Typography weight="medium">{t('store.addEditProduct.discount.title')}</Typography>
      <Switch
        ios_backgroundColor={styles.gray3.color}
        trackColor={{ false: styles.gray3.color, true: styles.blueMain.color }}
        onValueChange={onToggle}
        thumbColor={styles.white.color}
        value={hasDiscount}
      />
    </View>
    {hasDiscount && (
      <>
        <DiscountTypeToggle onChange={onDiscountTypeChange} value={discountType} t={t} />
        <View style={styles.row}>
          <Controller
            name="discount"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                placeholder="0"
                keyboardType="number-pad"
                flex
                value={value ? String(value) : ''}
                onChangeText={(v) => onChange(+v)}
              />
            )}
          />
          <View style={styles.currency}>
            <Typography variant="p3" weight="medium" numberOfLines={1}>
              {discountType === 'fixed'
                ? currencyCode
                  ? currencyCode.toUpperCase()
                  : DEFAULT_CURRENCY_CODE
                : '%'}
            </Typography>
          </View>
        </View>
      </>
    )}
  </View>
)

export default DiscountSection

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  currency: {
    minWidth: 56,
    height: 48,
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.blue2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Цвета Switch раньше были захардкожены ("#3e3e3e", "white").
  gray3: { color: theme.colors.gray3 },
  white: { color: theme.colors.white },
  blueMain: { color: theme.colors.blueMain },
}))
