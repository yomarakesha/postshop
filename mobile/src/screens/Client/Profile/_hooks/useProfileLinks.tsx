import { useConfirmationModal } from '@/store/useConfirmationModal'
import useShopStore from '@/store/useShopStore'
import { useUserStore } from '@/store/useUserStore'
import useAppStore from '@/store/useAppStore'
import { notificationApi } from '@/api/notificationApi'
import { SHOW_SERVER_SETTING } from '@/constants/build'
import BellSimpleIcon from '@assets/icons/bell-simple-outline.svg'
import HeartIcon from '@assets/icons/heart.svg'
import ListChecksIcon from '@assets/icons/list-checks.svg'
import SignOut from '@assets/icons/sign-out.svg'
import StoreFrontIcon from '@assets/icons/store-front.svg'
import TranslateIcon from '@assets/icons/translate.svg'
import CircleInfoIcon from '@assets/icons/circle-info.svg'
import ServerIcon from '@assets/icons/server.svg'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useMemo, useRef, useCallback } from 'react'

import { langs } from '@/constants/langs'
import { TFunction } from 'i18next'

type Link = {
  title: string
  icon: SvgType
  onPress: () => void
  isDanger?: boolean
  value?: string
  /** Пункт без экрана: рисуется приглушённым, с бейджем «Скоро», не нажимается. */
  isComingSoon?: boolean
  /** Показывать шеврон — только у пунктов, которые действительно куда-то ведут. */
  hasChevron?: boolean
}

type Section = {
  title: string
  data: Link[]
  isVisible: boolean
}

const useProfileLinks = (t: TFunction, language: AppLang) => {
  const router = useRouter()
  const langSheetRef = useRef<TrueSheet>(null)
  const queryClient = useQueryClient()
  const user = useUserStore((s) => s.user)
  const apiUrl = useAppStore((s) => s.apiUrl)
  // Счётчик непрочитанных — только для вошедших: гостю уведомления не
  // приходят, а запрос без токена вернул бы 401.
  const { data: unread } = notificationApi.useUnreadCount(!!user)

  const handleLangChange = useCallback(() => {
    langSheetRef.current?.present()
  }, [])

  const onLogOut = useCallback(() => {
    useConfirmationModal.setState({
      isOpen: true,
      title: t('profile.logoutConfirm.title'),
      description: t('profile.logoutConfirm.description'),
      confirmTitle: t('common.yes'),
      cancelTitle: t('common.no'),
      type: 'danger',
      Icon: SignOut,
      onConfirm: () => {
        useUserStore.setState({
          jwt: null,
          user: null,
          isGuest: true,
        })
        useShopStore.setState({
          activeShopBaseId: null,
          shop: null,
        })
        queryClient.clear()
        router.replace({
          pathname: '/(client-tabs)/(home)',
        })
      },
    })
  }, [router, queryClient, t])

  const links = useMemo<Section[]>(
    () => [
      {
        title: t('profile.sections.settings'),
        data: [
          {
            title: t('profile.links.favorites'),
            icon: HeartIcon,
            onPress: () => router.push('/favorites'),
            hasChevron: true,
          },
          {
            title: t('profile.links.becomeSeller'),
            icon: StoreFrontIcon,
            onPress: () => router.push('/become-seller-onboarding'),
            hasChevron: true,
          },
          {
            // Экрана уведомлений не было: onPress оставался пустым, и пункт
            // выглядел рабочим, но молча ничего не делал. Теперь ведёт в
            // список, а число непрочитанных видно прямо здесь.
            title: t('profile.links.notifications'),
            icon: BellSimpleIcon,
            onPress: () => router.push('/notifications'),
            value: unread?.count ? String(unread.count) : undefined,
            hasChevron: true,
          },
          {
            title: t('profile.links.language'),
            icon: TranslateIcon,
            onPress: handleLangChange,
            value: langs.find((l) => l.key === language)?.value,
          },
          {
            title: t('profile.links.termsOfUse'),
            icon: ListChecksIcon,
            onPress: () => router.push('/(legal)/terms-of-use'),
            hasChevron: true,
          },
          {
            // Экран «Политика конфиденциальности» существует и переведён,
            // но из профиля на него не было ни одной ссылки.
            title: t('profile.links.privacyPolicy'),
            icon: CircleInfoIcon,
            onPress: () => router.push('/(legal)/privacy-policy'),
            hasChevron: true,
          },
          // Пункт «Сервер» — только для тестовых сборок: покупателю выбирать
          // адрес незачем. Условие — в constants/build.
          ...(SHOW_SERVER_SETTING
            ? [
                {
                  title: t('profile.links.server'),
                  icon: ServerIcon,
                  onPress: () => router.push('/server-setup'),
                  // Адрес виден прямо в списке: иначе непонятно, куда
                  // приложение ходит сейчас, а «сеть недоступна» выглядит
                  // одинаково и при лежащем сервере, и при опечатке в адресе.
                  value: apiUrl.replace(/^https?:\/\//, ''),
                  hasChevron: true,
                },
              ]
            : []),
        ],
        isVisible: true,
      },
      {
        title: t('profile.sections.others'),
        data: [
          {
            title: t('profile.links.logout'),
            icon: SignOut,
            onPress: onLogOut,
            isDanger: true,
          },
          // Пункт «Удалить аккаунт» намеренно не показывается: на бэкенде нет
          // соответствующего эндпоинта, а неработающая кнопка удаления хуже,
          // чем её отсутствие. Ключ profile.links.deleteAccount уже переведён
          // и ждёт реализации.
        ],
        isVisible: !!user,
      },
    ],
    [router, onLogOut, handleLangChange, language, user, apiUrl, unread, t],
  )

  return { links, langSheetRef }
}

export default useProfileLinks
