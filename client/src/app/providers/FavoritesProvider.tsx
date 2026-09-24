import { createContext, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import type { FavoriteResponse } from '#/shared/openapi/requests/types.gen'
import { Modal } from '#/shared/ui/Modal'
import { LoginRequired } from '#/widgets/LoginRequired'
import { useFavorites } from '#/shared/hooks/useFavorites'

interface FavoritesContextValue {
  toggleFavorite: (productId: number) => void
  isFavorite: (productId: number) => boolean
  favorites: Array<FavoriteResponse> | undefined
}

const FavoritesContext = createContext<FavoritesContextValue>({
  toggleFavorite: () => {},
  isFavorite: () => false,
  favorites: undefined,
})

export const useFavoritesContext = () => useContext(FavoritesContext)

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const loginModalRef = useRef<ModalRef>(null)
  const { toggleFavorite, isFavorite, favorites } = useFavorites(loginModalRef)

  return (
    <FavoritesContext value={{ toggleFavorite, isFavorite, favorites }}>
      {children}
      <Modal ref={loginModalRef} className="w-137.5 bg-gray2">
        <LoginRequired
          onClose={() => loginModalRef.current?.close()}
          description={t('services.loginRequired.favoritesDescription')}
        />
      </Modal>
    </FavoritesContext>
  )
}
