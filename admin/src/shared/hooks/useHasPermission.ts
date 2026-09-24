import { useProfileStore } from '../store/profileStore'

/**
 * Проверка права текущего пользователя.
 *
 * Раньше отсутствие кода означало «разрешено»: разделы, которым право просто
 * забыли указать (магазины, заказы, пункты выдачи, модерация товаров, заявки
 * продавцов, обращения, сообщение о доставке), видел любой вошедший. Теперь
 * пустой код — это запрет: пропущенная разметка становится заметной сразу, а
 * не превращается в тихую дыру.
 *
 * Список прав в хранилище может оказаться пустым или неопределённым до
 * загрузки профиля, и вызов includes на undefined ронял весь сайдбар — отсюда
 * приведение к массиву.
 */
export const useHasPermission = () => {
  const permissions = useProfileStore((store) => store.permissions)

  const hasPermission = (permissionCode: string | undefined) => {
    if (!permissionCode) return false
    return Array.isArray(permissions) && permissions.includes(permissionCode)
  }

  return {
    hasPermission,
  }
}
