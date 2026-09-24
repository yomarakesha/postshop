import { createFileRoute } from '@tanstack/react-router'
import { BrandsPage } from '#/pages/brands'

export const Route = createFileRoute('/_base-layout/brands/')({
  component: BrandsPage,
})
