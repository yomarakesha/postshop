import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { StoreActivatePage } from '#/pages/my-store-activate'

export const Route = createFileRoute('/store-activate')({
  validateSearch: z.object({
    storeId: z.coerce.number().optional(),
  }),
  component: StoreActivatePage,
})
