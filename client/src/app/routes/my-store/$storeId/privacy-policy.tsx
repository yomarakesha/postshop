import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '#/pages/privacy-policy'

export const Route = createFileRoute('/my-store/$storeId/privacy-policy')({
  component: PrivacyPolicy,
})
