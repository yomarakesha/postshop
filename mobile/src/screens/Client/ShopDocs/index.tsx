import { shopBaseApi } from '@/api/shopBaseApi'
import Header from '@/components/Header'
import ActivityIndicator from '@/ui/ActivityIndicator'
import Button from '@/ui/Button'
import ScreenFooter from '@/ui/ScreenFooter'
import Typography from '@/ui/Typography'
import * as DocumentPicker from 'expo-document-picker'
import { DocumentPickerAsset } from 'expo-document-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Platform, ScrollView, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import DocUploader from './_components/DocUploader'
import ErrorAlert from '@/utils/errorAlert'
import { useTranslation } from 'react-i18next'
import { useConfirmationModal } from '@/store/useConfirmationModal'
import * as FileSystem from 'expo-file-system/legacy'
import { DOCUMENT_KINDS } from '@/constants/documentKinds'

const getMimeType = (name: string, mimeType?: string) => {
  if (mimeType) return mimeType
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (['jpg', 'jpeg'].includes(ext ?? '')) return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  return 'application/octet-stream'
}

const ShopDocsScreen = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { type, shopId } = useLocalSearchParams<{
    type: ShopBase.Type
    shopId: string
  }>()
  const [docs, setDocs] = useState<(DocumentPickerAsset | undefined)[]>([])
  const [preparingIndexes, setPreparingIndexes] = useState<Set<number>>(new Set())
  const shopUploadDocsMutation = shopBaseApi.useUploadDocs(Number(shopId))
  const { theme } = useUnistyles()

  const isPreparing = preparingIndexes.size > 0

  const docsData = {
    legal_entity: t('client.sellerDocs.docs.legal', {
      returnObjects: true,
    }) as string[],
    individual_entrepreneur: t('client.sellerDocs.docs.individual', {
      returnObjects: true,
    }) as string[],
  }

  const uploadedCount = docs.filter((doc) => doc !== undefined).length
  // Подписи приходят из переводов, виды — из кода. Если их станет разное
  // число, файл уедет на сервер с чужим видом, и заметить это будет нечем.
  if (__DEV__ && docsData[type].length !== DOCUMENT_KINDS[type].length) {
    console.warn(
      `ShopDocs: подписей ${docsData[type].length}, видов ${DOCUMENT_KINDS[type].length} — проверьте переводы и DOCUMENT_KINDS`,
    )
  }
  const hasAllDocs = docs.length === docsData[type].length && docs.every((doc) => doc !== undefined)

  const handleUpload = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'public.image',
        'public.heic',
        'public.heif',
      ],
    })

    if (result.canceled) return

    const asset = result.assets[0]

    // помечаем, что этот файл ещё готовится
    setPreparingIndexes((prev) => new Set(prev).add(index))

    try {
      let ready = false
      for (let attempt = 0; attempt < 10 && !ready; attempt++) {
        const info = await FileSystem.getInfoAsync(asset.uri)
        if (info.exists) {
          ready = true
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      if (!ready) {
        throw new Error(`File not ready: ${asset.uri}`)
      }

      setDocs((prev) => {
        const next = [...prev]
        next[index] = asset
        return next
      })
    } catch (e) {
      ErrorAlert(t, e as any)
    } finally {
      setPreparingIndexes((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
  }

  const handleRemove = (index: number) => {
    setDocs((prev) => {
      const next = [...prev]
      next[index] = undefined
      return next
    })
  }

  const handleSubmit = async () => {
    try {
      // Файл и его вид уходят парой: сервер принимает документы только с
      // видом и сверяет, что видов столько же, сколько файлов, и что они
      // подходят выбранному виду собственника. Вид берётся по номеру поля —
      // там же, где взята подпись.
      const kinds = DOCUMENT_KINDS[type]
      const chosen = docs.flatMap((doc, index) => (doc ? [{ doc, kind: kinds[index] }] : []))

      await shopUploadDocsMutation.mutateAsync({
        files: chosen.map(({ doc }) => ({
          uri: Platform.OS === 'ios' ? doc.uri.replace('file://', '') : doc.uri,
          name: doc.name ?? 'file',
          type: getMimeType(doc.name ?? '', doc.mimeType),
        })),
        kinds: chosen.map(({ kind }) => kind),
      })

      useConfirmationModal.setState({
        isOpen: true,
        animation: true,
        Icon: undefined,
        okTitle: t('common.close'),
        type: 'info',
        title: t('client.sellerDocs.submittedModal.title'),
        description: t('client.sellerDocs.submittedModal.description'),
        onConfirm: undefined,
      })

      router.replace('/(client-tabs)/(home)')
    } catch (e: any) {
      ErrorAlert(t, e)
    }
  }

  if (!shopId || !type) {
    router.back()
    return null
  }

  return (
    <>
      <Header withGoBack title={t('postshopSeller')} backgroundColor={theme.colors.white} />
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.docsWrapper}>
          <View style={styles.headlineWrapper}>
            <Typography variant="p3" weight="semiBold" isCentered>
              {t('client.sellerDocs.headline')}
            </Typography>
            <Typography variant="t1" color="secondary" isCentered>
              {t('client.sellerDocs.progress', {
                uploaded: uploadedCount,
                total: docsData[type].length,
              })}
            </Typography>
          </View>
          <View style={styles.inputsContainer}>
            {docsData[type].map((label, index) => (
              <DocUploader
                key={index}
                label={label}
                file={docs[index]}
                isPreparing={preparingIndexes.has(index)}
                onUpload={() => handleUpload(index)}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      <ScreenFooter>
        <Button
          title={t('common.confirm')}
          onPress={handleSubmit}
          disabled={!hasAllDocs || isPreparing || shopUploadDocsMutation.isPending}
          variant="primary"
        >
          {shopUploadDocsMutation.isPending ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : undefined}
        </Button>
      </ScreenFooter>
    </>
  )
}

export default ShopDocsScreen

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(6),
  },
  docsWrapper: {
    gap: theme.spacing(6),
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  inputsContainer: {
    gap: theme.spacing(3),
  },
  headlineWrapper: {
    gap: theme.spacing(2),
  },
}))
