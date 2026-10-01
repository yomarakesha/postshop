import { useParams } from '@tanstack/react-router'
import { WarehouseTypeCard } from './ui/WarehouseTypeCard'
import { StoreTodoList } from '#/widgets/StoreTodoList'

export const StoreInformationPage = () => {
  const { storeId } = useParams({ from: '/my-store/$storeId' })

  return (
    <div className="flex w-full flex-col gap-4">
      <WarehouseTypeCard storeId={storeId} />
      <StoreTodoList
        storeId={Number(storeId)}
        showHeader={false}
        showStatus={false}
        disableWarehouseType
      />
    </div>
  )
}
