import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '#/shared/ui/Input'
import { TextArea } from '#/shared/ui/TextArea'
import { Button } from '#/shared/ui/Button'
import { PhoneNumberInput } from '#/shared/ui/PhoneNumberInput'
import { phoneHref } from '#/shared/utils/phone'
import { useCreateContactUsContactUsPost } from '#/shared/openapi/queries/queries'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_POSTAL_CODE } from '#/shared/constants/contact'
import { settled } from '#/shared/lib/settled'
import { COUNTRY_CODE } from '#/shared/constants/locale'

const MAPS_LINK = 'https://maps.app.goo.gl/a6F4Cuxe5ECd7QvR8'
const MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.5899850264323!2d58.37155317618742!3d37.96335857193842!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f6fff3c053456e7%3A0x2d5093499e12cc61!2sPOSTSHOP!5e0!3m2!1sen!2sde!4v1777659319470!5m2!1sen!2sde" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade'

export const ContactUsPage = () => {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const createContactUs = useCreateContactUsContactUsPost()

  const form = useForm({
    defaultValues: {
      name: '',
      phone: '',
      message: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.name || !value.phone || !value.message) {
        setError(t('contactUs.error'))
        return
      }
      setError('')

      const result = await settled(
        createContactUs.mutateAsync({
          body: {
            name: value.name,
            phone: `${COUNTRY_CODE}${value.phone}`,
            message: value.message,
          },
        }),
      )

      if (result?.data) {
        toast.success(t('contactUs.successTitle'), {
          description: t('contactUs.successDescription'),
        })
        form.reset()
      }
    },
  })

  return (
    <>
      <div className="mx-auto grid max-w-280.5 grid-cols-1 gap-4 pb-16 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col bg-white rounded-base shadow-base p-6 lg:p-8">
          <h1 className="h3 font-bold">{t('contactUs.title')}</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="flex flex-col gap-5 mt-6"
          >
            <form.Field name="name">
              {(field) => (
                <Input
                  label={t('contactUs.name')}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <PhoneNumberInput
                  label={t('contactUs.phone')}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="message">
              {(field) => (
                <TextArea
                  label={t('contactUs.message')}
                  required
                  rows={6}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            {error && <p className="t1 text-failure">{error}</p>}

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full max-w-50"
                  disabled={isSubmitting || createContactUs.isPending}
                >
                  {isSubmitting || createContactUs.isPending
                    ? t('contactUs.submitting')
                    : t('contactUs.submit')}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </div>

        <div className="flex flex-col bg-white rounded-base shadow-base p-6 lg:p-8">
          <h2 className="h3 font-bold">{t('contactUs.infoTitle')}</h2>
          <div className="mt-6 flex flex-1 flex-col gap-3">
            <div className="flex items-start gap-3 rounded-base bg-gray2 p-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-blue-main" />
              <div className="flex flex-col">
                <span className="t1 text-passive2">{t('contactUs.phoneLabel')}</span>
                <a
                  href={phoneHref(CONTACT_PHONE)}
                  className="p3 font-medium transition-colors hover:text-blue-main"
                >
                  {CONTACT_PHONE} ({t('contacts.phoneNote')})
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-base bg-gray2 p-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-blue-main" />
              <div className="flex min-w-0 flex-col">
                <span className="t1 text-passive2">{t('contactUs.email')}</span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="p3 font-medium break-words transition-colors hover:text-blue-main"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-base bg-gray2 p-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-blue-main" />
              <div className="flex flex-col">
                <span className="t1 text-passive2">{t('contactUs.address')}</span>
                {/* Адрес приходил из константы по-русски на всех языках. */}
                <span className="p3 font-medium">
                  <span className="block">{t('contacts.office')}</span>
                  <span className="block">{t('contacts.city')}</span>
                  <span className="block">{CONTACT_POSTAL_CODE}</span>
                </span>
              </div>
            </div>

            {/* Карта была без подложки, а поверх неё висела ссылка «Open in Maps»,
                дублировавшая кнопку под ней. Оставлена одна кнопка. */}
            <div className="mt-1 overflow-hidden rounded-base border border-stroke">
              <iframe
                title="map"
                src={MAPS_EMBED}
                className="block h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3">
              <Button variant="secondary" className="w-full gap-2">
                <ExternalLink className="size-4" />
                {t('contactUs.showOnMap')}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
