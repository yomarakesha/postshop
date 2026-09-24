import { useEffect, useRef, useState } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import type { BecomeSellerModalRef } from '#/widgets/BecomeSellerModal'
import { ProfileSidebar } from '#/widgets/ProfileSidebar'
import { BecomeSellerModal } from '#/widgets/BecomeSellerModal'
import { useProfileStore } from '#/shared/stores/profileStore'

export const Route = createFileRoute('/profile')({
  component: MyStoreLayout,
})

function MyStoreLayout() {
  const becomeSellerRef = useRef<BecomeSellerModalRef>(null)
  const token = useProfileStore((s) => s.token)
  const openLoginModal = useProfileStore((s) => s.openLoginModal)
  const navigate = useNavigate()

  // Токен хранится только в браузере: на сервере его нет никогда. Если решать
  // по нему, что рисовать, серверная разметка не совпадёт с клиентской и React
  // перерисует всё поддерево заново (ошибка гидратации). Поэтому первый рендер
  // на клиенте повторяет серверный, а решение принимается уже после монтирования.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !token) {
      openLoginModal()
      void navigate({ to: '/' })
    }
  }, [mounted, token, openLoginModal, navigate])

  if (mounted && !token) return null

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        <ProfileSidebar becomeSellerRef={becomeSellerRef} />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
      <BecomeSellerModal ref={becomeSellerRef} />
    </>
  )
}
