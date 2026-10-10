import React, { useRef, useState } from 'react'
import { StyleSheet } from 'react-native-unistyles'
import { UniTrueSheet } from '@/ui/BottomSheet'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import SubCategoriesSheet from './SubCategories'
import CategoriesSheetMain from './Main'
import { TFunction } from 'i18next'

type Props = {
  ref: React.RefObject<TrueSheet | null>
  onSelect: (id: number, name: string) => void
  t: TFunction
}

const CategoriesSheet = ({ ref, onSelect, t }: Props) => {
  const subCategoriesRef = useRef<TrueSheet | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const handleSelect = (id: number) => {
    setSelectedCategory(id)
    subCategoriesRef.current?.present()
  }

  const onClose = () => {
    TrueSheet.dismissAll()
  }

  return (
    <>
      <UniTrueSheet ref={ref} detents={[0.5, 1]} style={styles.wrapper} scrollable>
        <CategoriesSheetMain onClose={onClose} onSelect={handleSelect} t={t} />
      </UniTrueSheet>

      <UniTrueSheet ref={subCategoriesRef} detents={[0.5, 1]} style={styles.wrapper} scrollable>
        {selectedCategory !== null && (
          <SubCategoriesSheet
            parentId={selectedCategory}
            onSelect={onSelect}
            onGoBack={() => subCategoriesRef.current?.dismiss()}
            onClose={onClose}
            t={t}
          />
        )}
      </UniTrueSheet>
    </>
  )
}

export default CategoriesSheet

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    padding: theme.spacing(4),
    paddingTop: 0,
  },
}))
