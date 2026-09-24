import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { UserResponse } from '#/shared/openapi/requests'
import { RegistrationStatus } from '#/shared/openapi/requests'
import { useMeAuthMeGetKey } from '#/shared/openapi/queries'
import { useProfileStore } from '#/shared/stores/profileStore'
import { Button } from '#/shared/ui/Button'
import { StoreTodoList } from '#/widgets/StoreTodoList'

export const StoreActivatePage = () => {
  const { t } = useTranslation()
  const { storeId } = useSearch({ from: '/store-activate' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Незаполненный магазин уводится сюда, поэтому именно здесь владелец должен
  // узнать, что его заявку отклонили и почему: раньше поля для причины не было
  // вовсе, и после подачи наступала тишина.
  const shop = useProfileStore((state) => state.profile?.shops?.find((x) => x.id === storeId))
  const reason = shop?.registration_comment
  const isRejected = shop?.registration_status === RegistrationStatus.REJECTED
  const isSuspended = shop?.registration_status === RegistrationStatus.SUSPENDED
  // Строка про ожидание проверки выводилась всегда. Одобренному магазину она
  // сообщала, что он ещё на проверке, а отклонённому — противоречила красной
  // плашке с причиной отказа прямо над ней.
  const isPending = shop?.registration_status === RegistrationStatus.PENDING

  return (
    <div className="mx-auto flex w-full max-w-180 flex-col gap-6">
      {(isRejected || isSuspended) && (
        <div className="rounded-base border border-failure bg-failure/10 px-4 py-3">
          <p className="t1 font-medium text-text">
            {isRejected ? t('myStore.notice.rejected') : t('myStore.notice.suspended')}
          </p>
          {reason && <p className="t1 mt-1 text-text">{reason}</p>}
        </div>
      )}
      <StoreTodoList
        storeId={storeId!}
        title={t('storeActivate.title')}
        subtitle={t('storeActivate.subtitle')}
        footer={(allCompleted) =>
          allCompleted ? (
            /* Кнопка называлась «Активировать магазин», но ничего не
               отправляла: только перечитывала профиль и переходила в кабинет.
               Отправлять и нечего — заявка создаётся вместе с магазином и уже
               ждёт проверки, а менять статус регистрации может только
               платформа. Поэтому кнопка названа тем, что делает, а про
               проверку сказано отдельной строкой. */
            <Button
              onClick={async () => {
                await queryClient.invalidateQueries({ queryKey: [useMeAuthMeGetKey] })
                const freshProfile = queryClient.getQueryData<UserResponse>([useMeAuthMeGetKey, {}])
                if (freshProfile) {
                  useProfileStore.getState().setProfile(freshProfile)
                }
                navigate({
                  to: '/my-store/$storeId',
                  params: { storeId: String(storeId) },
                })
              }}
            >
              {t('storeActivate.goToStore')}
            </Button>
          ) : null
        }
      />

      {/* Раньше нажатие «Активировать магазин» создавало ощущение отправки на
          модерацию, которой не происходило. Теперь про проверку сказано прямо —
          но только пока проверка действительно идёт. */}
      {isPending && <p className="t1 text-passive2">{t('storeActivate.underReview')}</p>}
    </div>
  )
}
