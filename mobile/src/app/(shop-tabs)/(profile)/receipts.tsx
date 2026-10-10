import ShopWarehouseScreen from '@/screens/Shop/Warehouse'
import React from 'react'

// «Приёмка на склад» стала вкладкой «Склада». Старый адрес открывает «Склад»
// сразу на документах отправки.
const ShopReceiptsRoute = () => {
  return <ShopWarehouseScreen initialTab="shipments" />
}

export default ShopReceiptsRoute
