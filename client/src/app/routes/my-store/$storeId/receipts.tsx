import { createFileRoute, redirect } from '@tanstack/react-router'

// «Приёмка на склад» стала вкладкой раздела «Склад». Старый адрес остаётся
// в закладках и прочитанных уведомлениях — ведём оттуда на новое место.
export const Route = createFileRoute('/my-store/$storeId/receipts')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/my-store/$storeId/warehouse',
      params,
      search: { tab: 'shipments' },
    })
  },
})
