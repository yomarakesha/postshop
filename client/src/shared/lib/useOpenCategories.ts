import { useCallback, useEffect, useState } from 'react'

/**
 * Какие разделы в колонке категорий раскрыты, с памятью между страницами.
 *
 * По умолчанию раскрыты все: колонка для того и нужна, чтобы подразделы было
 * видно сразу. Раньше состояние жило внутри аккордеона и пропадало при каждом
 * переходе — свёрнутый раздел раскрывался снова сам.
 *
 * Хранится ЗАКРЫТОЕ, а не открытое: новый раздел каталога тогда появляется
 * раскрытым, как и все остальные, а не прячется потому, что его не было в
 * сохранённом списке.
 *
 * Чтение из localStorage — только после монтирования: на сервере его нет, и
 * решение по нему в первом рендере разошлось бы с серверной разметкой
 * (ошибка гидратации).
 */
export function useOpenCategories(storageKey: string, ids: Array<string>) {
  const [collapsed, setCollapsed] = useState<Array<string>>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setCollapsed(JSON.parse(saved) as Array<string>)
    } catch {
      // Приватный режим, запрет на хранилище, испорченное значение — колонка
      // просто откроется целиком.
    }
  }, [storageKey])

  const onValueChange = useCallback(
    (open: Array<string>) => {
      const next = ids.filter((id) => !open.includes(id))
      setCollapsed(next)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // Не сохранилось — в этой вкладке состояние всё равно живёт.
      }
    },
    [ids, storageKey],
  )

  return { open: ids.filter((id) => !collapsed.includes(id)), onValueChange }
}
