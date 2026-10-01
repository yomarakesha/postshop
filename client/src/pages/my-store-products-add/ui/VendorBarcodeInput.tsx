import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '#/shared/ui/Input'
import { cn } from '#/shared/utils/cn'
import { isValidVendorBarcode } from '#/shared/utils/barcode'

interface Props {
  value: string
  onChange: (value: string) => void
}

/**
 * Поле «Штрихкод производителя» — общее для добавления и правки товара.
 *
 * Необязательное: у многих товаров заводского кода нет, и платформа всё равно
 * присваивает свой (Штрихкод Postshop). Буквы не вводятся вовсе — код
 * переписывают с упаковки, и опечатка «O» вместо «0» иначе всплыла бы только
 * отказом сервера. Пробелы оставляем: их удобно ставить между группами цифр,
 * сервер их отбрасывает. Ошибку длины показываем после ухода из поля, а не на
 * каждой цифре — пока код набирается, он «неверный» почти всегда.
 */
export const VendorBarcodeInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation()
  const [touched, setTouched] = useState(false)
  const showError = touched && !isValidVendorBarcode(value)

  return (
    <div className="flex flex-col gap-1">
      <Input
        label={t('productBarcode.vendorLabel')}
        inputMode="numeric"
        autoComplete="off"
        maxLength={24}
        placeholder={t('productBarcode.vendorPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ''))}
        onBlur={() => setTouched(true)}
        aria-invalid={showError}
        className={cn(showError && 'border-failure')}
      />
      <p className={cn('t2', showError ? 'text-failure' : 'text-passive2')}>
        {showError ? t('productBarcode.invalid') : t('productBarcode.vendorHint')}
      </p>
    </div>
  )
}
