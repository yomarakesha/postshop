import { Link } from '@tanstack/react-router'
import { Store, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Search } from './ui/Search'
import { CityModal } from './ui/CityModal'
import { LanguageSelect } from './ui/LanguageSelect'
import { NotificationsBell } from './ui/NotificationsBell'
import { StoreSelectModal } from './ui/StoreSelectModal'
import { MobileMenu } from './ui/MobileMenu'
import { Spinner } from '#/shared/ui/Spinner'
import { useProfileStore } from '#/shared/stores/profileStore'
import { RegistrationStatus } from '#/shared/openapi/requests'
import { Logo } from '#/shared/ui/Logo'

export const Header = () => {
  const { t } = useTranslation()

  const profile = useProfileStore((store) => store.profile)
  const isProfileLoading = useProfileStore((store) => store.isProfileLoading)
  const openLoginModal = useProfileStore((store) => store.openLoginModal)
  const approvedShops =
    profile?.shops?.filter((shop) => shop.registration_status === RegistrationStatus.APPROVED) ?? []

  return (
    <header className="sticky top-0 left-0 h-(--header-height) z-40 lg:rounded-xl shadow-md -mx-(--page-horizontal-padding) lg:mx-0 w-[calc(100%+var(--page-horizontal-padding)*2)] lg:w-full">
      <div className="h-full w-full shadow-base flex flex-col">
        {/* Единственный ряд: нижняя серая полоса убрана, город и язык подняты сюда,
            высота шапки увеличена на её счёт. Вертикальные отступы одинаковые
            у всех элементов за счёт items-center на общем контейнере. */}
        <div className="bg-white flex-1 px-4 lg:px-6 flex items-center gap-3 lg:gap-6 lg:rounded-xl">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          {/* Поиск и город — одна пара «что ищу и где»: поле поиска, сразу за ним
              плашка города в том же оформлении. */}
          <div className="hidden lg:flex w-full max-w-110 shrink">
            <Search />
          </div>
          <div className="hidden lg:flex shrink-0">
            <CityModal variant="light" />
          </div>

          <nav className="hidden lg:flex items-center gap-5 shrink-0 ml-auto">
            <LanguageSelect variant="light" />

            {approvedShops.length === 1 && (
              <Link
                to="/my-store/$storeId"
                params={{ storeId: String(approvedShops[0].id) }}
                /* Подписи под иконками убраны: три слова в ряд спорили с
                   выбором языка рядом и не помещались на узких экранах. Смысл
                   иконок остаётся во всплывающей подсказке и в подписи для
                   читалок экрана. Размер поднят до высоты выбора языка, чтобы
                   правая часть шапки читалась одной линией. */
                title={t('header.myStore')}
                aria-label={t('header.myStore')}
                className="flex size-11 items-center justify-center rounded-lg text-passive2 transition-colors hover:bg-gray2 hover:text-blue-main"
              >
                <Store size={26} />
              </Link>
            )}
            {approvedShops.length > 1 && <StoreSelectModal shops={approvedShops} />}

            <NotificationsBell />

            {isProfileLoading ? (
              <div className="flex size-11 items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : profile ? (
              /* Вход определялся как «есть имя И фамилия»: у пользователя,
                 зарегистрированного по SMS и не заполнившего имя, шапка
                 показывала «Войти», хотя он вошёл, и ссылки на профиль не было
                 вообще. Теперь достаточно самого профиля. */
              <Link
                to="/profile"
                title={t('footer.profile')}
                aria-label={t('footer.profile')}
                className="flex size-11 items-center justify-center rounded-lg text-passive2 transition-colors hover:bg-gray2 hover:text-blue-main"
              >
                <User size={26} />
              </Link>
            ) : (
              <button
                onClick={openLoginModal}
                title={t('login.openButton')}
                aria-label={t('login.openButton')}
                className="flex size-11 items-center justify-center rounded-lg text-passive2 transition-colors hover:bg-gray2 hover:text-blue-main"
              >
                <User size={26} />
              </button>
            )}
          </nav>

          {/* ml-auto: без него кнопки прижимались к логотипу слева, а крестик в
              открытом меню стоит справа — вход и выход были в разных местах. */}
          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
