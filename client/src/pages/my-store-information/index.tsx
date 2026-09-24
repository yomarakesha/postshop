import { useParams } from '@tanstack/react-router'
import { StoreTodoList } from '#/widgets/StoreTodoList'

export const StoreInformationPage = () => {
  const { storeId } = useParams({ from: '/my-store/$storeId' })

  return (
    <div className="w-full">
      <StoreTodoList
        storeId={Number(storeId)}
        showHeader={false}
        showStatus={false}
        disableWarehouseType
      />
    </div>
  )
}
