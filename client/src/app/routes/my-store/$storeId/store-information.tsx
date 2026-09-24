import { createFileRoute } from '@tanstack/react-router'
import { StoreInformationPage } from '#/pages/my-store-information'

export const Route = createFileRoute('/my-store/$storeId/store-information')({
  component: StoreInformationPage,
})
