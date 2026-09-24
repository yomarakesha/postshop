import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HeadContent, Link, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Toaster } from 'sonner'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import i18n, { applyStoredLanguage } from '#/app/localization'
import { Header } from '#/widgets/Header'
import { Footer } from '#/widgets/Footer'
import { MobileBottomNav } from '#/widgets/Footer/MobileBottomNav'
import { LoginModal } from '#/widgets/Header/ui/LoginModal'
import { ProfileProvider } from '#/app/providers/ProfileProvider'
import { FavoritesProvider } from '#/app/providers/FavoritesProvider'
import '#/app/setupApiClient'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: i18n.t('meta.title'),
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="t1 font-semibold">{t('notFound.title')}</h1>
      <Link to="/" className="text-blue-main underline">
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}

function DocumentTitle() {
  const { t, i18n: i18nInstance } = useTranslation()

  // Сохранённый язык применяется здесь, а не при инициализации i18n: на сервере
  // localStorage нет, и язык, взятый оттуда при первом рендере, расходился с
  // отданной сервером разметкой.
  useEffect(() => {
    applyStoredLanguage()
  }, [])

  useEffect(() => {
    document.title = t('meta.title')
    // Атрибут был прибит к «en» независимо от выбранного языка: браузер и
    // читалки экрана считали русскую страницу английской.
    document.documentElement.lang = i18nInstance.language
  }, [t, i18nInstance.language])

  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <DocumentTitle />
        <ProfileProvider>
          <FavoritesProvider>
            <Header />
            <main className="main_content">{children}</main>
            <Footer />
            <MobileBottomNav />
            <LoginModal />
          </FavoritesProvider>
        </ProfileProvider>
        <Toaster richColors position="bottom-right" />

        {/* Панель отладки закрывала интерфейс в правом нижнем углу — на узком
            экране она перекрывала нижнюю навигацию. Раньше показывалась в
            продакшене всем покупателям, теперь не показывается вообще, пока её
            не включат явно: VITE_DEVTOOLS=1 в .env.local. */}
        {import.meta.env.DEV && import.meta.env.VITE_DEVTOOLS === '1' && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
