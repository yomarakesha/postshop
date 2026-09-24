import { useRef } from 'react'
import { FileCheck, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DOCUMENT_SLOTS } from '../model/documentSlots'
import type { BecomeStoreForm } from '#/pages/home/model/useBecomeStoreForm'
import { StepNavigation } from '#/shared/ui/StepNavigation'
import UploadIcon from '#/shared/assets/icons/upload.svg?react'

interface Props {
  form: BecomeStoreForm
  isSubmitting: boolean
  error: string | null
  onBack: () => void
}

export const DocumentUpload = ({ form, isSubmitting, error, onBack }: Props) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const { t } = useTranslation()

  return (
    <div className="p-6 flex flex-col gap-6">
      <p className="p1 font-semibold text-center">{t('services.upload.title')}</p>

      <form.Field name="legalEntityType">
        {(legalEntityField) => {
          const documentSlots = DOCUMENT_SLOTS[legalEntityField.state.value]

          return (
            <form.Field name="files">
              {(filesField) => (
                <div className="flex flex-col gap-2">
                  {documentSlots.map(({ labelKey: key }, index) => {
                    const file = filesField.state.value[index]

                    return (
                      <div key={key}>
                        <input
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          type="file"
                          className="hidden"
                          // Те же форматы, что принимает сервер. С «image/*»
                          // можно было выбрать HEIC с айфона и получить отказ
                          // только после отправки всей заявки.
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => {
                            const selected = e.target.files?.[0]
                            if (!selected) return
                            filesField.handleChange({
                              ...filesField.state.value,
                              [index]: selected,
                            })
                          }}
                        />
                        <div className="relative w-full">
                          <button
                            type="button"
                            onClick={() => inputRefs.current[index]?.click()}
                            className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stroke bg-white p-3 w-full"
                          >
                            {file ? (
                              <>
                                <FileCheck className="text-green-600" size={20} />
                                <p className="p3 font-medium text-green-600 truncate max-w-full">
                                  {file.name}
                                </p>
                              </>
                            ) : (
                              <>
                                <UploadIcon className="text-blue-main" width={20} height={20} />
                                <p className="p3 font-medium">{t(key)}</p>
                              </>
                            )}
                          </button>
                          {file ? (
                            <button
                              type="button"
                              onClick={() => {
                                const { [index]: _, ...rest } = filesField.state.value
                                filesField.handleChange(rest)
                                const input = inputRefs.current[index]
                                if (input) input.value = ''
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-base"
                            >
                              <X size={14} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </form.Field>
          )
        }}
      </form.Field>

      <form.Field name="legalEntityType">
        {(legalEntityField) => (
          <form.Field name="files">
            {(filesField) => {
              const requiredCount = DOCUMENT_SLOTS[legalEntityField.state.value].length
              const uploadedCount = Object.keys(filesField.state.value).length

              return (
                <div className="flex flex-col gap-2">
                  {error && <p className="p3 text-red-500 text-center">{error}</p>}
                  <StepNavigation
                    onBack={onBack}
                    onNext={() => form.handleSubmit()}
                    disabled={isSubmitting || uploadedCount < requiredCount}
                  />
                </div>
              )
            }}
          </form.Field>
        )}
      </form.Field>
    </div>
  )
}
