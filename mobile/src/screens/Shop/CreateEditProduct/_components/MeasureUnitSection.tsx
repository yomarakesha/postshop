import Typography from '@/ui/Typography'
import { TFunction } from 'i18next'
import React from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import SelectInput from '../../../../ui/SelectInput'

type Props = {
  selectedMeasureUnit?: string
  onPressMeasureUnit: () => void
  t: TFunction
}

const MeasureUnitSection = ({ selectedMeasureUnit, onPressMeasureUnit, t }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Typography weight="medium">
          {t('measurementUnit')} <Typography color="error">*</Typography>
        </Typography>
        <SelectInput
          placeholder={t('common.select')}
          value={selectedMeasureUnit}
          onPress={onPressMeasureUnit}
        />
      </View>
    </View>
  )
}

export default MeasureUnitSection

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
  },
  field: { gap: theme.spacing(2) },
}))
