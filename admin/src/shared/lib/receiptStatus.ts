import { ReceiptStatus } from '@/shared/openapi/requests'

/**
 * Цвет статуса приёмки. Отменённая и черновик раньше выглядели одинаково
 * (серым), и закрытый документ было не отличить от ждущего.
 */
export const receiptStatusVariant = {
  [ReceiptStatus.DRAFT]: 'warning',
  [ReceiptStatus.CONFIRMED]: 'success',
  [ReceiptStatus.CANCELLED]: 'destructive',
} as const
