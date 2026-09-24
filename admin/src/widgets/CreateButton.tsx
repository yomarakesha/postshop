import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { Button, type ButtonProps } from '@/shared/ui/button'

interface Props extends Omit<ButtonProps, 'children'> {
  permissionCode?: string
}

export const CreateButton = ({ permissionCode, ...rest }: Props) => {
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()

  const isShown = !permissionCode || hasPermission(permissionCode)

  if (!isShown) return null

  return (
    <Button {...rest}>
      <Plus className="size-4" />
      {t('create')}
    </Button>
  )
}
