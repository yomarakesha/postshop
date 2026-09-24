import { createFileRoute } from '@tanstack/react-router'
import { TermsOfUsePage } from '#/pages/terms-of-use'

export const Route = createFileRoute('/terms-of-use/')({
  component: TermsOfUsePage,
})
