import { createFileRoute } from '@tanstack/react-router'
import { ProfileAddressesPage } from '#/pages/profile-addresses'

export const Route = createFileRoute('/profile/addresses')({
  component: ProfileAddressesPage,
})
