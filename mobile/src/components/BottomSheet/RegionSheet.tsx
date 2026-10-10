import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import React, { RefObject, useState } from 'react'
import Typography from '@/ui/Typography'
import HeaderSheet from './HeaderSheet'
import Radio from '@/ui/Radio'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { UniTrueSheet } from '@/ui/BottomSheet'

type RegionsType = 'ahal' | 'ashgabat' | 'balkan' | 'dashoguz' | 'lebab' | 'mary' | 'arkadag'

type Props = {
  ref: RefObject<TrueSheet | null>
}

const RegionSheet = ({ ref }: Props) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionsType | null>(null)

  const regions: { key: RegionsType; value: string }[] = [
    { key: 'ahal', value: 'Ahal' },
    { key: 'ashgabat', value: 'Aşgabat' },
    { key: 'balkan', value: 'Balkan' },
    { key: 'dashoguz', value: 'Daşoguz' },
    { key: 'lebab', value: 'Lebap' },
    { key: 'mary', value: 'Mary' },
    { key: 'arkadag', value: 'Arkadag' },
  ]

  const onSelect = (region: RegionsType) => {
    setSelectedRegion(region)
  }

  const handleClose = () => {
    ref.current?.dismiss()
  }
  return (
    <UniTrueSheet ref={ref} detents={['auto']} style={styles.wrapper}>
      <HeaderSheet title="Region saýlaň" onClose={handleClose} />
      <View style={styles.container}>
        <View style={styles.content}>
          {regions.map((region) => (
            <Pressable
              onPress={() => onSelect(region.key)}
              key={region.key}
              style={styles.regionItem}
            >
              <Typography variant="p2" weight="medium">
                {region.value}
              </Typography>
              <Radio isActive={region.key === selectedRegion} />
            </Pressable>
          ))}
        </View>
      </View>
    </UniTrueSheet>
  )
}

export default RegionSheet

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    padding: theme.spacing(4),
    paddingTop: 0,
  },
  container: {
    gap: theme.spacing(10),
  },
  content: {
    gap: theme.spacing(2),
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
  },
}))
