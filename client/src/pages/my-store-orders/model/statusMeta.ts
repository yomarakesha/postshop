import { CheckCheck, CircleCheck, CircleX, Clock, PackageCheck, Truck } from 'lucide-react'
import type { LocalOrderStatusCode } from '#/shared/openapi/requests/types.gen'
import type { LucideIcon } from 'lucide-react'
import { OrderStatusCode } from '#/shared/openapi/requests/types.gen'

export const orderStatusIcon: Record<OrderStatusCode, LucideIcon> = {
  [OrderStatusCode.PENDING]: Clock,
  [OrderStatusCode.APPROVED]: CircleCheck,
  [OrderStatusCode.REJECTED]: CircleX,
  [OrderStatusCode.READY_TO_TAKE]: PackageCheck,
  [OrderStatusCode.READY_TO_DELIVER]: Truck,
  [OrderStatusCode.COMPLETED]: CheckCheck,
}

export const orderStatusColor: Record<OrderStatusCode, string> = {
  [OrderStatusCode.PENDING]: 'text-warning',
  [OrderStatusCode.APPROVED]: 'text-blue-main',
  [OrderStatusCode.REJECTED]: 'text-failure',
  [OrderStatusCode.READY_TO_TAKE]: 'text-success',
  [OrderStatusCode.READY_TO_DELIVER]: 'text-success',
  [OrderStatusCode.COMPLETED]: 'text-success',
}

// LocalOrderStatusCode (a shop's own progress on an order) is a subset of
// OrderStatusCode with identical string values, so the maps above cover it too.
export const getStatusIcon = (code: OrderStatusCode | LocalOrderStatusCode) =>
  orderStatusIcon[code as OrderStatusCode]

export const getStatusColor = (code: OrderStatusCode | LocalOrderStatusCode) =>
  orderStatusColor[code as OrderStatusCode]
