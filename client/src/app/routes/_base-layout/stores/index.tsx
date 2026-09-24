import { createFileRoute } from '@tanstack/react-router'
import { StoresPage } from '#/pages/stores'

export const Route = createFileRoute('/_base-layout/stores/')({
  component: StoresPage,
})
