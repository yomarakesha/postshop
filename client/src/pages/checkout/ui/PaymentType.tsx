import { useTranslation } from 'react-i18next'
import { PaymentType as PaymentTypeEnum } from '#/shared/openapi/requests/types.gen'
import { RadioCircle } from '#/shared/ui/RadioCircle'

interface PaymentTypeProps {
  value: PaymentTypeEnum
  onChange: (value: PaymentTypeEnum) => void
}

export const PaymentType = ({ value, onChange }: PaymentTypeProps) => {
  const { t } = useTranslation()

  const payments: Array<{ label: string; value: PaymentTypeEnum }> = [
    { label: t('checkout.cash'), value: PaymentTypeEnum.CASH },
    { label: t('checkout.card'), value: PaymentTypeEnum.CARD },
    { label: t('checkout.cashAndCard'), value: PaymentTypeEnum.CASH_AND_CARD },
  ]

  return (
    <div className="bg-white p-4 rounded-base">
      <h2 className="p2 font-semibold mb-4">{t('checkout.paymentType')}</h2>
      {payments.map((payment) => (
        <button
          key={payment.value}
          onClick={() => onChange(payment.value)}
          className="flex items-center justify-between py-4 bg-white cursor-pointer w-full border-b border-stroke last:border-b-0"
        >
          <span className="p3 font-medium">{payment.label}</span>
          <RadioCircle selected={value === payment.value} />
        </button>
      ))}
    </div>
  )
}
