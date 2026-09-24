import { useTranslation } from 'react-i18next'

import { useToggleUserStatusMutation } from '@/pages/user-edit/model/useToggleUserStatusMutation'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'

interface UserStatusSwitchProps {
  userId: number
  isActive: boolean
}

/**
 * Переключатель блокировки прямо в списке пользователей.
 *
 * Раньше блокировка жила только в карточке (`/users/{id}/edit`): в списке был
 * виден статус, но изменить его оттуда было нельзя — приходилось открывать
 * каждого пользователя отдельно. Со стороны это выглядело так, будто
 * блокировки нет вовсе, и от админки ждали удаления пользователя — операции,
 * которая уносит с собой заказы вместе с продавцовыми копиями продаж.
 *
 * Отдельный компонент, а не разметка внутри map: хук мутации принимает id при
 * создании, а вызывать хуки в цикле нельзя.
 */
export const UserStatusSwitch = ({ userId, isActive }: UserStatusSwitchProps) => {
  const { t } = useTranslation()
  const toggleStatus = useToggleUserStatusMutation(userId)

  return (
    // Строка таблицы — ссылка на карточку: без остановки всплытия щелчок по
    // переключателю заодно уводил бы на страницу редактирования.
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <ConfirmSwitch
        checked={isActive}
        disabled={toggleStatus.isPending}
        onConfirmedChange={() => toggleStatus.mutate(isActive)}
        title={t('confirm.blockUserTitle')}
        description={t('confirm.blockUserText')}
        confirmLabel={t('confirm.blockConfirm')}
      />
    </div>
  )
}
