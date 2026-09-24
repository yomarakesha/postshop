import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '#/pages/privacy-policy'

export const Route = createFileRoute('/profile/privacy-policy')({
  component: PrivacyPolicy,
})
