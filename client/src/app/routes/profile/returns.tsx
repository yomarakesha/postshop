import { createFileRoute } from '@tanstack/react-router'
import { ProfileReturnsPage } from '#/pages/profile-returns'

export const Route = createFileRoute('/profile/returns')({
  component: ProfileReturnsPage,
})
