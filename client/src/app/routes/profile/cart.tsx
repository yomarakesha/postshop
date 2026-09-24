import { createFileRoute } from '@tanstack/react-router'
import { CartPage } from '#/pages/profile-cart'

export const Route = createFileRoute('/profile/cart')({
  component: CartPage,
})
