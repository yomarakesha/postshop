import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SearchPage } from '#/pages/search'

export const Route = createFileRoute('/_base-layout/search/')({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { q } = Route.useSearch()

  return <SearchPage query={q} />
}
