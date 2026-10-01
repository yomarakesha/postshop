import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut } from '#/shared/openapi/queries'
import { settled } from '#/shared/lib/settled'
import { getUploadErrorMessage } from '#/shared/lib/apiError'
import { LOGO_IMAGE_MAX_SIZE, compressImage, imageErrorKey } from '#/shared/utils/compressImage'

interface LogoModalProps {
  shopAdditionalId: number
  initialLogoPath?: string | null
  onSave: () => void
}

export const LogoModal = forwardRef<ModalRef, LogoModalProps>(
  ({ shopAdditionalId, initialLogoPath, onSave }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Свой текст на обрыв: логотип — файл, и «Нет связи с сервером» на слабой
    // мобильной связи читалось как «сайт не работает», а не «попробуйте ещё».
    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut(
      undefined,
      { onError: (err) => setError(getUploadErrorMessage(err)) },
    )

    useImperativeHandle(ref, () => ({
      open: () => {
        setFile(null)
        setPreview(initialLogoPath ?? null)
        setError(null)
        modalRef.current?.open()
      },
      close: () => modalRef.current?.close(),
    }))

    // Логотип ужимается до 1024 px прямо в браузере: фото с телефона весило
    // мегабайты и на слабой связи не доходило до сервера (см. compressImage).
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (!selected) return
      setError(null)
      setIsProcessing(true)
      try {
        const prepared = await compressImage(selected, { maxSize: LOGO_IMAGE_MAX_SIZE })
        setFile(prepared)
        setPreview(URL.createObjectURL(prepared))
      } catch (err) {
        setError(t(imageErrorKey(err)))
      } finally {
        setIsProcessing(false)
      }
    }

    const handleRemove = () => {
      setFile(null)
      // Очищаем показ, а не возвращаем текущий логотип. Возврат означал, что у
      // магазина С логотипом кнопка удаления не делала ничего: картинка
      // оставалась прежней, область загрузки не появлялась, и заменить логотип
      // было нельзя вовсе.
      setPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!file) {
        setError(t('storeActivate.logoModal.error'))
        return
      }
      setError(null)

      const result = await settled(
        updateShopAdditional.mutateAsync({
          path: { shop_additional_id: shopAdditionalId },
          body: { logo: file as unknown as string },
        }),
      )

      if (result?.data) {
        onSave()
        modalRef.current?.close()
      }
    }

    return (
      <Modal ref={modalRef} className="w-full max-w-125 p-6 bg-gray2">
        <h2 className="p1 text-center font-bold text-lg mb-6">
          {t('storeActivate.logoModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {preview ? (
            <div className="relative mx-auto">
              {/* По самой картинке тоже можно выбрать файл: удалять ради замены —
                  лишний шаг, а привычка «нажать на картинку» есть у всех. */}
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={preview}
                  alt="Logo preview"
                  className="size-32 cursor-pointer rounded-xl object-contain border border-border"
                />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-base"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-stroke bg-white p-8"
            >
              <Upload size={28} className="text-passive2" />
              <p className="p3 font-medium text-passive2">{t('storeActivate.logoModal.upload')}</p>
            </button>
          )}

          {error && <p className="t2 text-(--failure) text-center">{error}</p>}

          <Button type="submit" disabled={!file || isProcessing || updateShopAdditional.isPending}>
            {isProcessing
              ? t('upload.processing')
              : updateShopAdditional.isPending
                ? t('storeActivate.logoModal.saving')
                : t('storeActivate.logoModal.save')}
          </Button>
        </form>
      </Modal>
    )
  },
)

LogoModal.displayName = 'LogoModal'
