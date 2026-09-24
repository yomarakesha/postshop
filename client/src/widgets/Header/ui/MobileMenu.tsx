import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { CityModal } from './CityModal'
import { LanguageSelect } from './LanguageSelect'
import { Search } from './Search'
import type { BecomeSellerModalRef } from '#/widgets/BecomeSellerModal'
import { BecomeSellerModal } from '#/widgets/BecomeSellerModal'
import playmarket from '#/shared/assets/image/playmarket.png'
import appstore from '#/shared/assets/image/appstore.png'
// import linkedInIcon from '#/shared/assets/icons/linkedIn.svg'
import SearchIcon from '#/shared/assets/icons/search.svg?react'
import { Logo } from '#/shared/ui/Logo'
import { APP_STORE_URL, CONTACT_PHONE, GOOGLE_PLAY_URL } from '#/shared/constants/contact'
import { phoneHref } from '#/shared/utils/phone'

const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
  <div className="flex flex-col justify-center items-center w-5.5 h-5.5 gap-1.25">
    <motion.span
      className="block w-5 h-0.5 bg-current rounded-full origin-center"
      animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.3 }}
    />
    <motion.span
      className="block w-5 h-0.5 bg-current rounded-full"
      animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.2 }}
    />
    <motion.span
      className="block w-5 h-0.5 bg-current rounded-full origin-center"
      animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.3 }}
    />
  </div>
)

export const MobileMenu = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const becomeSellerRef = useRef<BecomeSellerModalRef>(null)

  const close = () => {
    setIsOpen(false)
    setShowSearch(false)
  }

  return (
    <>
      <button
        onClick={() => setShowSearch(true)}
        className="text-passive2 hover:text-blue-main transition-colors"
        aria-label="Search"
      >
        <SearchIcon height={20} width={20} />
      </button>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-passive2 hover:text-blue-main transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <HamburgerIcon isOpen={isOpen} />
      </button>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="search"
            className="fixed inset-0 bg-white overflow-y-auto no-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 py-3 border-b border-stroke">
              <Search alwaysOpen onClose={() => setShowSearch(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu overlay - opens below the header */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-60 bg-white overflow-y-auto no-scrollbar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="h-(--header-height) px-4 flex items-center justify-between border-b border-stroke">
              <Link to="/" onClick={close}>
                <Logo />
              </Link>

              <button
                onClick={close}
                className="text-passive2 hover:text-blue-main transition-colors"
              >
                <HamburgerIcon isOpen={true} />
              </button>
            </div>

            {/* Language & Region */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-stroke">
              <LanguageSelect />
              <CityModal />
            </div>

            {/* Store link — moved to bottom tab bar */}

            {/* Navigation links */}
            <nav className="px-4 py-4 flex flex-col gap-4 border-b border-stroke">
              <Link
                to="/brands"
                onClick={close}
                className="p3 font-medium text-text hover:text-blue-main transition-colors"
              >
                {t('footer.brands')}
              </Link>
              <Link
                to="/stores"
                onClick={close}
                className="p3 font-medium text-text hover:text-blue-main transition-colors"
              >
                {t('footer.stores')}
              </Link>
              <button
                onClick={() => {
                  close()
                  becomeSellerRef.current?.open()
                }}
                className="p3 font-medium text-text hover:text-blue-main transition-colors text-left"
              >
                {t('footer.becomeSeller')}
              </button>
            </nav>

            {/* Info links */}
            <nav className="px-4 py-4 flex flex-col gap-4 border-b border-stroke">
              <Link
                to="/about-us"
                onClick={close}
                className="p3 font-medium text-text hover:text-blue-main transition-colors"
              >
                {t('footer.aboutUs')}
              </Link>
              <Link
                to="/contact-us"
                onClick={close}
                className="p3 font-medium text-text hover:text-blue-main transition-colors"
              >
                {t('footer.contact')}
              </Link>
              <Link
                to="/terms-of-use"
                onClick={close}
                className="p3 font-medium text-text hover:text-blue-main transition-colors"
              >
                {t('footer.termsOfUse')}
              </Link>
              <Link
                to="/privacy-policy"
                onClick={close}
                className="p3 font-medium text-text hover:text-blue-main transition-colors"
              >
                {t('footer.privacyPolicy')}
              </Link>
            </nav>

            {/* Phone */}
            <div className="px-4 py-4">
              {/* Номер был прошит другим значением и противоречил константе
                  контактов: в меню одно, на странице контактов другое. */}
              <a
                href={phoneHref(CONTACT_PHONE)}
                className="flex items-center gap-2 p3 font-medium text-text"
              >
                <Phone size={18} />
                {CONTACT_PHONE} ({t('contacts.phoneNote')})
              </a>
            </div>
            {/* App Store Badges */}
            <div className="px-4 flex items-center gap-3">
              {/* Были заглушками href="#", хотя в подвале лежат настоящие
                  ссылки: бейджи выглядели рабочими и никуда не вели. */}
              <a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer">
                <img src={playmarket} alt="Google Play" height={40} width={120} />
              </a>
              <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                <img src={appstore} alt="App Store" height={40} width={120} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BecomeSellerModal ref={becomeSellerRef} />
    </>
  )
}
