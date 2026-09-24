import { createFileRoute } from '@tanstack/react-router'
import { ContactUsPage } from '#/pages/contact-us'

export const Route = createFileRoute('/contact-us/')({
  component: ContactUsPage,
})
