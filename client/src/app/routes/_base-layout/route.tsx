import { useRef } from 'react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { CartSidebar } from '#/widgets/CartSidebar'
import { Modal } from '#/shared/ui/Modal'
import { LoginRequired } from '#/widgets/LoginRequired'

export const Route = createFileRoute('/_base-layout')({
  component: BaseLayout,
})

function BaseLayout() {
  const { t } = useTranslation()
  const loginModalRef = useRef<ModalRef>(null)

  return (
    <div className="flex gap-4 min-h-screen">
      <div className="flex-1">
        <Outlet />
      </div>
      <CartSidebar loginModalRef={loginModalRef} />
      <Modal ref={loginModalRef} className="w-137.5 bg-gray2">
        <LoginRequired
          onClose={() => loginModalRef.current?.close()}
          description={t('services.loginRequired.cartDescription')}
        />
      </Modal>
    </div>
  )
}
