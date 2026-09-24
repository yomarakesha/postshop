import { createFileRoute } from '@tanstack/react-router'
import { ProfileEditPage } from '#/pages/profile-edit'

export const Route = createFileRoute('/profile/edit')({
  component: ProfileEditPage,
})
