import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { AlertTriangle, Check, Pipette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { cn } from '#/shared/utils/cn'
import { contrastLevel, contrastRatio } from '#/shared/utils/contrast'
import { useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut } from '#/shared/openapi/queries'
import ApprovedIcon from '#/shared/assets/icons/approved.svg?react'
import { settled } from '#/shared/lib/settled'

const presetColors = [
  '#0750D5',
  '#2563EB',
  '#0EA5E9',
  '#14B8A6',
  '#10B981',
  '#22C55E',
  '#EAB308',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#E11D48',
  '#EC4899',
  '#A855F7',
  '#6366F1',
  '#1E293B',
  '#64748B',
]

const textPresetColors = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#1E293B', '#0F172A', '#000000']

interface ColorModalProps {
  shopAdditionalId: number
  initialColor?: string | null
  initialColorText?: string | null
  storeName?: string
  storeLogo?: string
  onSave: () => void
}

export const ColorModal = forwardRef<ModalRef, ColorModalProps>(
  ({ shopAdditionalId, initialColor, initialColorText, storeName, storeLogo, onSave }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const textColorInputRef = useRef<HTMLInputElement>(null)
    const [selected, setSelected] = useState<string>(initialColor ?? '')
    const [selectedText, setSelectedText] = useState<string>(initialColorText ?? '#FFFFFF')

    const updateShopAdditional = useUpdateShopAdditionalShopAdditionalsShopAdditionalIdPut()

    useImperativeHandle(ref, () => ({
      open: () => {
        setSelected(initialColor ?? '')
        setSelectedText(initialColorText ?? '#FFFFFF')
        modalRef.current?.open()
      },
      close: () => modalRef.current?.close(),
    }))

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selected || contrast === 'unreadable') return

      const result = await settled(
        updateShopAdditional.mutateAsync({
          path: { shop_additional_id: shopAdditionalId },
          body: { color: selected, color_text: selectedText },
        }),
      )

      if (result?.data) {
        onSave()
        modalRef.current?.close()
      }
    }

    // Цвет фона и цвет текста задаются независимо, поэтому раньше можно было
    // сохранить белый текст на белом фоне — название магазина исчезало (C-25).
    const contrast = selected ? contrastLevel(selectedText, selected) : 'ok'
    const ratio = selected ? contrastRatio(selectedText, selected) : null

    const isCustom = selected && !presetColors.includes(selected)
    const isCustomText = selectedText && !textPresetColors.includes(selectedText)

    return (
      <Modal ref={modalRef} className="w-full max-w-100 p-6 bg-gray2">
        <h2 className="p1 text-center font-bold text-lg mb-6">
          {t('storeActivate.colorModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {selected && (
            <div
              className="p-3 rounded-base flex gap-4 transition-colors"
              style={{ backgroundColor: selected }}
            >
              {storeLogo && (
                <div className="bg-white rounded-base overflow-hidden p-0.5">
                  <img src={storeLogo} alt={storeName} className="w-12 h-12 object-contain" />
                </div>
              )}
              <div className="flex flex-1 items-center">
                <span className="flex gap-1 items-center">
                  <h3
                    className="p2 font-semibold transition-colors"
                    style={{ color: selectedText }}
                  >
                    {storeName || 'Store Name'}
                  </h3>
                  <ApprovedIcon />
                </span>
              </div>
            </div>
          )}

          {/* Предупреждение осталось одно: цвета практически совпали и
              названия не видно. Совета «разница небольшая» больше нет — он
              загорался на сочетаниях, которые читаются прекрасно, и выглядел
              ошибкой там, где выбор за владельцем. */}
          {contrast === 'unreadable' && (
            <div className="bg-failure/10 text-failure flex items-start gap-2 rounded-base p-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p className="t1">
                {t('storeActivate.colorModal.contrastUnreadable')}
                {ratio !== null && ` (${ratio.toFixed(1)}:1)`}
              </p>
            </div>
          )}

          <div>
            <p className="p3 font-semibold pb-2">{t('storeActivate.colorModal.bgColor')}</p>
            <div className="grid grid-cols-8 gap-2.5">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelected(color)}
                  className={cn(
                    'size-9 rounded-full transition-all flex items-center justify-center shadow-sm',
                    selected === color
                      ? 'ring-2 ring-offset-2 ring-blue-main scale-110'
                      : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selected === color && (
                    <Check size={16} strokeWidth={3} className="text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className={cn(
              'flex items-center gap-3 bg-white rounded-xl p-3.5 transition-colors hover:bg-gray1',
              isCustom && 'ring-2 ring-blue-main',
            )}
          >
            <input
              ref={colorInputRef}
              type="color"
              value={selected || '#000000'}
              onChange={(e) => setSelected(e.target.value)}
              className="sr-only"
            />
            <div
              className={cn(
                'size-9 rounded-full shrink-0 flex items-center justify-center shadow-sm',
                !isCustom && 'border-2 border-dashed border-stroke',
              )}
              style={isCustom ? { backgroundColor: selected } : undefined}
            >
              {isCustom ? (
                <Check size={16} strokeWidth={3} className="text-white drop-shadow-sm" />
              ) : (
                <Pipette size={16} className="text-passive2" />
              )}
            </div>
            <p className="p3 font-medium">{t('storeActivate.colorModal.customLabel')}</p>
            {isCustom && <p className="t1 text-passive2 uppercase ml-auto">{selected}</p>}
          </button>

          <div>
            <p className="p3 font-semibold pb-2">{t('storeActivate.colorModal.textColor')}</p>
            <div className="flex gap-2.5">
              {textPresetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedText(color)}
                  className={cn(
                    'size-9 rounded-full transition-all flex items-center justify-center shadow-sm border border-stroke',
                    selectedText === color
                      ? 'ring-2 ring-offset-2 ring-blue-main scale-110'
                      : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selectedText === color && (
                    <Check
                      size={16}
                      strokeWidth={3}
                      className="drop-shadow-sm"
                      style={{
                        color: ['#FFFFFF', '#F8FAFC', '#E2E8F0'].includes(color)
                          ? '#1E293B'
                          : '#FFFFFF',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => textColorInputRef.current?.click()}
            className={cn(
              'flex items-center gap-3 bg-white rounded-xl p-3.5 transition-colors hover:bg-gray1',
              isCustomText && 'ring-2 ring-blue-main',
            )}
          >
            <input
              ref={textColorInputRef}
              type="color"
              value={selectedText || '#FFFFFF'}
              onChange={(e) => setSelectedText(e.target.value)}
              className="sr-only"
            />
            <div
              className={cn(
                'size-9 rounded-full shrink-0 flex items-center justify-center shadow-sm border border-stroke',
                !isCustomText && 'border-2 border-dashed',
              )}
              style={isCustomText ? { backgroundColor: selectedText } : undefined}
            >
              {isCustomText ? (
                <Check
                  size={16}
                  strokeWidth={3}
                  className="drop-shadow-sm"
                  style={{
                    color: ['#FFFFFF', '#F8FAFC', '#E2E8F0'].includes(selectedText)
                      ? '#1E293B'
                      : '#FFFFFF',
                  }}
                />
              ) : (
                <Pipette size={16} className="text-passive2" />
              )}
            </div>
            <p className="p3 font-medium">{t('storeActivate.colorModal.customLabel')}</p>
            {isCustomText && <p className="t1 text-passive2 uppercase ml-auto">{selectedText}</p>}
          </button>

          <Button
            type="submit"
            disabled={!selected || contrast === 'unreadable' || updateShopAdditional.isPending}
          >
            {updateShopAdditional.isPending
              ? t('storeActivate.colorModal.saving')
              : t('storeActivate.colorModal.save')}
          </Button>
        </form>
      </Modal>
    )
  },
)

ColorModal.displayName = 'ColorModal'
