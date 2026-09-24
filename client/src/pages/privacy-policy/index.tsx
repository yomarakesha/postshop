import { useTranslation } from 'react-i18next'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_POSTAL_CODE } from '#/shared/constants/contact'

const sectionKeys = [
  'intro',
  'dataCollected',
  'howWeUse',
  'sharing',
  'cookies',
  'security',
  'retention',
  'rights',
  'children',
  'changes',
  'contact',
] as const

type SectionKey = (typeof sectionKeys)[number]

const sectionParagraphs: Record<SectionKey, Array<string>> = {
  intro: ['p1', 'p2'],
  dataCollected: ['p1', 'p2', 'p3', 'p4'],
  howWeUse: ['p1', 'p2', 'p3', 'p4', 'p5'],
  sharing: ['p1', 'p2', 'p3', 'p4'],
  cookies: ['p1', 'p2'],
  security: ['p1', 'p2'],
  retention: ['p1', 'p2'],
  rights: ['p1', 'p2', 'p3', 'p4'],
  children: ['p1'],
  changes: ['p1', 'p2'],
  contact: ['p1'],
}

export const PrivacyPolicy = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className="mx-auto max-w-4xl flex flex-col gap-10 pb-16">
        <div>
          <h2 className="font-bold">{t('privacyPolicy.title')}</h2>
          <p className="p3 mt-2 text-gray-500">{t('privacyPolicy.lastUpdated')}</p>
        </div>

        {sectionKeys.map((key) => (
          <section key={key} className="flex flex-col gap-3">
            <h3 className="p1 font-semibold">{t(`privacyPolicy.sections.${key}.title`)}</h3>
            {sectionParagraphs[key].map((pKey) => (
              <p key={pKey} className="p3 leading-relaxed text-gray-700">
                {t(`privacyPolicy.sections.${key}.${pKey}`)}
              </p>
            ))}
            {key === 'contact' && (
              <div className="mt-2 flex flex-col gap-1 p3 text-gray-700">
                <span>
                  {t('privacyPolicy.sections.contact.phoneLabel')} {CONTACT_PHONE} (
                  {t('contacts.phoneNote')})
                </span>
                <span>
                  {t('privacyPolicy.sections.contact.emailLabel')} {CONTACT_EMAIL}
                </span>
                <span>
                  {t('privacyPolicy.sections.contact.addressLabel')}{' '}
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
