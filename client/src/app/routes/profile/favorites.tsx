import { createFileRoute } from '@tanstack/react-router'
import { FavoritesPage } from '#/pages/profile-favorites'

export const Route = createFileRoute('/profile/favorites')({
  component: FavoritesPage,
})
