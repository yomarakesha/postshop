import Typography from '@/ui/Typography'
import { TFunction } from 'i18next'
import React from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import SelectInput from '../../../../ui/SelectInput'

interface Props {
  selectedCategory?: string
  selectedBrand?: string
  onPressCategory: () => void
  onPressBrand: () => void
  onRemoveBrand: () => void
  t: TFunction
}

const CategoryBrandSection = ({
  selectedCategory,
  selectedBrand,
  onPressCategory,
  onPressBrand,
  t,
}: Props) => (
  <View style={styles.container}>
    <View style={styles.field}>
      <Typography weight="medium">
        {t('category')} <Typography color="error">*</Typography>
      </Typography>
      <SelectInput
        placeholder={t('common.select')}
        value={selectedCategory}
        onPress={onPressCategory}
      />
    </View>
    <View style={styles.field}>
      <Typography weight="medium">
        {t('brand')} <Typography color="error">*</Typography>
      </Typography>
      <SelectInput placeholder={t('common.select')} value={selectedBrand} onPress={onPressBrand} />
    </View>
  </View>
)

export default CategoryBrandSection

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
  },
  field: { gap: theme.spacing(2) },
}))
