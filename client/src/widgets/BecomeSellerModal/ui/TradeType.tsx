import { Building2, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BecomeStoreForm } from '#/pages/home/model/useBecomeStoreForm'
import { cn } from '#/shared/utils/cn'
import { RadioCircle } from '#/shared/ui/RadioCircle'
import { StepNavigation } from '#/shared/ui/StepNavigation'
import { LegalEntityType } from '#/shared/openapi/requests'

interface Props {
  form: BecomeStoreForm
  onBack: () => void
  onNext: () => void
}

export const TradeType = ({ form, onBack, onNext }: Props) => {
  const { t } = useTranslation()

  const types = [
    {
      id: LegalEntityType.INDIVIDUAL_ENTREPRENEUR,
      title: t('services.tradeType.individual'),
      icon: User,
    },
    {
      id: LegalEntityType.LEGAL_ENTITY,
      title: t('services.tradeType.legalEntity'),
      icon: Building2,
    },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      <p className="p1 font-bold text-center">{t('services.tradeType.title')}</p>

      <form.Field name="legalEntityType">
        {(field) => (
          <div className="flex flex-col gap-3">
            {types.map((type) => {
              const isSelected = field.state.value === type.id
              const Icon = type.icon

              return (
                <button
                  key={type.id}
                  onClick={() => {
                    field.handleChange(type.id)
                    if (type.id !== field.state.value) {
                      form.setFieldValue('files', [])
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-base',
                    isSelected
                      ? 'border-blue-main bg-white'
                      : 'border-transparent bg-white hover:border-stroke',
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex shrink-0 items-center justify-center transition-colors',
                      isSelected ? 'bg-blue2 text-blue-main' : 'bg-gray2 text-passive2',
                    )}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </div>

                  <p
                    className={cn('p3 font-semibold', isSelected ? 'text-blue-main' : 'text-black')}
                  >
                    {type.title}
                  </p>

                  <RadioCircle selected={isSelected} className="ml-auto" />
                </button>
              )
            })}
          </div>
        )}
      </form.Field>

      <StepNavigation onBack={onBack} onNext={onNext} showBack={false} />
    </div>
  )
}
