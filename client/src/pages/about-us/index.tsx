import {
  Banknote,
  CalendarDays,
  CheckCircle,
  Globe2,
  Mail,
  Newspaper,
  Phone,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const stats = [
  { icon: CalendarDays, labelKey: 'aboutUs.foundedLabel', valueKey: 'aboutUs.foundedValue' },
  { icon: ShieldCheck, labelKey: 'aboutUs.upuLabel', valueKey: 'aboutUs.upuValue' },
  { icon: Globe2, labelKey: 'aboutUs.countriesLabel', valueKey: 'aboutUs.countriesValue' },
]

const serviceIcons = [Mail, Newspaper, Banknote, Store, Phone, Receipt, Truck, ShoppingCart]

export const AboutUsPage = () => {
  const { t } = useTranslation()

  const benefits = [
    t('aboutUs.benefit1'),
    t('aboutUs.benefit2'),
    t('aboutUs.benefit3'),
    t('aboutUs.benefit4'),
  ]

  const services = serviceIcons.map((Icon, index) => ({
    Icon,
    label: t(`aboutUs.service${index + 1}`),
  }))

  return (
    <div className="mx-auto max-w-280.5">
      <div className="flex flex-col gap-8 pb-16 lg:gap-10">
        {/* Вводный блок был единственным на странице без карточки: его текст
            упирался в край страницы, тогда как всё остальное содержимое
            утоплено на p-6/p-10. Приводим к общему виду страницы. */}
        <section className="flex flex-col-reverse items-center gap-8 rounded-base bg-white p-6 shadow-base lg:flex-row lg:justify-between lg:gap-12 lg:p-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h2 className="font-bold">{t('aboutUs.title')}</h2>
            <p className="p2 text-passive2">{t('aboutUs.subtitle')}</p>
          </div>

          <img
            src="/illustrations/logo.webp"
            alt="Postshop"
            className="w-full max-w-70 shrink-0 object-contain"
          />
        </section>

        <section className="flex flex-col gap-6 rounded-base bg-white p-6 shadow-base lg:p-10">
          <h3 className="h3 font-bold">{t('aboutUs.historyTitle')}</h3>
          <p className="p3 leading-relaxed text-passive2">{t('aboutUs.historyDescription')}</p>

          <div className="mt-2 grid grid-cols-1 gap-4 min-[1050px]:grid-cols-3">
            {stats.map(({ icon: Icon, labelKey, valueKey }) => (
              <div key={labelKey} className="flex items-start gap-3 rounded-base bg-gray2 p-4">
                <Icon className="size-8 shrink-0 text-blue-main" />
                <div className="flex flex-col">
                  <span className="p2 font-semibold">{t(valueKey)}</span>
                  <span className="t1 text-passive2">{t(labelKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h3 className="h3 font-bold">{t('aboutUs.servicesTitle')}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex flex-col gap-3 rounded-base bg-white p-5 shadow-base"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-blue1 text-blue-main">
                  <Icon className="size-5" />
                </div>
                <p className="p3 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-base bg-white p-6 shadow-base lg:p-10">
          <h3 className="h3 font-bold">{t('aboutUs.postshopTitle')}</h3>
          <p className="p3 leading-relaxed text-passive2">{t('aboutUs.postshopDescription1')}</p>
          <p className="p3 leading-relaxed text-passive2">{t('aboutUs.postshopDescription2')}</p>

          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 p3">
                <CheckCircle className="size-5 shrink-0 text-success" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
