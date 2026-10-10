import { ActivityIndicator, Pressable, View } from 'react-native'
import FileIcon from '@assets/icons/file-solid.svg'
import Typography from '@/ui/Typography'
import CloseIcon from '@assets/icons/close.svg'
import UploadIcon from '@assets/icons/upload-solid.svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { DocumentPickerAsset } from 'expo-document-picker'

type DocUploaderProps = {
  label: string
  file?: DocumentPickerAsset
  isPreparing?: boolean
  onUpload: () => void
  onRemove: () => void
}

const DocUploader = ({ label, file, isPreparing, onUpload, onRemove }: DocUploaderProps) => {
  const { theme } = useUnistyles()

  if (isPreparing) {
    return (
      <View style={styles.uploadZone}>
        <ActivityIndicator color={theme.colors.blueMain} />
        <Typography variant="p3" weight="medium" isCentered>
          {label}
        </Typography>
      </View>
    )
  }

  if (file) {
    return (
      <View style={styles.fileItem}>
        <FileIcon style={styles.fileIcon} />
        <View style={styles.fileInfo}>
          <Typography variant="t1" numberOfLines={1}>
            {file.name}
          </Typography>
        </View>
        <Pressable onPress={onRemove} hitSlop={10}>
          <CloseIcon style={styles.passive2} />
        </Pressable>
      </View>
    )
  }

  return (
    <Pressable onPress={onUpload} style={styles.uploadZone}>
      <UploadIcon width={20} height={20} style={styles.passive2} />
      <Typography variant="p3" weight="medium" isCentered>
        {label}
      </Typography>
    </Pressable>
  )
}

export default DocUploader

const styles = StyleSheet.create((theme) => ({
  uploadZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.stroke,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // blue3 — насыщенный синий: карточка загруженного файла выбивалась из
    // спокойной палитры экрана. blue2 — тот же цвет, что у остальных
    // «выбранных» состояний в потоке продавца.
    backgroundColor: theme.colors.blue2,
    borderRadius: theme.spacing(3),
    // Рамка того же цвета, что и фон: карточка файла занимает столько же
    // места, сколько пунктирная зона загрузки, которую она заменяет.
    borderWidth: 1.5,
    borderColor: theme.colors.blue2,
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  fileInfo: {
    flex: 1,
    gap: theme.spacing(1),
  },
  passive2: {
    color: theme.colors.passive2,
  },
  fileIcon: {
    color: theme.colors.blueMain,
  },
}))
