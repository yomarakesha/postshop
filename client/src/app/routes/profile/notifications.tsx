import { createFileRoute } from '@tanstack/react-router'
import { ProfileNotificationsPage } from '#/pages/profile-notifications'

export const Route = createFileRoute('/profile/notifications')({
  component: ProfileNotificationsPage,
})
