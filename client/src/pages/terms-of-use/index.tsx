import { useTranslation } from 'react-i18next'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_POSTAL_CODE } from '#/shared/constants/contact'

const sectionKeys = [
  'general',
  'accounts',
  'orders',
  'delivery',
  'sellers',
  'returns',
  'intellectual',
  'liability',
  'privacy',
  'contact',
] as const

type SectionKey = (typeof sectionKeys)[number]

const sectionParagraphs: Record<SectionKey, Array<string>> = {
  general: ['p1', 'p2', 'p3'],
  accounts: ['p1', 'p2', 'p3'],
  orders: ['p1', 'p2', 'p3'],
  delivery: ['p1', 'p2', 'p3'],
  sellers: ['p1', 'p2', 'p3'],
  returns: ['p1', 'p2', 'p3'],
  intellectual: ['p1', 'p2'],
  liability: ['p1', 'p2'],
  privacy: ['p1', 'p2'],
  contact: ['p1'],
}

export const TermsOfUsePage = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className="mx-auto max-w-4xl flex flex-col gap-10 pb-16">
        <div>
          <h2 className="font-bold">{t('termsOfUse.title')}</h2>
          <p className="p3 mt-2 text-gray-500">{t('termsOfUse.lastUpdated')}</p>
        </div>

        {sectionKeys.map((key) => (
          <section key={key} className="flex flex-col gap-3">
            <h3 className="p1 font-semibold">{t(`termsOfUse.sections.${key}.title`)}</h3>
            {sectionParagraphs[key].map((pKey) => (
              <p key={pKey} className="p3 leading-relaxed text-gray-700">
                {t(`termsOfUse.sections.${key}.${pKey}`)}
              </p>
            ))}
            {key === 'contact' && (
              <div className="mt-2 flex flex-col gap-1 p3 text-gray-700">
                <span>
                  {t('termsOfUse.sections.contact.phoneLabel')} {CONTACT_PHONE} (
                  {t('contacts.phoneNote')})
                </span>
                <span>
                  {t('termsOfUse.sections.contact.emailLabel')} {CONTACT_EMAIL}
                </span>
                <span>
                  {t('termsOfUse.sections.contact.addressLabel')}{' '}
                  {`${t('contacts.office')}, ${t('contacts.city')}, ${CONTACT_POSTAL_CODE}`}
                </span>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}
