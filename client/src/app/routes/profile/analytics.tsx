import { createFileRoute } from '@tanstack/react-router'
import { ProfileAnalyticsPage } from '#/pages/profile-analytics'

export const Route = createFileRoute('/profile/analytics')({
  component: ProfileAnalyticsPage,
})
