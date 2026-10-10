import React, { useState } from 'react'
import Typography from '@/ui/Typography'
import { Pressable, View, Modal } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import ImageIcon from '@assets/icons/image.svg'
import CloseIcon from '@assets/icons/close.svg'
import { Image } from 'expo-image'
import { TFunction } from 'i18next'

type Props = {
  onUpload: () => void
  images: any[]
  onRemove: (index: number) => void
  t: TFunction
}

const ImagePicker = ({ onUpload, images, onRemove, t }: Props) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const canAddMore = images.length < 5

  const closePreview = () => setPreviewIndex(null)

  const handleDeleteFromPreview = () => {
    if (previewIndex === null) return
    onRemove(previewIndex)
    closePreview()
  }

  return (
    <View style={styles.imagesContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <ImageIcon width={20} height={20} style={styles.blueMain} />
          <Typography weight="medium" color="secondary">
            {t('store.addEditProduct.inputs.images.label')}
          </Typography>
        </View>
        <Typography weight="medium" color="tertiary">
          {images.length}/{5}
        </Typography>
      </View>

      {images.length === 0 ? (
        <Pressable style={styles.emptyPicker} onPress={onUpload}>
          <ImageIcon width={28} height={28} style={styles.blueMain} />
          <Typography weight="medium" color="secondary" isCentered>
            {t('store.addEditProduct.inputs.images.placeholder')}
          </Typography>
          <Typography weight="medium" color="tertiary" isCentered>
            ({t('store.addEditProduct.inputs.images.notice')})
          </Typography>
        </Pressable>
      ) : (
        <View style={styles.thumbnailsRow}>
          {images.map((file, index) => (
            <Pressable
              key={`${file.uri}-${index}`}
              style={styles.thumb}
              onPress={() => setPreviewIndex(index)}
            >
              <Image source={{ uri: file.uri }} style={styles.thumbImage} contentFit="cover" />

              {index === 0 && (
                <View style={styles.coverBadge}>
                  <Typography variant="t2" weight="semiBold" color="white">
                    {t('store.addEditProduct.inputs.images.cover')}
                  </Typography>
                </View>
              )}

              <Pressable style={styles.thumbRemove} onPress={() => onRemove(index)} hitSlop={12}>
                <CloseIcon width={14} height={14} style={styles.white} />
              </Pressable>
            </Pressable>
          ))}

          {canAddMore && (
            <Pressable style={styles.addMoreTile} onPress={onUpload}>
              <ImageIcon width={22} height={22} style={styles.blueMain} />
              <Typography weight="medium" color="tertiary">
                {t('common.add')}
              </Typography>
            </Pressable>
          )}
        </View>
      )}

      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
        statusBarTranslucent
      >
        <View style={styles.previewBackdrop}>
          <Pressable style={styles.previewBackdropTouchable} onPress={closePreview} />

          {previewIndex !== null && images[previewIndex] && (
            <Image
              source={{ uri: images[previewIndex].uri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          )}

          <Pressable style={styles.previewClose} onPress={closePreview} hitSlop={12}>
            <CloseIcon width={20} height={20} style={styles.white} />
          </Pressable>

          <Pressable style={styles.previewDelete} onPress={handleDeleteFromPreview}>
            <Typography variant="p3" weight="semiBold" color="white">
              {t('common.delete')}
            </Typography>
          </Pressable>
        </View>
      </Modal>
    </View>
  )
}

export default ImagePicker

const THUMB_SIZE = 104

const styles = StyleSheet.create((theme) => ({
  imagesContainer: {
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(3),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  emptyPicker: {
    borderRadius: theme.spacing(3),
    width: '100%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.stroke,
    gap: theme.spacing(1),
    paddingVertical: theme.spacing(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: theme.spacing(2.5),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.stroke,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.blueMain,
  },
  addMoreTile: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: theme.spacing(2.5),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
  },
  blueMain: {
    color: theme.colors.blueMain,
  },
  white: {
    color: theme.colors.white,
  },

  // --- Полноэкранный просмотр ---
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBackdropTouchable: {
    ...StyleSheet.absoluteFill,
  },
  previewImage: {
    width: '92%',
    height: '75%',
  },
  previewClose: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDelete: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
}))
